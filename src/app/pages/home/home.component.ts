import { Component, signal } from '@angular/core';

import { ProductItemComponent } from '../../shared/components/product-item/product-item.component';
import { TagItemComponent } from '../../shared/components/tag-item/tag-item.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductItemComponent, TagItemComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  tags = signal([0, 1, 2]);
  products = signal([0, 1, 2]);
}
