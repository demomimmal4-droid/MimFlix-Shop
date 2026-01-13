import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Product } from '../../services/gemini.service';
import { EditProductModalComponent } from './edit-product-modal/edit-product-modal.component';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, EditProductModalComponent],
})
export class ProductManagementComponent {
  private readonly adminService = inject(AdminService);
  
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Modal state
  showEditModal = signal(false);
  selectedProduct = signal<Product | null>(null);

  constructor() {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.products.set(await this.adminService.getAllProducts());
    } catch (e) {
      console.error("Failed to load products", e);
      this.error.set("Could not load product data. Please try again later.");
    } finally {
      this.loading.set(false);
    }
  }
  
  openEditModal(product: Product): void {
    this.selectedProduct.set(product);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedProduct.set(null);
  }

  async handleProductUpdate(updatedProduct: Product): Promise<void> {
    if (!updatedProduct) return;
    try {
      await this.adminService.updateProduct(updatedProduct);
      this.products.update(currentProducts => 
        currentProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      );
      this.closeEditModal();
    } catch(e) {
      console.error("Failed to update product", e);
      alert("Failed to update product. See console for details.");
    }
  }

  async handleDeleteProduct(productToDelete: Product): Promise<void> {
    if (confirm(`Are you sure you want to delete "${productToDelete.name}"? This cannot be undone.`)) {
      try {
        await this.adminService.deleteProduct(productToDelete);
        this.products.update(currentProducts => 
          currentProducts.filter(p => p.id !== productToDelete.id)
        );
      } catch(e) {
        console.error("Failed to delete product", e);
        alert("Failed to delete product. See console for details.");
      }
    }
  }
}
