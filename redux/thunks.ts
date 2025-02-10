import { DataService } from "@/axios/service";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Alert, Platform } from "react-native";

const TOKEN = 'BB3C4F93C70785389584F3A1AC9A5F8E';
interface LoginData {
  login: string;
  pass: string;
}
export interface AuthResponse {
  token: string;
  name: string;
  allowPersonalMessages: boolean;
}
export const loginThunk = createAsyncThunk<AuthResponse, LoginData, { rejectValue: string }>(
  'login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await DataService.getToken(loginData.login, loginData.pass);
      console.log('loginThunk', response)
      if(!response.success) {
        return Alert.alert('From Server:', response.errors[0])
      }

      if (Platform.OS === 'web') {
        await localStorage.setItem('token', JSON.stringify(response.data[0]))
      } else {
        //await SecureStore.setItemAsync('token', JSON.stringify(response.data))
      }
      if(Array.isArray(response.data)) {
        return response.data[0]
      }
      return response.data;
    } catch (error: any) {
      console.error("API Error in thunk login:", error);
      Alert.alert("API Error in thunk login!", error);
      return rejectWithValue("Failed to login");
    }
  }
);

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