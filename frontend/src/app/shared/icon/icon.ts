import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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

@Component({
  selector: 'app-icon',
  template: `<span
    class="material-symbols-rounded"
    [class.is-filled]="fill()"
    [style.font-size.px]="size()"
    aria-hidden="true"
  >{{ symbol() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly fill = input(false);
  readonly symbol = computed(() => SYMBOLS[this.name()] ?? this.name());
}
