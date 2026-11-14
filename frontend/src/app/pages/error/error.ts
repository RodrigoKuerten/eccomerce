import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

type ErrorCode = '404' | '500';

interface ErrorContent {
  eyebrow: string;
  title: string;
  text: string;
  label: string;
  icon: string;
}

const CONTENT: Record<ErrorCode, ErrorContent> = {
  '404': {
    eyebrow: 'Erro 404',
    title: 'Esta página saiu da praça.',
    text: 'O endereço que você abriu não existe, mudou de lugar ou o anúncio foi removido. Confira o link ou siga por um destes caminhos.',
    label: 'Página não encontrada',
    icon: 'search',
  },
  '500': {
    eyebrow: 'Erro inesperado',
    title: 'Algo deu errado por aqui.',
    text: 'Não foi possível carregar esta página agora. Tente de novo em instantes; se o problema continuar, fale com a central de ajuda.',
    label: 'Erro interno',
    icon: 'refresh',
  },
};

@Component({
  selector: 'app-error',
  imports: [Icon, RouterLink],
  templateUrl: './error.html',
  styleUrl: './error.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly code: ErrorCode = this.route.snapshot.data['code'] === '500' ? '500' : '404';
  protected readonly content = CONTENT[this.code];
}
