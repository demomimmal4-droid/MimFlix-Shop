import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
  getDoc
} from 'firebase/firestore';
import { UserProfile } from '../models/user.model';
import { Product } from './gemini.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private firebaseService = inject(FirebaseService);
  private firestore: Firestore;

  constructor() {
    this.firestore = this.firebaseService.firestore;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const usersCol = collection(this.firestore, 'users');
    const q = query(usersCol, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  }

  async updateUserRole(uid: string, newRole: 'user' | 'seller' | 'admin'): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userDocRef, {
      role: newRole
    });
  }

  async getAllProducts(): Promise<Product[]> {
    const categoriesCol = collection(this.firestore, 'product_categories');
    const querySnapshot = await getDocs(categoriesCol);
    let allProducts: Product[] = [];
    querySnapshot.forEach(doc => {
      const products = doc.data().products as Product[];
      if (products) {
        allProducts = allProducts.concat(products);
      }
    });
    return allProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateProduct(updatedProduct: Product): Promise<void> {
    const categoryId = updatedProduct.category.trim().toLowerCase().replace(/\s+/g, '-');
    const categoryDocRef = doc(this.firestore, 'product_categories', categoryId);

    try {
      const docSnap = await getDoc(categoryDocRef);
      if (!docSnap.exists()) {
        throw new Error(`Category document '${categoryId}' not found.`);
      }

      const products = docSnap.data().products as Product[];
      const productIndex = products.findIndex(p => p.id === updatedProduct.id);

      if (productIndex === -1) {
        throw new Error(`Product with ID '${updatedProduct.id}' not found in category '${updatedProduct.category}'.`);
      }

      products[productIndex] = updatedProduct;
      await updateDoc(categoryDocRef, { products });

    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async deleteProduct(productToDelete: Product): Promise<void> {
    const categoryId = productToDelete.category.trim().toLowerCase().replace(/\s+/g, '-');
    const categoryDocRef = doc(this.firestore, 'product_categories', categoryId);

    try {
      const docSnap = await getDoc(categoryDocRef);
      if (!docSnap.exists()) {
        throw new Error(`Category document '${categoryId}' not found.`);
      }
      
      const products = docSnap.data().products as Product[];
      const updatedProducts = products.filter(p => p.id !== productToDelete.id);

      if (products.length === updatedProducts.length) {
          console.warn(`Product with ID '${productToDelete.id}' not found for deletion.`);
          return;
      }
      
      await updateDoc(categoryDocRef, { products: updatedProducts });

    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }
}
