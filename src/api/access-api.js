import axios from 'axios';
import { accountApi } from './account-api';
import { clientApi } from './client-api';


class AccessApi {

    async getAccesss() {
        try {
          const accessToken = localStorage.getItem('accessToken');
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ROOT}/api/1/access/`, 
          {
            headers: 
            { Authorization: `JWT ${accessToken}`},
          });
      
          const access = response.data;
      
          // Usar Promise.all para esperar todas las solicitudes
          const accessWithClients = await Promise.all(access.map(async (a) => {
            let c = await clientApi.getClient(a.account);
            a.client = c;
            return a;
          }));
      
          return accessWithClients;
        } catch (e) {
          console.log(e);
          throw new Error(e.response.data.detail);
        }
      }
async getAccess(id) {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ROOT}/api/1/access/${id}`, 
      {
        headers: 
        { Authorization: `JWT ${accessToken}`},
              }, );
    const access = response.data;
    return access
    } catch (e){
      console.log(e)
      throw new Error(e.response.data.detail);
    }
  }
  async updateAccess(id, accessData) {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_ROOT}/api/1/access/${id}`, 
      accessData, 
      {
        headers: 
        { Authorization: `JWT ${accessToken}`},
              }, );
    const access = response.data;
    return access
    } catch (e){
      console.log(e)
      throw new Error(e.response.data.detail);
    }
  }
  async createAccess(accessData) {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/api/1/access/`, 
      accessData, 
      {
        headers: 
        { Authorization: `JWT ${accessToken}`},
              }, );
    const access = response.data;
    return access
    } catch (e){
      console.log(e)
      throw new Error(e.response.data.detail);
    }
  }
  async deleteAccess(id) {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_ROOT}/api/1/access/${id}`, 
      {
        headers: 
        { Authorization: `JWT ${accessToken}`},
              }, );
    const access = response.data;
    return access
    } catch (e){
      console.log(e)
      throw new Error(e.response.data.detail);
    }
  }

}

export const accessApi = new AccessApi();
