import { DataService } from "@/axios/service";
import { createAsyncThunk } from "@reduxjs/toolkit";

const TOKEN = 'BB3C4F93C70785389584F3A1AC9A5F8E';

export const getStoragesThunk = createAsyncThunk(
  'data',
  async (_, { rejectWithValue }) => {
    try {
      const response = await DataService.getStorages(TOKEN);
      return response.data;
    } catch (error) {
      console.error("Error in thunk:", error);
      return rejectWithValue("Failed to fetch storages");
    }
  }
);