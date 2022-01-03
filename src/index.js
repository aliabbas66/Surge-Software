import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { initializeApp } from 'firebase/app';
import { Provider } from 'react-redux';
import store from './store/store';
const firebaseConfig = {
    apiKey: "AIzaSyAXzgclOxcsrpxVEI08MWE_hGf2N8hCExg",
    authDomain: "surge-bb99e.firebaseapp.com",
    databaseURL: "https://surge-bb99e-default-rtdb.firebaseio.com",
    projectId: "surge-bb99e",
    storageBucket: "surge-bb99e.appspot.com",
    messagingSenderId: "158723014405",
    appId: "1:158723014405:web:c86bf7aa8d54c7b046816c",
    measurementId: "G-FT2X76WWTJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
      <Provider store={store}>
         <BrowserRouter>
              <App />
         </BrowserRouter>
      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
