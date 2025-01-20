import { createSlice } from '@reduxjs/toolkit';
import { getStoragesThunk } from './thunks';

const initialState = {
    digStorages: [],
    status: 'idle'
  };
  

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStoragesThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getStoragesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.digStorages = action.payload;
        console.log('dataSlice', state.digStorages)
      })
      .addCase(getStoragesThunk.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default dataSlice.reducer;
