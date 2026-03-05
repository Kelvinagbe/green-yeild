import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCV1AhhjueVqy0dOmkt53uBkCNtsVC4lTc",
  authDomain: "crestpoint-capital.firebaseapp.com",
  databaseURL: "https://crestpoint-capital-default-rtdb.firebaseio.com",
  projectId: "crestpoint-capital",
  storageBucket: "crestpoint-capital.firebasestorage.app",
  messagingSenderId: "204055812881",
  appId: "1:204055812881:web:5a9d07c515c484229bcab0",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;