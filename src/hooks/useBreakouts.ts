import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { useUser } from './useUser';

export const useBreakouts = () => {
  const [joiningBreakout, setJoiningBreakout] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (user?.account_id && user?.meeting_id) {
        await fetchBreakoutStatus();
        setupRealtimeSubscription();
      }
      if (mounted) {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [user?.account_id, user?.meeting_id]);

  const setupRealtimeSubscription = () => {
    if (!user?.account_id || !user?.meeting_id) return;

    const breakoutChannel = supabase
      .channel('breakout-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breakouts',
          filter: `account_id=eq.${user.account_id} AND meeting_id=eq.${user.meeting_id}`
        },
        (payload) => {
          if (payload.new) {
            setJoiningBreakout(payload.new.joining_breakout);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(breakoutChannel);
    };
  };

  const fetchBreakoutStatus = async () => {
    if (!user?.account_id || !user?.meeting_id) return;

    try {
      const { data, error } = await supabase
        .from('breakouts')
        .select('joining_breakout')
        .eq('account_id', user.account_id)
        .eq('meeting_id', user.meeting_id)
        .single();

      if (error) {
        console.error('Error fetching breakout status:', error.message);
        return;
      }

      if (data) {
        setJoiningBreakout(!!data.joining_breakout);
      } else {
        await createBreakoutStatus();
      }
    } catch (error) {
      console.error('Error in fetchBreakoutStatus:', error);
    }
  };

  const createBreakoutStatus = async () => {
    if (!user?.id || !user?.account_id || !user?.meeting_id || !user?.name) return;

    try {
      const { error } = await supabase
        .from('breakouts')
        .insert([{
          user_id: user.id,
          account_id: user.account_id,
          meeting_id: user.meeting_id,
          user_name: user.name,
          joining_breakout: true
        }]);

      if (error) {
        console.error('Error creating breakout status:', error.message);
        return;
      }

      setJoiningBreakout(true);
    } catch (error) {
      console.error('Error in createBreakoutStatus:', error);
    }
  };

  const toggleBreakoutStatus = async () => {
    if (!user?.account_id || !user?.meeting_id || loading) return;

    setLoading(true);
    try {
      const newStatus = !joiningBreakout;

      const { error } = await supabase
        .from('breakouts')
        .update({
          joining_breakout: newStatus,
          user_name: user.name,
          updated_at: new Date().toISOString()
        })
        .eq('account_id', user.account_id)
        .eq('meeting_id', user.meeting_id);

      if (error) {
        console.error('Error toggling breakout status:', error.message);
        return;
      }

      setJoiningBreakout(newStatus);
    } catch (error) {
      console.error('Error in toggleBreakoutStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    joiningBreakout,
    loading,
    toggleBreakoutStatus
  };
};