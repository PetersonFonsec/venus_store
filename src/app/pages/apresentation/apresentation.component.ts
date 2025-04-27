import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-apresentation',
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  templateUrl: './apresentation.component.html',
  styleUrl: './apresentation.component.scss'
})
export class ApresentationComponent {}
