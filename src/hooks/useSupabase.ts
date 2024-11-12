import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import type { Task, CompletedTask } from '../types';
import { useUser } from './useUser';

const useSupabase = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!user?.account_id) {
        if (mounted) {
          setTasks([]);
          setCompletedTasks([]);
          setLoading(false);
        }
        return;
      }

      try {
        // Start with empty tasks for new session
        setTasks([]);
        setupRealtimeSubscriptions();
      } catch (err) {
        console.warn('Error initializing:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [user?.account_id]);

  const setupRealtimeSubscriptions = () => {
    if (!user?.account_id) return;

    const tasksSubscription = supabase
      .channel('tasks-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'Tasks',
          filter: `account_id=eq.${user.account_id}`
        }, 
        (payload) => {
          if (payload.new && (payload.new as Task).completed) {
            const completedTask = payload.new as Task;
            setCompletedTasks(current => [{
              id: completedTask.id,
              task: completedTask.task,
              completedAt: completedTask.completed_at || new Date().toISOString(),
              completedBy: completedTask.user_name || 'Anonymous',
              reactions: {
                hearts: completedTask.number_of_likes || 0,
                celebrations: completedTask.number_of_celebrations || 0
              }
            }, ...current].slice(0, 50)); // Keep last 50 completed tasks
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  };

  const addTask = async (content: string) => {
    if (!content.trim() || tasks.length >= 3 || !user?.account_id) return null;
    
    try {
      const newTask = {
        task: content.trim(),
        user_name: user.name,
        account_id: user.account_id,
        meeting_id: user.meeting_id,
        created_at: new Date().toISOString(),
        number_of_likes: 0,
        number_of_celebrations: 0,
        timer_used: false,
        timer_length_used: null,
        completed: false
      };

      const { data, error } = await supabase
        .from('Tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      
      // Update local tasks state
      setTasks(current => [...current, data]);
      return data;
    } catch (err) {
      console.warn('Error adding task:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  const updateTaskTimer = async (taskId: string, timerLength: number) => {
    if (!user?.account_id) return;

    try {
      const { error } = await supabase
        .from('Tasks')
        .update({
          timer_used: true,
          timer_length_used: timerLength
        })
        .eq('id', taskId)
        .eq('account_id', user.account_id);

      if (error) throw error;
      
      // Update local tasks state
      setTasks(current =>
        current.map(task =>
          task.id === taskId
            ? { ...task, timer_used: true, timer_length_used: timerLength }
            : task
        )
      );
    } catch (err) {
      console.warn('Error updating timer:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user?.account_id) return;

    try {
      const completedTask = tasks.find(t => t.id === taskId);
      if (!completedTask) return;

      const { error } = await supabase
        .from('Tasks')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          user_name: user.name
        })
        .eq('id', taskId)
        .eq('account_id', user.account_id);

      if (error) throw error;

      // Update local states
      setTasks(current => current.filter(task => task.id !== taskId));
      
      // Add to completed tasks immediately for better UX
      setCompletedTasks(current => [{
        id: completedTask.id,
        task: completedTask.task,
        completedAt: new Date().toISOString(),
        completedBy: user.name,
        reactions: {
          hearts: 0,
          celebrations: 0
        }
      }, ...current].slice(0, 50));
    } catch (err) {
      console.warn('Error completing task:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addReaction = async (taskId: string, type: 'hearts' | 'celebrations') => {
    if (!user?.account_id) return;

    try {
      const field = type === 'hearts' ? 'number_of_likes' : 'number_of_celebrations';
      const { data: task } = await supabase
        .from('Tasks')
        .select(field)
        .eq('id', taskId)
        .eq('account_id', user.account_id)
        .single();

      if (!task) throw new Error('Task not found');

      const { error } = await supabase
        .from('Tasks')
        .update({
          [field]: (task[field] || 0) + 1
        })
        .eq('id', taskId)
        .eq('account_id', user.account_id);

      if (error) throw error;

      // Update local completed tasks state
      setCompletedTasks(current =>
        current.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              reactions: {
                ...task.reactions,
                [type]: (task.reactions?.[type] || 0) + 1
              }
            };
          }
          return task;
        })
      );
    } catch (err) {
      console.warn('Error adding reaction:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return {
    tasks,
    completedTasks,
    loading,
    error,
    addTask,
    completeTask,
    addReaction,
    updateTaskTimer
  };
};

export default useSupabase;