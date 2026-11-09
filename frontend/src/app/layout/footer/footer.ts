import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-footer',
  imports: [Icon, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly year = new Date().getFullYear();

  readonly columns = [
    {
      title: 'Comprar',
      links: [
        { label: 'Ofertas do dia', link: '/offers' },
        { label: 'Novidades', link: '/products' },
        { label: 'Mais vendidos', link: '/products' },
        { label: 'Cupons', link: '/content/coupons' },
        { label: 'Cartão-presente', link: '/content/gift-card' },
      ],
    },
    {
      title: 'Vender',
      links: [
        { label: 'Criar loja', link: '/seller/register' },
        { label: 'Planos e taxas', link: '/content/plans' },
        { label: 'Central do vendedor', link: '/seller' },
        { label: 'Anunciar produto', link: '/seller/new' },
      ],
    },
    {
      title: 'Ajuda',
      links: [
        { label: 'Central de ajuda', link: '/help' },
        { label: 'Rastrear pedido', link: '/orders' },
        { label: 'Entregas e prazos', link: '/help#shipping' },
        { label: 'Trocas e devoluções', link: '/help#returns' },
        { label: 'Fale conosco', link: '/help#contact' },
      ],
    },
    {
      title: 'Institucional',
      links: [
        { label: 'Sobre a Praça', link: '/content/about' },
        { label: 'Trabalhe conosco', link: '/content/careers' },
        { label: 'Imprensa', link: '/content/press' },
        { label: 'Privacidade', link: '/content/privacy' },
        { label: 'Termos de uso', link: '/content/terms' },
      ],
    },
  ];
}
