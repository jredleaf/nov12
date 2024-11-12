export interface Task {
  id: string;
  task: string;
  timer: number | null;
  user_name?: string;
  created_at?: string;
  completed?: boolean;
  completed_at?: string;
  number_of_likes?: number;
  number_of_celebrations?: number;
  timer_used?: boolean;
  timer_length_used?: number | null;
  account_id?: string;
  meeting_id?: string;
}

export interface CompletedTask {
  id: string;
  task: string;
  completedAt: string;
  completedBy: string;
  reactions?: {
    hearts: number;
    celebrations: number;
  };
}

export interface User {
  id: string;
  account_id: string;
  meeting_id: string | null;
  name: string;
  created_at: string;
}

declare global {
  interface Window {
    zoomSdk?: any;
  }
  
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }
}