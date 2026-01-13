import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../services/gemini.service';

@Component({
  selector: 'app-edit-product-modal',
  templateUrl: './edit-product-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class EditProductModalComponent {
  productInput = input.required<Product>();
  close = output<void>();
  save = output<Product>();

  editableProduct = signal<Product>({ id: '', name: '', description: '', price: 0, stock: 0, category: '' });

  constructor() {
    effect(() => {
      this.editableProduct.set({ ...this.productInput() });
    });
  }

  onSave(): void {
    this.save.emit(this.editableProduct());
  }

  onCancel(): void {
    this.close.emit();
  }
}
