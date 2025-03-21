import { DataService } from "@/axios/service";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Platform } from "react-native";
import { TokenResponse, LoginData, PalntNameInput, PlantItemRespons, PlantNameDB, Storages, PlantDetailsResponse, NewVersionRes } from "./stateServiceTypes";
import { RootState } from "./store";
import { fetchCharacteristics, fetchPlants } from "@/db/db.native";
import * as SecureStore from "expo-secure-store";
import { myToast } from "@/utils/toastConfig";

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
      if (token) {
        return JSON.parse(token);
      } else {
        return {}
      }
    } else {
      try {
        const response = await DataService.getToken(loginData.login, loginData.pass);
        if (!response.success) {
          myToast({ type: 'customError', text1: 'Не авторизовано! Сервер відповідає: ', text2: response.errors[0], visibilityTime: 5000 });
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
      if (!isTokenResponse(tokenState)) {
        return rejectWithValue("No valid token available");
      }

      const response = await DataService.getStorages(tokenState.token);
      if (!response.success) {
        return rejectWithValue(response.errors?.[0] || "Unknown error");
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch storages");
    }
  }
);

export const getNewVersionThunk = createAsyncThunk<NewVersionRes, void, { rejectValue: string }>(
  'data/getNewVersionThunk',
  async (_, { rejectWithValue }) => {
    try {
      const response = await DataService.getNewVersion();
      if(!response) {
        myToast({
          type: "customError",
          text1: "Помилка перевірки нової версії",
          text2: "Дані не отримано з API!",
          visibilityTime: 5000,
        });
        return null
      }
      return response;
    } catch (error: any) {
      myToast({
        type: "customError",
        text1: "Помилка перевірки нової версії",
        text2: error?.message || "Помилка сервера",
        visibilityTime: 5000,
      });
      return rejectWithValue(error.message || "Failed to fetch new version app");
    }
  }
);

export const getPlantsNameThunk = createAsyncThunk<PlantItemRespons[], PalntNameInput, { rejectValue: string, state: RootState }>(
  'data/getPlantsName',
  async (inputData, { rejectWithValue, getState }) => {
    try {
      const tokenState = getState().login.token;
      if (!isTokenResponse(tokenState)) {
        return rejectWithValue("No valid token available");
      }
      const response = await DataService.getPlants(tokenState.token, inputData.name, inputData.barcode);
        if (!response.success) {
          return rejectWithValue(response.errors?.[0] || "Unknown error");
        }
        return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch Plants");
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

export const getPlantsDetailsDB = createAsyncThunk<PlantDetailsResponse[], { palntId: number, docId: number }, { rejectValue: string, state: RootState }>(
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
