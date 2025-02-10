import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '@/redux/dataSlice';
import loginReducer from '@/redux/authSlice';

export const store = configureStore({
  reducer: {
    data: dataReducer, 
    login: loginReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
