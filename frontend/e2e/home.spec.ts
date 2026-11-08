import { test, expect } from '@playwright/test';
import { CATEGORIES, PRODUCTS } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/categories', (route) => route.fulfill({ json: CATEGORIES }));
  await page.route('**/api/products/deals', (route) =>
    route.fulfill({ json: PRODUCTS.slice(0, 4) }),
  );
  await page.route('**/api/products/recommended', (route) =>
    route.fulfill({ json: PRODUCTS.slice(4, 12) }),
  );
  await page.route('**/api/products', (route) => route.fulfill({ json: PRODUCTS }));
});

test('não há overflow horizontal', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-header')).toBeVisible();
  await expect(page.locator('app-product-card')).toHaveCount(12);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('renderiza cabeçalho, categorias e 12 produtos', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-header .logo')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Tudo o que você procura/i })).toBeVisible();
  await expect(page.locator('app-product-card')).toHaveCount(12);
});

test('todos os ícones SVG estão centrados', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-product-card')).toHaveCount(12);

  const icons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('app-icon svg'))
      .filter((svg) => {
        const box = svg.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .map((svg) => {
        const path = svg.querySelector('path');
        const box = svg.getBoundingClientRect();
        const ink = path?.getBoundingClientRect() ?? box;
        return {
          offsetX: (ink.left + ink.right) / 2 - (box.left + box.right) / 2,
          offsetY: (ink.top + ink.bottom) / 2 - (box.top + box.bottom) / 2,
        };
      }),
  );

  expect(icons.length).toBeGreaterThan(20);
  for (const icon of icons) {
    expect(Math.abs(icon.offsetX)).toBeLessThan(0.6);
    expect(Math.abs(icon.offsetY)).toBeLessThan(0.6);
  }
});

test('adicionar ao carrinho abre o drawer e atualiza o subtotal', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('app-product-card')
    .first()
    .getByRole('button', { name: 'Adicionar', exact: true })
    .click();
  await expect(page.locator('app-cart-drawer .drawer')).toHaveClass(/is-open/);
  await expect(page.locator('app-cart-drawer .drawer__count')).toHaveText('1');
  await expect(page.locator('app-cart-drawer .drawer__total strong')).toContainText('R$');
});

test('carrinho prende o foco, fecha com Esc e devolve o foco', async ({ page }) => {
  await page.goto('/');
  const add = page
    .locator('app-product-card')
    .first()
    .getByRole('button', { name: 'Adicionar', exact: true });
  await add.click();

  const drawer = page.locator('app-cart-drawer .drawer');
  await expect(drawer).toHaveClass(/is-open/);
  await expect(drawer).toHaveAttribute('role', 'dialog');
  await expect(drawer).toHaveAttribute('aria-modal', 'true');
  await expect(drawer).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Finalizar compra' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Fechar carrinho' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(drawer).not.toHaveClass(/is-open/);
  await expect(drawer).toHaveAttribute('inert', '');
  await expect(add).toBeFocused();
});

test('remover o último item mantém o foco no carrinho', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('app-product-card')
    .first()
    .getByRole('button', { name: 'Adicionar', exact: true })
    .click();

  const drawer = page.locator('app-cart-drawer .drawer');
  await drawer.getByRole('button', { name: 'Remover' }).click();
  await expect(drawer).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(drawer.getByRole('button', { name: 'Fechar carrinho' })).toBeFocused();
});

test('mostra erro quando a API falha e recupera no retry', async ({ page }) => {
  await page.unroute('**/api/products/deals');
  let attempt = 0;
  await page.route('**/api/products/deals', (route) => {
    attempt += 1;
    if (attempt === 1) {
      return route.fulfill({ status: 500, body: 'erro' });
    }
    return route.fulfill({ json: PRODUCTS.slice(0, 4) });
  });

  await page.goto('/');
  await expect(page.getByText(/Não foi possível carregar as ofertas/i)).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.locator('app-product-card').first()).toBeVisible();
});

test('sem erros no console', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/');
  await expect(page.locator('app-header')).toBeVisible();
  await expect(page.locator('app-product-card').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('captura de tela completa', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('app-product-card')).toHaveCount(12);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `test-results/home-${testInfo.project.name}.png`, fullPage: true });
});
