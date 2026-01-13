import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Product } from '../../services/gemini.service';
import { EditProductModalComponent } from './edit-product-modal/edit-product-modal.component';

type SortColumn = 'name' | 'price' | 'stock' | 'date';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, DatePipe, EditProductModalComponent],
})
export class ProductManagementComponent {
  private readonly adminService = inject(AdminService);
  
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Sorting state
  sortColumn = signal<SortColumn>('date');
  sortDirection = signal<SortDirection>('desc');

  sortedProducts = computed(() => {
    const products = this.products();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...products].sort((a, b) => {
        let compareA: string | number;
        let compareB: string | number;

        switch (column) {
            case 'name':
                compareA = a.name.toLowerCase();
                compareB = b.name.toLowerCase();
                break;
            case 'price':
                compareA = a.price;
                compareB = b.price;
                break;
            case 'stock':
                compareA = a.stock;
                compareB = b.stock;
                break;
            case 'date':
                compareA = parseInt(a.id.split('-')[0], 10);
                compareB = parseInt(b.id.split('-')[0], 10);
                break;
        }

        const comparison = compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
        return direction === 'asc' ? comparison : -comparison;
    });
  });

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

  onSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getDateFromId(id: string): Date {
    const timestamp = parseInt(id.split('-')[0], 10);
    return isNaN(timestamp) ? new Date(0) : new Date(timestamp);
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
    if (confirm('Are you sure you want to delete this product? This cannot be undone.')) {
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