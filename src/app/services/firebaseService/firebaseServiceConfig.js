const prodConfig = {
  apiKey           : "AIzaSyAXzgclOxcsrpxVEI08MWE_hGf2N8hCExg",
  authDomain       : "surge-bb99e.firebaseapp.com",
  databaseURL      : "https://surge-bb99e-default-rtdb.firebaseio.com",
  projectId        : "surge-bb99e",
  storageBucket    : "surge-bb99e.appspot.com",
  messagingSenderId: "158723014405"
};

const devConfig = {
  apiKey           : "AIzaSyAXzgclOxcsrpxVEI08MWE_hGf2N8hCExg",
  authDomain       : "surge-bb99e.firebaseapp.com",
  databaseURL      : "https://surge-bb99e-default-rtdb.firebaseio.com",
  projectId        : "surge-bb99e",
  storageBucket    : "surge-bb99e.appspot.com",
  messagingSenderId: "158723014405"
};

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

export default config;
