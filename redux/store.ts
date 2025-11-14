import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '@/redux/dataSlice';
import loginReducer from '@/redux/authSlice';
import photoReducer from '@/redux/photoSlice';

export const store = configureStore({
  reducer: {
    data: dataReducer, 
    login: loginReducer,
    photos: photoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
