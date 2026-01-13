import { Injectable, inject, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import type firebase from 'firebase/compat/app';
import { Firestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseService = inject(FirebaseService);
  private auth: firebase.auth.Auth;
  private firestore: Firestore;
  
  currentUser = signal<firebase.User | null>(null);
  currentUserProfile = signal<UserProfile | null>(null);

  constructor() {
    this.auth = this.firebaseService.auth;
    this.firestore = this.firebaseService.firestore;

    this.auth.onAuthStateChanged(async (user) => {
      this.currentUser.set(user);
      if (user) {
        const userProfile = await this.getUserProfile(user.uid);
        this.currentUserProfile.set(userProfile);
      } else {
        this.currentUserProfile.set(null);
      }
    });
  }

  async signup(email: string, password: string): Promise<firebase.User> {
    const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('User creation failed.');
    }
    await this.createUserProfile(userCredential.user);
    return userCredential.user;
  }

  async login(email: string, password: string): Promise<firebase.User> {
    const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
    if (!userCredential.user) {
      throw new Error('Login failed.');
    }
    const userProfile = await this.getUserProfile(userCredential.user.uid);
    this.currentUserProfile.set(userProfile);
    return userCredential.user;
  }

  async logout(): Promise<void> {
    this.currentUserProfile.set(null);
    return this.auth.signOut();
  }
  
  private async createUserProfile(user: firebase.User): Promise<void> {
    const userProfile: Omit<UserProfile, 'createdAt'> = {
      uid: user.uid,
      email: user.email!,
      role: 'user', // Default role
      walletBalance: 0
    };
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userDocRef, { ...userProfile, createdAt: serverTimestamp() });
  }

  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  }
}
