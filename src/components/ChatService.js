import {getDatabase, ref, onValue, set, get, child} from 'firebase/database';
import {initializeApp} from 'firebase/app';

export let roomID = null;

export const initialState = {
    Messages: []
};

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

const db = ref(getDatabase());

export const getChattersName = async (uid) => {
    let name;
    await get(child(db, `users/${uid}`)).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            name = data.name;
        } else {
            name = false;
            console.log("No data for current user");
        }
    }).catch((error) => {
        name = false;
        console.error(error);
    });
    return name;
}

