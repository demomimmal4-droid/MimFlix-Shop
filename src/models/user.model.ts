import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  createdAt: Timestamp;
  walletBalance?: number;
}
