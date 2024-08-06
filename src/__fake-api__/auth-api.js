import { createResourceId } from '../utils/create-resource-id';
import { decode, JWT_EXPIRES_IN, JWT_SECRET, sign } from '../utils/jwt';
import { wait } from '../utils/wait';
import axios from 'axios';
import { historyApi } from '../api/history-api';


//NEXT-STEPS: Refactorizar para meter en otro fichero qeu no se llame fakeapi
//NEXT-STEPS: Gestionar errores cuando no se encuetra el user o el pwd
const users = [
  {
    id: '5e86809283e28b96d2d38537',
    avatar: '/static/mock-images/avatars/avatar-anika_visser.png',
    email: 'demo@devias.io',
    name: 'Anika Visser',
    password: 'Password123!',
    plan: 'Premium'
  }
];

class AuthApi {
  async login(request) {
    const { email, password } = request;

    await wait(500);

    try {

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/auth/jwt/create/`, {
        username: email,
        password: password 
      }, {headers: { 'Accept-Language': 'es-ES' }}, );
      const accessToken = response.data.access;
      localStorage.setItem('accessToken', accessToken )
      localStorage.setItem('user_email', email);
      return {accessToken}
    } catch (e){
      throw new Error(e.response.data.detail);
    }

    return new Promise((resolve, reject) => {
      try {
        // Find the user
        const user = users.find((_user) => _user.email === email);

        if (!user || (user.password !== password)) {
          reject(new Error('Please check your email and password'));
          return;
        }

        // Create the access token
        const accessToken = sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        resolve({ accessToken });
      } catch (err) {
        console.error('[Auth Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  async register(request) {
    const {password, email } = request;

    try {

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT}/auth/users/`, {
        username: email,
        password: password,
        email: email

    }, {headers: { 'Accept-Language': 'es-ES' }}, );
    const user = response.data
    
    const h = await historyApi.createHistory({account:user.id,current_status:-1})
    console.log(h)
    return user

    } catch (e){
      throw new Error(e.response.data.detail);
    }

    return new Promise((resolve, reject) => {
      try {
        // Check if a user already exists
        let user = users.find((_user) => _user.email === email);

        if (user) {
          reject(new Error('User already exists'));
          return;
        }

        user = {
          id: createResourceId(),
          avatar: undefined,
          email,
          name,
          password,
          plan: 'Standard'
        };

        users.push(user);

        const accessToken = sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        resolve({ accessToken });
      } catch (err) {
        console.error('[Auth Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  async me(request) {
    const { accessToken } = request;


    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ROOT}/auth/users/me/`, {headers: { Authorization: `JWT ${accessToken}`}});
    const user = response.data
    return {
      id: user.id,
      avatar: '/static/mock-images/avatars/avatar-anika_visser.png',
      email: user.email,
      name: user.usernname,
      plan: "Premium"
    }

    return new Promise((resolve, reject) => {
      try {
        // Decode access token
        const { userId } = decode(accessToken);

        // Find the user
        const user = users.find((_user) => _user.id === userId);

        if (!user) {
          reject(new Error('Invalid authorization token'));
          return;
        }

        resolve({
          id: user.id,
          avatar: user.avatar,
          email: user.email,
          name: user.name,
          plan: user.plan
        });
      } catch (err) {
        console.error('[Auth Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }
}

export const authApi = new AuthApi();
