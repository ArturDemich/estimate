import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getNewVersionThunk, getPlantsDetailsDB, getPlantsNameDB, getPlantsNameThunk, getStoragesThunk, setSortByEmptyThunk } from './thunks';
import { DataSlice, Label, PlantDetails, Storages } from './stateServiceTypes';
import { IBLEPrinter } from '@conodene/react-native-thermal-receipt-printer-image-qr';


const initialState: DataSlice = {
  digStorages: [],
  searchPlantName: [],
  dBPlantsName: [],
  sortingPlantList: [],
  dBPlantDetails: [],
  existPlantProps: null,
  labelData: null,
  pairedDevices: [],
  connectedPrinter: null,
  docComment: '',
  autoPrint: false,
  newVersion: null,
  docSent: 0,
  newDetailBarcode: null,
  currentStorage: null,
};


const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setExistPlantProps(state, action: PayloadAction<PlantDetails | null>) {
      state.existPlantProps = action.payload;
      //console.log('dataSlice __ setExistPlantProps', )
    },
    setCurrentStoage(state, action: PayloadAction<Storages | null>) {
      state.currentStorage = action.payload;
      //console.log('dataSlice __ setCurrentStoage', )
    },
    updateLocalCharacteristic: (state, action: PayloadAction<{ id: number, currentQty: number }>) => {
      const index = state.dBPlantDetails.findIndex((char) => char.id === action.payload.id);
      if (index !== -1) {
        state.dBPlantDetails[index].currentQty = action.payload.currentQty;
      }
      //console.log('dataSlice __ updateLocalCharacteristic', state.dBPlantDetails[index].currentQty)
    },
    updateLocalFreeQty: (state, action: PayloadAction<{ id: number, freeQty: number }>) => {
      const index = state.dBPlantDetails.findIndex((char) => char.id === action.payload.id);
      if (index !== -1) {
        state.dBPlantDetails[index].freeQty = action.payload.freeQty;
      }
      //console.log('dataSlice __ updateLocalCharacteristic', state.dBPlantDetails[index].currentQty)
    },
    updateLocalComment: (state, action: PayloadAction<{ id: number, value: string }>) => {
      const index = state.dBPlantDetails.findIndex((char) => char.id === action.payload.id);
      if (index !== -1) {
        state.dBPlantDetails[index].plantComment = action.payload.value;
      }
      //console.log('dataSlice __ updateLocalCharacteristic', state.dBPlantDetails[index].currentQty)
    },
    setLabelPrint(state, action: PayloadAction<Label | null>) {
      state.labelData = action.payload;
     // console.log('dataSlice __ setLabelPrint', state.labelData)
    },
    setDevices(state, action: PayloadAction<IBLEPrinter[]>) {
      state.pairedDevices = action.payload;
     // console.log('dataSlice __ setDevices', state.pairedDevices)
    },
    connectPrinter(state, action: PayloadAction<IBLEPrinter | null>) {
      state.connectedPrinter = action.payload;
     // console.log('dataSlice __ connectPrinter', state.connectedPrinter)
    },
    setDocComment(state, action: PayloadAction<string>) {
      state.docComment = action.payload;
     // console.log('dataSlice __ setDocComment', state.docComment)
    },
    setAutoPrint(state, action: PayloadAction<boolean>) {
      state.autoPrint = action.payload;
     // console.log('dataSlice __ setAutoPrint', state.autoPrint)
    },
    setDocSent(state, action: PayloadAction<number>) {
      state.docSent = action.payload;
     // console.log('dataSlice __ setDocSent', state.docSent)
    },
    setNewDetailBarcode(state, action: PayloadAction<string | null>) {
      state.newDetailBarcode = action.payload;
     // console.log('dataSlice __ newDetailBarcode', state.newDetailBarcode)
    },
    cleaneDBPlantsName(state) {
      state.dBPlantsName = []
      state.sortingPlantList = []
    },
    cleaneSortList(state) {
      state.sortingPlantList = []
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
      state.newDetailBarcode = null;
      state.currentStorage = null;
     // console.log('dataSlice __ logOut')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStoragesThunk.fulfilled, (state, action) => {
        state.digStorages = action.payload;
       // console.log('dataSlice __ getStoragesThunk',)
      })

      .addCase(getPlantsNameThunk.fulfilled, (state, action) => {
        state.searchPlantName = action.payload;
       // console.log('dataSlice __getPlantsNameThunk',)
      })

      .addCase(getPlantsNameDB.fulfilled, (state, action) => {
        state.dBPlantsName = action.payload;
       // console.log('dataSlice getPlantsNameDB', state.dBPlantsName )
      })

      .addCase(setSortByEmptyThunk.fulfilled, (state, action) => {
        state.sortingPlantList = action.payload;
       // console.log('dataSlice setSortByEmptyThunk', state.dBPlantsName )
      })

      .addCase(getPlantsDetailsDB.fulfilled, (state, action) => {
        state.dBPlantDetails = action.payload;
       // console.log('dataSlice getPlantsNameDB',)
      })

      .addCase(getNewVersionThunk.fulfilled, (state, action) => {
        state.newVersion = action.payload;
       // console.log('dataSlice getNewVersionThunk', state.newVersion, '1.0.3'<'1.0.4')
      })
  },
});

export const { setExistPlantProps, updateLocalCharacteristic, setLabelPrint, setDevices, 
  connectPrinter, setDocComment, setAutoPrint, clearDataState, setDocSent, cleaneDBPlantsName,
  setNewDetailBarcode, setCurrentStoage, updateLocalFreeQty, updateLocalComment, cleaneSortList } = dataSlice.actions;
export default dataSlice.reducer;
