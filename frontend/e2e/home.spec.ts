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

test('a fonte de ícones do Google carrega', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    document.fonts.check('24px "Material Symbols Rounded"'),
  );
  expect(loaded).toBe(true);
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
