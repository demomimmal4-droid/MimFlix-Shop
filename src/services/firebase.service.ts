import { Injectable } from '@angular/core';
// Fix: Use Firebase compat libraries to avoid module resolution errors with 'firebase/app'.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getFirestore, Firestore } from 'firebase/firestore';

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
  public firestore: Promise<Firestore>;

  constructor() {
    this.firestore = this.init();
  }

  private async init(): Promise<Firestore> {
    // Fix: Use compat API for initialization. This is functionally equivalent to the
    // previous modular approach but should resolve the import errors.
    const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app();
    return getFirestore(app);
  }
}
