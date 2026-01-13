import { Injectable } from '@angular/core';
// Fix: Use firebase/compat/app for app initialization and side effects for auth.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { getFirestore, type Firestore } from 'firebase/firestore';

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
  // Fix: Use the Auth type from the compat library.
  public auth: firebase.auth.Auth;

  constructor() {
    // Fix: Use compat initialization to prevent re-initialization.
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const app = firebase.app();
    // Fix: Get auth instance from the compat library.
    this.auth = firebase.auth(app);
    // Note: Firestore continues to use the modular API, which works.
    this.firestore = getFirestore(app);
  }
}