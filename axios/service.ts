import axios from "axios";
import { Buffer } from 'buffer';

const username = 'alex';
const password = '';
const tok = `${username}:${password}`;
const encodedToken = Buffer.from(tok).toString('base64');


const getStorages_URL = 'http://194.42.195.241:41001/UTP/hs/api/getStorages';
const TOKEN_URL = 'http://194.42.195.241:41001/UTP/hs/api/getToken';

export class DataService {
    static async getStorages(token: string) {
    try {
      return await axios.post(getStorages_URL, { token, allstorages: true }, {
        headers: { 'Authorization': 'Basic ' + encodedToken }
      }).then(response => response.data);
    } catch (error) {
      console.error("Error in service:", error);
      throw new Error("Failed to fetch data from server");
    }
  };

  static async getToken(log: string, pass: string) {
    return await axios.post(TOKEN_URL, { login: log, password: pass }, {
        headers: { 'Authorization': 'Basic ' + encodedToken }
    })
        .then((response) => response.data)
        .catch((error) => {
            alert(error.response.data)
            console.log(error);
        })
}
};