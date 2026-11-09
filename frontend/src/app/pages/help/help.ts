import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-help',
  imports: [Icon, RouterLink],
  templateUrl: './help.html',
  styleUrl: './help.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPage {
  private readonly title = inject(Title);

  readonly topics = [
    { id: 'getting-started', label: 'Primeiros passos', icon: 'search' },
    { id: 'buying', label: 'Comprar', icon: 'cart' },
    { id: 'selling', label: 'Vender', icon: 'store' },
    { id: 'account', label: 'Conta e segurança', icon: 'user' },
    { id: 'payments', label: 'Pagamentos', icon: 'card' },
    { id: 'shipping', label: 'Entregas e prazos', icon: 'truck' },
    { id: 'returns', label: 'Trocas e devoluções', icon: 'refresh' },
    { id: 'contact', label: 'Fale conosco', icon: 'shield' },
  ];

  constructor() {
    this.title.setTitle('Central de ajuda — Praça');
  }
}
