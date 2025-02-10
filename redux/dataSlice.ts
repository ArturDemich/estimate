import { createSlice } from '@reduxjs/toolkit';
import { getStoragesThunk } from './thunks';

export enum LoadingStatus {
  Loading = 'Loading',
  Succeeded = 'Succeeded',
  Failed = 'Failed'
};

export interface Storages {
  id: string;
  name: string;
  is_group: boolean;
  id_parent: string;
};
export interface DataSlice {
  digStorages: Storages[];
  status: LoadingStatus | string;
};


const initialState: DataSlice = {
  digStorages: [],
  status: 'idle',
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
      })
      .addCase(getStoragesThunk.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default dataSlice.reducer;
