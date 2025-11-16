import { createSlice } from '@reduxjs/toolkit';
import {deletePhotoThunk, fetchPhotosByProductId, uploadPhotoThunk } from './thunks';
import { PhotoSlice } from './stateServiceTypes';


const initialState: PhotoSlice = {
    photoList: [],
  };
  

const photoSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotosByProductId.fulfilled, (state, action) => {
        state.photoList = action.payload;
       // console.log("photoSlice state:", state.photoList);
      })
      .addCase(fetchPhotosByProductId.rejected, (state) => {
        state.photoList = null;
      })
      .addCase(uploadPhotoThunk.fulfilled, (state, action) => {
        if (!state.photoList) {
          state.photoList = [action.payload];
        } else {
          state.photoList.push(action.payload);
        }
        //console.log("photoSlice state:", state.photoList);
      })
      .addCase(deletePhotoThunk.fulfilled, (state, action) => {
        if (state.photoList) {
          state.photoList = state.photoList.filter(photo => !action.payload.includes(photo.id));
        }
      })

  },
});

export const {  } = photoSlice.actions;
export default photoSlice.reducer;
