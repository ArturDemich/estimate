import { DataService } from "@/axios/service";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Alert, Platform } from "react-native";
import { TokenResponse, LoginData, PalntNameInput, PlantItemRespons, PlantNameDB, PlantDetails, Storages } from "./stateServiceTypes";
import { RootState } from "./store";
import { fetchCharacteristics, fetchPlants } from "@/db/db.native";
import * as SecureStore from "expo-secure-store";

const TOKEN = 'BB3C4F93C70785389584F3A1AC9A5F8E-';
function isTokenResponse(token: TokenResponse | {}): token is TokenResponse {
  return (token as TokenResponse).token !== undefined;
}

export const loginThunk = createAsyncThunk<TokenResponse, LoginData | undefined, { rejectValue: string }>(
  'login',
  async (loginData, { rejectWithValue }) => {
    if (!loginData) {
      let token;
      if (Platform.OS === 'web') {
        token = await localStorage.getItem('token')
      } else {
        token = await SecureStore.getItemAsync("token");
      };
      console.log('loginThunk___ localStor', token)
      if (token) {
        return JSON.parse(token);
      } else {
        return {}
      }
    } else {
      try {
        const response = await DataService.getToken(loginData.login, loginData.pass);
        console.log('loginThunk__ server', response)
        if (!response.success) {
          Alert.alert('From Server:', response.errors[0])
          return {}
        }
        const token = Array.isArray(response.data) ? response.data[0] : response.data;
        if (Platform.OS === 'web') {
          await localStorage.setItem('token', JSON.stringify(token))
        } else {
          await SecureStore.setItemAsync('token', JSON.stringify(token))
        }
        return token;

      } catch (error: any) {
        console.error("API Error in thunk login:", error);
        Alert.alert("API Error in thunk login!", error);
        return rejectWithValue("Failed to login");
      }
    }
  }
);

export const getStoragesThunk = createAsyncThunk<Storages[], void, { rejectValue: string, state: RootState }>(
  'data/getStorages',
  async (_, { rejectWithValue, getState }) => {
    try {
      const tokenState = getState().login.token;
      if (isTokenResponse(tokenState)) {
        const response = await DataService.getStorages(tokenState.token);
        if (!response.success) {
          Alert.alert('From Server:', response.errors[0])
          return []
        }
        console.log('getStoragesThunk',)
        return response.data;
      } else {
        throw new Error("No token available");
      }
    } catch (error) {
      console.error("Error in thunk:", error);
      return rejectWithValue("Failed to fetch storages");
    }
  }
);

export const getPlantsNameThunk = createAsyncThunk<PlantItemRespons[], PalntNameInput, { rejectValue: string, state: RootState }>(
  'data/getPlantsName',
  async (inputData, { rejectWithValue, getState }) => {
    try {
      const tokenState = getState().login.token;
      if (isTokenResponse(tokenState)) {
        const response = await DataService.getPlants(tokenState.token, inputData.name, inputData.barcode);
        if (!response.success) {
          Alert.alert('From Server:', response.errors[0])
          return []
        }
        console.log('getPlantsNameThunk___',)
        return response.data;
      } else {
        throw new Error("No token available");
      }
    } catch (error) {
      console.error("Error in thunk: getPlantsNameThunk", error);
      return rejectWithValue("Failed to fetch plants name");
    }
  }
);

export const getPlantsNameDB = createAsyncThunk<PlantNameDB[], { docId: number }, { rejectValue: string, state: RootState }>(
  'data/getPlantsNameDB',
  async ({ docId }, { rejectWithValue }) => {
    try {
      const plants = await fetchPlants(docId);
      return plants
    } catch (error) {
      console.error("Error in thunk getPlantsNameDB: ", error);
      return rejectWithValue("Failed to fetch plants name");
    }
  }
);

export const getPlantsDetailsDB = createAsyncThunk<PlantDetails[], { palntId: number, docId: number }, { rejectValue: string, state: RootState }>(
  'data/getPlantsDetailsDB',
  async ({ palntId, docId }, { rejectWithValue }) => {
    try {
      const plantDetails = await fetchCharacteristics(palntId, docId);
      return plantDetails;
    } catch (error) {
      console.error("Error in thunk getPlantsDetailsDB: ", error);
      return rejectWithValue("Failed to fetch plants details");
    }
  }
);