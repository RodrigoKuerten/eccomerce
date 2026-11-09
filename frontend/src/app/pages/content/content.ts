import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

interface ContentEntry {
  title: string;
  intro: string;
  paragraphs: string[];
}

const CONTENT: Record<string, ContentEntry> = {
  shipping: {
    title: 'Entregas e prazos',
    intro: 'O prazo e o frete são definidos pelo vendedor de cada produto.',
    paragraphs: [
      'Produtos com o selo “Frete grátis” não cobram frete para o endereço informado no checkout.',
      'O prazo começa a contar depois da confirmação do pagamento e varia conforme a região e o vendedor.',
      'Você acompanha o andamento em “Meus pedidos”.',
    ],
  },
  returns: {
    title: 'Trocas e devoluções',
    intro: 'Compre com tranquilidade: você tem até 30 dias para solicitar troca ou devolução.',
    paragraphs: [
      'O produto deve estar sem sinais de uso e com a embalagem original, quando aplicável.',
      'Abra a solicitação pela página do pedido ou fale com o vendedor para combinar a devolução.',
      'O reembolso é feito no mesmo meio de pagamento após a conferência do item.',
    ],
  },
  contact: {
    title: 'Fale conosco',
    intro: 'Estamos aqui para ajudar com compras, vendas e problemas na plataforma.',
    paragraphs: [
      'E-mail: atendimento@praca.example',
      'Horário de atendimento: segunda a sexta, das 9h às 18h.',
      'Para agilizar, informe o número do pedido e o e-mail usado na compra.',
    ],
  },
  about: {
    title: 'Sobre a Praça',
    intro: 'A Praça conecta compradores e vendedores de todo o Brasil em um só lugar.',
    paragraphs: [
      'Nosso objetivo é tornar a compra e a venda online simples, seguras e transparentes.',
      'Trabalhamos com vendedores verificados, compra protegida e ferramentas para quem quer começar a vender.',
      'A Praça é uma plataforma de demonstração construída para explorar o comércio digital.',
    ],
  },
  careers: {
    title: 'Trabalhe conosco',
    intro: 'Quer construir o futuro do comércio com a gente?',
    paragraphs: [
      'Estamos sempre em busca de pessoas curiosas, responsáveis e que gostem de resolver problemas.',
      'Envie seu currículo e uma breve apresentação para talentos@praca.example.',
      'Não há vagas abertas no momento, mas guardamos seu contato para futuras oportunidades.',
    ],
  },
  press: {
    title: 'Imprensa',
    intro: 'Materiais e contato para jornalistas e veículos de comunicação.',
    paragraphs: [
      'Para solicitar informações, entrevistas ou materiais de marca, escreva para imprensa@praca.example.',
      'Respondemos preferencialmente por e-mail, em horário comercial.',
    ],
  },
  privacy: {
    title: 'Política de privacidade',
    intro: 'Como tratamos seus dados na Praça.',
    paragraphs: [
      'Coletamos apenas as informações necessárias para criar sua conta, processar pedidos e melhorar a experiência na plataforma.',
      'Seus dados não são vendidos. O compartilhamento acontece apenas com vendedores e serviços necessários para concluir uma compra.',
      'Você pode solicitar a atualização ou exclusão dos seus dados pelo canal de contato.',
    ],
  },
  terms: {
    title: 'Termos de uso',
    intro: 'Regras para usar a Praça com segurança.',
    paragraphs: [
      'Ao criar uma conta, você se compromete a fornecer informações verdadeiras e a manter suas credenciais em sigilo.',
      'Vendedores são responsáveis pela descrição, estoque e entrega dos produtos anunciados.',
      'A Praça pode remover anúncios que violem estes termos ou a legislação aplicável.',
    ],
  },
  coupons: {
    title: 'Cupons',
    intro: 'Em breve você encontrará cupons e promoções especiais aqui.',
    paragraphs: [
      'Estamos preparando uma área com descontos exclusivos para compradores da Praça.',
      'Enquanto isso, confira as ofertas do dia na página inicial.',
    ],
  },
  'gift-card': {
    title: 'Cartão-presente',
    intro: 'Um jeito simples de presentear quem você gosta.',
    paragraphs: [
      'O cartão-presente da Praça poderá ser usado em qualquer produto da plataforma.',
      'Estamos finalizando essa funcionalidade. Em breve você poderá comprar e resgatar cartões por aqui.',
    ],
  },
  plans: {
    title: 'Planos e taxas',
    intro: 'Vender na Praça é simples e transparente.',
    paragraphs: [
      'Criar sua conta e publicar seus primeiros anúncios é gratuito.',
      'Taxas de comissão e planos para lojas com grande volume serão detalhados antes da contratação.',
      'Por enquanto, use a área do vendedor para publicar produtos e testar a plataforma.',
    ],
  },
  'seller-center': {
    title: 'Central do vendedor',
    intro: 'Tudo o que você precisa para começar a vender.',
    paragraphs: [
      'Acesse a área do vendedor para cadastrar produtos, fotos, preços e estoque.',
      'Acompanhe seus anúncios e pedidos em um só lugar.',
      'Precisa de ajuda? Fale conosco.',
    ],
  },
};

@Component({
  selector: 'app-content',
  imports: [Icon, RouterLink],
  templateUrl: './content.html',
  styleUrl: './content.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentPage {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly entrySignal = signal<ContentEntry | null>(null);

  readonly entry = this.entrySignal.asReadonly();

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  private load(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const entry = CONTENT[slug] ?? null;
    this.entrySignal.set(entry);
    this.title.setTitle(entry ? `${entry.title} — Praça` : 'Página não encontrada — Praça');
  }
}
