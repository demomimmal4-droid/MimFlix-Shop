import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, Product } from '../../services/gemini.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ProductCardComponent],
})
export class ShopComponent {
  private readonly geminiService = inject(GeminiService);

  category = signal('latest tech gadgets');
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  async findProducts(): Promise<void> {
    if (!this.category() || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.products.set([]);

    try {
      const generatedProducts = await this.geminiService.getOrGenerateProducts(this.category());
      this.products.set(generatedProducts);
    } catch (e) {
      console.error(e);
      this.error.set('Failed to find products. Please check the console for more details.');
    } finally {
      this.loading.set(false);
    }
  }

  // Initial generation on load for better UX
  constructor() {
    this.findProducts();
  }
}
