import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FILLED_ICONS, ICONS, IconGlyph } from './icon-data';

const SYMBOLS: Record<string, string> = {
  search: 'search',
  cart: 'shopping_cart',
  user: 'account_circle',
  menu: 'menu',
  close: 'close',
  chevron: 'chevron_right',
  heart: 'favorite',
  star: 'star',
  store: 'storefront',
  pin: 'location_on',
  truck: 'local_shipping',
  shield: 'verified_user',
  refresh: 'autorenew',
  card: 'credit_card',
  headphones: 'headphones',
  sneaker: 'directions_run',
  coffeemaker: 'coffee_maker',
  watch: 'watch',
  backpack: 'backpack',
  blender: 'blender',
  sunglasses: 'eyeglasses',
  chair: 'chair',
  camera: 'photo_camera',
  smartphone: 'smartphone',
  book: 'menu_book',
  dumbbell: 'fitness_center',
  tv: 'tv',
  shirt: 'checkroom',
  sofa: 'weekend',
  beauty: 'spa',
  ball: 'toys',
  gamepad: 'sports_esports',
  car: 'directions_car',
  pet: 'pets',
  tool: 'handyman',
};

const FALLBACK: IconGlyph = ICONS['storefront'];

@Component({
  selector: 'app-icon',
  template: `<svg
    viewBox="0 -960 960 960"
    [attr.width]="size()"
    [attr.height]="size()"
    aria-hidden="true"
    focusable="false"
  ><path [attr.d]="glyph().path" [attr.transform]="transform()" fill="currentColor" /></svg>`,
  styleUrl: './icon.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly fill = input(false);

  readonly glyph = computed<IconGlyph>(() => {
    const symbol = SYMBOLS[this.name()] ?? this.name();
    return (this.fill() ? FILLED_ICONS[symbol] : undefined) ?? ICONS[symbol] ?? FALLBACK;
  });

  protected readonly transform = computed(
    () => `translate(${this.glyph().x} ${this.glyph().y})`,
  );
}
