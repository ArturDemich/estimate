import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getNewVersionThunk, getPlantsDetailsDB, getPlantsNameDB, getPlantsNameThunk, getStoragesThunk } from './thunks';
import { DataSlice, Label, PlantDetails } from './stateServiceTypes';
import { IBLEPrinter } from '@conodene/react-native-thermal-receipt-printer-image-qr';


const initialState: DataSlice = {
  digStorages: [],
  searchPlantName: [],
  dBPlantsName: [],
  dBPlantDetails: [],
  existPlantProps: null,
  labelData: null,
  pairedDevices: [],
  connectedPrinter: null,
  docComment: '',
  autoPrint: false,
  newVersion: null,
  docSent: 0,
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
    setDevices(state, action: PayloadAction<IBLEPrinter[]>) {
      state.pairedDevices = action.payload;
      console.log('dataSlice __ setDevices', state.pairedDevices)
    },
    connectPrinter(state, action: PayloadAction<IBLEPrinter | null>) {
      state.connectedPrinter = action.payload;
      console.log('dataSlice __ connectPrinter', state.connectedPrinter)
    },
    setDocComment(state, action: PayloadAction<string>) {
      state.docComment = action.payload;
      console.log('dataSlice __ setDocComment', state.docComment)
    },
    setAutoPrint(state, action: PayloadAction<boolean>) {
      state.autoPrint = action.payload;
      console.log('dataSlice __ setAutoPrint', state.autoPrint)
    },
    setDocSent(state, action: PayloadAction<number>) {
      state.docSent = action.payload;
      console.log('dataSlice __ setDocSent', state.docSent)
    },
    clearDataState(state) {
      state.digStorages = [];
      state.searchPlantName = [];
      state.dBPlantsName = [];
      state.dBPlantDetails = [];
      state.existPlantProps = null;
      state.labelData = null;
      state.pairedDevices = [];
      state.connectedPrinter = null;
      state.docComment = '';
      state.autoPrint = false;
      state.newVersion = null;
      state.docSent = 0;
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

      .addCase(getNewVersionThunk.fulfilled, (state, action) => {
        state.newVersion = action.payload;
        console.log('dataSlice getNewVersionThunk', state.newVersion)
      })
  },
});

export const { setExistPlantProps, updateLocalCharacteristic, setLabelPrint, setDevices, 
  connectPrinter, setDocComment, setAutoPrint, clearDataState, setDocSent } = dataSlice.actions;
export default dataSlice.reducer;
