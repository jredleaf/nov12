import { supabase } from './supabase/client';

export interface User {
  id: string;
  account_id: string;
  meeting_id: string;
  name: string;
  created_at: string;
}

export const getUser = async (accountId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('account_id', accountId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
};

export const createUser = async (accountId: string, meetingId: string, name: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        account_id: accountId,
        meeting_id: meetingId,
        name: name
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
};

export const updateUserName = async (accountId: string, name: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .update({ name })
    .eq('account_id', accountId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user name:', error);
    return null;
  }

  return data;
};