import { configureStore } from '@reduxjs/toolkit';
import dataSlice from '@/redux/slice';

export const store = configureStore({
  reducer: {
    data: dataSlice, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDipatch = typeof store.dispatch;
