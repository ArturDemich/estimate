import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getPlantsDetailsDB, getPlantsNameDB, getPlantsNameThunk, getStoragesThunk } from './thunks';
import { DataSlice, Label, PlantDetails } from './stateServiceTypes';


const initialState: DataSlice = {
  digStorages: [],
  searchPlantName: [],
  dBPlantsName: [],
  dBPlantDetails: [],
  existPlantProps: null,
  labelData: null,
};


const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setExistPlantProps(state, action: PayloadAction<PlantDetails | null>) {
      state.existPlantProps = action.payload;
      console.log('dataSlice __ setExistPlantProps', )
    },
    updateLocalCharacteristic: (state, action: PayloadAction<{ id: number, currentQty: number }>) => {
      const index = state.dBPlantDetails.findIndex((char) => char.id === action.payload.id);
      if (index !== -1) {
        state.dBPlantDetails[index].currentQty = action.payload.currentQty;
      }
      console.log('dataSlice __ updateLocalCharacteristic', state.dBPlantDetails[index].currentQty)
    },
    setLabelPrint(state, action: PayloadAction<Label | null>) {
      state.labelData = action.payload;
      console.log('dataSlice __ setLabelPrint', state.labelData)
    },
    logOut(state) {
      state.digStorages = [];
      state.searchPlantName = [];
      state.dBPlantsName = [];
      state.dBPlantDetails = [];
      state.existPlantProps = null;
      state.labelData = null;
      console.log('dataSlice __ logOut')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStoragesThunk.fulfilled, (state, action) => {
        state.digStorages = action.payload;
        console.log('dataSlice __ getStoragesThunk',)
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
        console.log('dataSlice getPlantsNameDB',)
      })
  },
});

export const { setExistPlantProps, updateLocalCharacteristic, setLabelPrint, logOut } = dataSlice.actions;
export default dataSlice.reducer;
