import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getPlantsDetailsDB, getPlantsNameDB, getPlantsNameThunk, getStoragesThunk } from './thunks';
import { DataSlice, PlantDetails } from './stateServiceTypes';


const initialState: DataSlice = {
  digStorages: [],
  searchPlantName: [],
  dBPlantsName: [],
  dBPlantDetails: [],
  existPlantProps: null,
};


const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setExistPlantProps(state, action: PayloadAction<PlantDetails | null>) {
      state.existPlantProps = action.payload;
      console.log('dataSlice __ setExistPlantProps', state.existPlantProps)
    },
    updateLocalCharacteristic: (state, action: PayloadAction<{ id: number, quantity: number }>) => {
      const index = state.dBPlantDetails.findIndex((char) => char.id === action.payload.id);
      if (index !== -1) {
          state.dBPlantDetails[index].quantity = action.payload.quantity;
      }
      console.log('dataSlice __ updateLocalCharacteristic', state.dBPlantDetails[index].quantity)
  }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStoragesThunk.fulfilled, (state, action) => {
        state.digStorages = action.payload;
        console.log('dataSlice __ getStoragesThunk', )
      })

      .addCase(getPlantsNameThunk.fulfilled, (state, action) => {
        state.searchPlantName = action.payload;
        console.log('dataSlice __getPlantsNameThunk', state.searchPlantName)
      })

      .addCase(getPlantsNameDB.fulfilled, (state, action) => {
        state.dBPlantsName = action.payload;
        console.log('dataSlice getPlantsNameDB',)
      })

      .addCase(getPlantsDetailsDB.fulfilled, (state, action) => {
        state.dBPlantDetails = action.payload;
        console.log('dataSlice getPlantsNameDB', )
      })
  },
});

export const { setExistPlantProps, updateLocalCharacteristic } = dataSlice.actions;
export default dataSlice.reducer;
