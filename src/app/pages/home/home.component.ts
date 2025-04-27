import { Component } from '@angular/core';

import { ProductItemComponent } from '../../shared/components/product-item/product-item.component';
import { TagItemComponent } from '../../shared/components/tag-item/tag-item.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FooterComponent } from '../../shared/components/layout/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonComponent, ProductItemComponent, TagItemComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  tags = [];
  products = [];

}
