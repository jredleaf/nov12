import { create } from 'zustand';

interface GlobalTimerState {
  runningTimerId: string | null;
  runningTime: number | null;
  setRunningTimer: (id: string | null, time?: number | null) => void;
  clearTimer: () => void;
}

export const useGlobalTimer = create<GlobalTimerState>((set) => ({
  runningTimerId: null,
  runningTime: null,
  setRunningTimer: (id, time = null) => set({ runningTimerId: id, runningTime: time }),
  clearTimer: () => set({ runningTimerId: null, runningTime: null })
}));