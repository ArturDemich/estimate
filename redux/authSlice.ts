import { createSlice } from '@reduxjs/toolkit';
import {loginThunk } from './thunks';
import { AuthSlice } from './stateServiceTypes';


const initialState: AuthSlice = {
    status: 'idle',
    isAuthenticated: false,
    token: {},
  };
  

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout: (state) => {
        state.token = {};
        state.isAuthenticated = false;
        state.status = 'idle';
        console.log('logout', state.token)
      },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
        state.isAuthenticated = true;
        console.log('loginSlice', state.token)
      })
      .addCase(loginThunk.rejected, (state) => {
        state.status = 'failed';
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = loginSlice.actions;
export default loginSlice.reducer;
