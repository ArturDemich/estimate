import { createSlice } from '@reduxjs/toolkit';
import { getPlantsDetailsDB, getPlantsNameDB, getPlantsNameThunk, getStoragesThunk } from './thunks';
import { DataSlice } from './stateServiceTypes';


const initialState: DataSlice = {
  digStorages: [],
  searchPlantName: [],
  dBPlantsName: [],
  dBPlantDetails: []
};


const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStoragesThunk.fulfilled, (state, action) => {
        state.digStorages = action.payload;
        console.log('dataSlice __ getStoragesThunk', state.digStorages)
      })

      .addCase(getPlantsNameThunk.fulfilled, (state, action) => {
        state.searchPlantName = action.payload;
        console.log('dataSlice __getPlantsNameThunk',)
      })

      .addCase(getPlantsNameDB.fulfilled, (state, action) => {
        state.dBPlantsName = action.payload;
        console.log('dataSlice getPlantsNameDB',)
      })

      .addCase(getPlantsDetailsDB.fulfilled, (state, action) => {
        state.dBPlantDetails = action.payload;
        console.log('dataSlice getPlantsNameDB', state.dBPlantDetails)
      })
  },
});

export default dataSlice.reducer;
