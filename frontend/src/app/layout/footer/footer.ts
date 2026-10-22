import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-footer',
  imports: [Icon],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly year = new Date().getFullYear();

  readonly columns = [
    {
      title: 'Comprar',
      links: ['Ofertas do dia', 'Novidades', 'Mais vendidos', 'Cupons', 'Cartão-presente'],
    },
    {
      title: 'Vender',
      links: ['Criar loja', 'Planos e taxas', 'Central do vendedor', 'Anunciar produto'],
    },
    {
      title: 'Ajuda',
      links: ['Central de ajuda', 'Rastrear pedido', 'Entregas e prazos', 'Trocas e devoluções', 'Fale conosco'],
    },
    {
      title: 'Institucional',
      links: ['Sobre a Praça', 'Trabalhe conosco', 'Imprensa', 'Privacidade', 'Termos de uso'],
    },
  ];
}
