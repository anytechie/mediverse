import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDVctn7EsTrk715uGLhE7Xc4J2MgrcmpZs",
  authDomain: "mediverse-c3d3c.firebaseapp.com",
  projectId: "mediverse-c3d3c",
  storageBucket: "mediverse-c3d3c.appspot.com",
  messagingSenderId: "1051780246288",
  appId: "1:1051780246288:web:a1647db3f990016de79395"
};


const app = initializeApp(firebaseConfig);
// Export firestore database
// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);