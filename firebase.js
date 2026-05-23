import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCV7hOpLbcY08BoYduYn42xgwoLE2ncsL8",
  authDomain: "geoportal-inundaciones-milagro.firebaseapp.com",
  databaseURL: "https://geoportal-inundaciones-milagro-default-rtdb.firebaseio.com/",
  projectId: "geoportal-inundaciones-milagro",
  storageBucket: "geoportal-inundaciones-milagro.firebasestorage.app",
  messagingSenderId: "1010739716949",
  appId: "1:1010739716949:web:cd215b4fb505f90bd785dc"
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);