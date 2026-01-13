import { Injectable } from '@angular/core';
// FIX: The modular 'firebase/app' imports were causing errors. Switched to using the compat 'firebase' object for initialization.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getFirestore, type Firestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoR3H7vML8177WrACSXixSbEGOgyrCX1U",
  authDomain: "mimflix-shop.firebaseapp.com",
  projectId: "mimflix-shop",
  storageBucket: "mimflix-shop.firebasestorage.app",
  messagingSenderId: "720799023974",
  appId: "1:720799023974:web:f20c3751c9b18420f1fea7",
  measurementId: "G-JEKM9D61WZ"
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public firestore: Firestore;
  public auth: firebase.auth.Auth;

  constructor() {
    // Initialize with the compat SDK to ensure it's available for both modular and compat services.
    const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
    
    // The compat 'firebase.auth()' will automatically use the initialized app.
    this.auth = firebase.auth();
    
    // The modular 'getFirestore()' will also use the initialized app.
    this.firestore = getFirestore(app);
  }
}
