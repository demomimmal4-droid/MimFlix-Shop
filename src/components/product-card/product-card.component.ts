import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/gemini.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ProductCardComponent {
  product = input.required<Product>();
  
  // Create a stable image URL based on the product name to avoid image flickering on re-renders
  getImageUrl(name: string): string {
    const seed = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return `https://picsum.photos/seed/${seed}/400/300`;
  }
}
