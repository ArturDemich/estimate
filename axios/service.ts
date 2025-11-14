import { DocumentResult } from "@/db/db.native";
import { myToast } from "@/utils/toastConfig";
import axios from "axios";
import { Buffer } from 'buffer';

const username = 'alex';
const password = '';
const tok = `${username}:${password}`;
const encodedToken = Buffer.from(tok).toString('base64');

const TO_EXCEL_URL = 'https://generate-excel-git-main-arturdemichs-projects.vercel.app/api/jsonToExcel';
const NEW_V_URL = 'https://digger-3000-default-rtdb.europe-west1.firebasedatabase.app/newVersionStock.json?print=pretty';
const API = 'http://194.42.195.241:41001/UTP/hs/api';
const TOKEN_URL = `${API}/getToken`;
const getStorages_URL = `${API}/getStorages`;
const getPlants_URL = `${API}/getProductInfo`;
const sendData_URL = `${API}/createStorageDoc`;

const UPLOAD_PHOTO_API_KEY = 'my_secret_upload_key_123';
const API_PHOTO_URL = 'http://192.168.1.94:3000';
const uploadPhoto_URL = `${API_PHOTO_URL}/photos/upload`;
const listPhoto_URL = `${API_PHOTO_URL}/photos/list`;


interface GetPlantsProps {
  token: string,
  name?: string,
  barcode?: string,
  storageId?: string,
  inStockOnly?: boolean
};
export class DataService {
  static async getNewVersion() {
    try {
      return await axios.get(NEW_V_URL)
        .then((response) => response.data);
    } catch (error: any) {
      console.error("Error in service getNewVersion:", error);
      let errorMessage = "Failed to fetch New Version App from api";
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

  static async getStorages(token: string) {
    try {
      return await axios.post(
        getStorages_URL,
        { token, allstorages: true },
        { headers: { Authorization: "Basic " + encodedToken } }
      )
        .then((response) => response.data);
    } catch (error: any) {
      console.error("Error in service getStorages:", error);
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
        console.error("Login request error:", error);
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

  static async getPlants({ token, name, barcode, storageId, inStockOnly }: GetPlantsProps) {
    try {
      return await axios.post(
        getPlants_URL,
        { token, findbystring: name || '', ...(barcode && {barcodes: [barcode]}), storageId, inStockOnly },
        { headers: { 'Authorization': 'Basic ' + encodedToken } })
        .then((response) => response.data)
    } catch (error: any) {
      myToast({ type: 'customError', text1: 'Список рослин не отримано!', text2: error.response.data })

      console.error("Error in service getPlants:", error);
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
  };

  static async sendDataToServer(token: string, document: DocumentResult) {
    try {
      return await axios.post(
        sendData_URL,
        { token, ...document },
        { headers: { Authorization: "Basic " + encodedToken } }
      )
        .then((response) => {
          if (!response.data.success) {
            throw new Error(response.data?.errors || 'Помилка в обʼєкті документа')
          }
          return response.data
        });
    } catch (error: any) {
      console.error("Error in service sendDataToServer:", error);
      let errorMessage = "Failed to send Data to server";
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
  };

  static async sendDataToExcel(document: DocumentResult) {
    try {
      const data = JSON.stringify(document);
      const response = await axios.post(TO_EXCEL_URL, data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("Error in service sendDataToExcel:", error);
      let errorMessage = "Failed to send data to excel";

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

  static async uploadPhoto(formData: FormData) {
    try {
      const response = await axios.post(uploadPhoto_URL,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', 'x-api-key': UPLOAD_PHOTO_API_KEY }, timeout: 10000, }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error in service uploadPhoto:", error);
      let errorMessage = "Failed to upload photo";
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

  static async getPhotosByProductId(productId: string) {
    try {
      if (!productId) throw new Error("productId is required");

      const response = await axios.get(listPhoto_URL, {
        params: { productId },
        headers: {
          "x-api-key": UPLOAD_PHOTO_API_KEY,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error: any) {
      console.error("Error in service getPhotosByProductId:", error);
      let errorMessage = "Failed to fetch list photos";
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