import { myToast } from "@/utils/toastConfig";
import axios from "axios";
import { Buffer } from 'buffer';

const username = 'alex';
const password = '';
const tok = `${username}:${password}`;
const encodedToken = Buffer.from(tok).toString('base64');


const TOKEN_URL = 'http://194.42.195.241:41001/UTP/hs/api/getToken';
const getStorages_URL = 'http://194.42.195.241:41001/UTP/hs/api/getStorages';
const getPlants_URL = 'http://194.42.195.241:41001/UTP/hs/api/getProductInfo';

export class DataService {
  static async getStorages(token: string) {
    try {
      return await axios.post(
        getStorages_URL,
        { token, allstorages: true },
        { headers: { Authorization: "Basic " + encodedToken } }
      )
        .then((response) => response.data);
    } catch (error: any) {
      console.log("Error in service getStorages:", error);
      let errorMessage = "Failed to fetch Storages from server";
      if (error.response?.data) {
        errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }

  static async getToken(log: string, pass: string) {
    return await axios.post(TOKEN_URL, { login: log, password: pass }, {
      headers: { 'Authorization': 'Basic ' + encodedToken }
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log("Login request error:", error);
        let errorMessage = "Login request failed!";
        if (error.response?.data) {
          errorMessage = typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
        }
        myToast({ type: 'customError', text1: 'Не вдалось авторизуватись!', text2: errorMessage });
        throw new Error(errorMessage);
      })
  };

  static async getPlants(token: string, name: string, barcode: string) {
    try {
      return await axios.post(
        getPlants_URL,
        { token, findbystring: name, barcodes: [barcode] },
        { headers: { 'Authorization': 'Basic ' + encodedToken } })
        .then((response) => response.data)
    } catch (error: any) {
      myToast({ type: 'customError', text1: 'Список рослин не отримано!', text2: error.response.data })
      
      console.log("Error in service getPlants:", error);
      let errorMessage = "Failed to fetch Plants from server";
      if (error.response?.data) {
        errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }
};