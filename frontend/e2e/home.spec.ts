import { test, expect } from '@playwright/test';
import { CATEGORIES, PRODUCTS } from './fixtures';

const USER = { id: 1, email: 'vendedor@teste.com', fullName: 'Vendedor Teste', role: 'SELLER', storeName: 'Loja Teste' };
const PROFILE = {
  id: 1,
  email: 'vendedor@teste.com',
  fullName: 'Vendedor Teste',
  phoneNumber: '(11) 99999-9999',
  address: 'Rua Teste, 1',
  cpf: null,
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: USER }));
  await page.route('**/api/account', (route) => route.fulfill({ json: PROFILE }));
  await page.route('**/api/account/profile', (route) =>
    route.fulfill({ json: { ...PROFILE, cpf: '12345678901' } }),
  );
  await page.route('**/api/account/password', (route) =>
    route.fulfill({ json: { message: 'Senha alterada com sucesso.' } }),
  );
  await page.route('**/api/categories', (route) => route.fulfill({ json: CATEGORIES }));
  await page.route('**/api/products/deals', (route) =>
    route.fulfill({ json: PRODUCTS.slice(0, 4) }),
  );
  await page.route('**/api/products/recommended', (route) =>
    route.fulfill({ json: PRODUCTS.slice(4, 12) }),
  );
  await page.route('**/api/products', (route) => route.fulfill({ json: PRODUCTS }));
  await page.route(/\/api\/products\?q=/, (route) => route.fulfill({ json: PRODUCTS }));
  await page.route(/\/api\/products\/\d+$/, (route) => {
    const id = Number(new URL(route.request().url()).pathname.split('/').pop());
    const product = PRODUCTS.find((item) => item.id === id);
    return product
      ? route.fulfill({ json: product })
      : route.fulfill({ status: 404, body: 'not found' });
  });
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

test('mostra estados vazios quando as APIs retornam vazio', async ({ page }) => {
  await page.unroute('**/api/categories');
  await page.route('**/api/categories', (route) => route.fulfill({ json: [] }));
  await page.unroute('**/api/products/deals');
  await page.route('**/api/products/deals', (route) => route.fulfill({ json: [] }));
  await page.unroute('**/api/products/recommended');
  await page.route('**/api/products/recommended', (route) => route.fulfill({ json: [] }));

  await page.goto('/');

  await expect(page.getByText('Categorias indisponíveis no momento.')).toBeVisible();
  await expect(page.getByText('Nenhuma categoria disponível')).toBeVisible();
  await expect(page.getByText('Nenhuma oferta no momento')).toBeVisible();
  await expect(page.getByText('Nenhuma recomendação no momento')).toBeVisible();
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

test('categoria abre a listagem filtrada', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-card', { hasText: 'Eletrônicos' }).click();

  await expect(page).toHaveURL(/\/category\/electronics$/);
  await expect(page.getByRole('heading', { name: 'Eletrônicos', exact: true })).toBeVisible();
  await expect(page.locator('app-product-card')).toHaveCount(1);
});

test('busca navega para os resultados', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar produtos' }).fill('Produto de teste 1');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page).toHaveURL(/\/search\?q=Produto/);
  await expect(page.getByRole('heading', { name: /Resultados para/ })).toBeVisible();
  await expect(page.locator('app-product-card')).toHaveCount(12);
});

test('abre o detalhe do produto', async ({ page }) => {
  await page.goto('/');
  await page.locator('app-product-card').first().locator('.card__name a').click();

  await expect(page).toHaveURL(/\/product\/1$/);
  await expect(
    page.getByRole('heading', { name: 'Produto de teste 1', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeVisible();
});

test('favorita e lista o produto', async ({ page }) => {
  await page.goto('/');
  await page.locator('app-product-card').first().locator('.card__fav').click();
  await page.goto('/favorites');

  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.locator('app-product-card')).toHaveCount(1);
});

test('vender exige perfil de vendedor', async ({ page }) => {
  await page.unroute('**/api/auth/me');
  await page.route('**/api/auth/me', (route) => route.fulfill({ status: 401, body: '' }));

  await page.goto('/seller/new');
  await expect(page).toHaveURL(/\/seller\/register$/);
  await expect(page.getByRole('heading', { name: 'Entre para começar a vender' })).toBeVisible();
});

test('comprador é levado ao upgrade de vendedor', async ({ page }) => {
  await page.unroute('**/api/auth/me');
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({ json: { ...USER, role: 'BUYER', storeName: null } }),
  );

  await page.goto('/seller');
  await expect(page).toHaveURL(/\/seller\/register$/);
  await expect(page.getByRole('heading', { name: 'Ative sua loja' })).toBeVisible();
});

test('comprador ativa a loja sem criar outra conta', async ({ page }) => {
  let isSeller = false;

  await page.unroute('**/api/auth/me');
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({
      json: {
        ...USER,
        role: isSeller ? 'SELLER' : 'BUYER',
        storeName: isSeller ? 'Loja Nova' : null,
      },
    }),
  );
  await page.route('**/api/seller/upgrade', (route) => {
    isSeller = true;
    return route.fulfill({ json: { message: 'Loja ativada com sucesso.' } });
  });
  await page.route('**/api/seller/dashboard', (route) =>
    route.fulfill({
      json: {
        productCount: 0,
        totalStock: 0,
        inventoryValue: 0,
        outOfStock: 0,
        orderCount: 0,
        products: [],
        recentOrders: [],
        salesLast7Days: [
          { label: '02/11', revenue: 0, orders: 0 },
          { label: '03/11', revenue: 0, orders: 0 },
          { label: '04/11', revenue: 0, orders: 0 },
          { label: '05/11', revenue: 0, orders: 0 },
          { label: '06/11', revenue: 0, orders: 0 },
          { label: '07/11', revenue: 0, orders: 0 },
          { label: '08/11', revenue: 0, orders: 0 },
        ],
      },
    }),
  );

  await page.goto('/seller/register');
  await expect(page.getByRole('heading', { name: 'Ative sua loja' })).toBeVisible();

  await page.getByLabel('Nome da loja').fill('Loja Nova');
  await page.getByLabel('Descrição da loja').fill('Produtos feitos à mão.');
  await page.getByLabel('CPF').fill('987.654.321-09');
  await page.getByRole('button', { name: 'Ativar minha loja' }).click();

  await expect(page).toHaveURL(/\/seller$/);
  await expect(page.getByRole('heading', { name: 'Painel do vendedor' })).toBeVisible();
});

test('vendedor publica um produto com foto', async ({ page }) => {
  await page.route('**/api/product/create', (route) =>
    route.fulfill({ json: { message: 'Produto criado com sucesso!' } }),
  );

  await page.goto('/seller/new');
  await expect(page.getByRole('heading', { name: 'Anuncie seu produto' })).toBeVisible();

  await page.getByLabel('Nome do produto').fill('Produto novo');
  await page.getByLabel('Categoria', { exact: true }).selectOption('electronics');
  await page.getByLabel('Preço (R$)').fill('99.90');
  await page.getByLabel('Estoque').fill('3');
  await page.getByLabel('Descrição').fill('Descrição do produto novo');
  await page.locator('#product-image').setInputFiles({
    name: 'foto.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await expect(page.locator('.seller__preview img')).toBeVisible();

  await page.getByRole('button', { name: 'Publicar anúncio' }).click();
  await expect(page.getByText('Anúncio publicado com sucesso!')).toBeVisible();
});

test('cliente atualiza dados e CPF', async ({ page }) => {
  await page.goto('/account');
  await expect(page.getByRole('heading', { name: 'Configurações da conta' })).toBeVisible();

  await page.getByLabel('CPF').fill('123.456.789-01');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByText('Dados atualizados com sucesso.')).toBeVisible();
});

test('cliente altera a senha', async ({ page }) => {
  await page.goto('/account');
  await page.getByRole('button', { name: 'Segurança' }).click();

  await page.getByLabel('Senha atual').fill('Senha@123');
  await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
  await page.getByLabel('Confirmar nova senha').fill('NovaSenha@123');
  await page.getByRole('button', { name: 'Alterar senha' }).click();

  await expect(page.getByText('Senha alterada com sucesso.')).toBeVisible();
});

test('painel do vendedor mostra métricas e anúncios', async ({ page }) => {
  await page.route('**/api/seller/dashboard', (route) =>
    route.fulfill({
      json: {
        productCount: 1,
        totalStock: 5,
        inventoryValue: 499.5,
        outOfStock: 0,
        orderCount: 1,
        products: [PRODUCTS[0]],
        salesLast7Days: [
          { label: '02/11', revenue: 0, orders: 0 },
          { label: '03/11', revenue: 0, orders: 0 },
          { label: '04/11', revenue: 100, orders: 1 },
          { label: '05/11', revenue: 0, orders: 0 },
          { label: '06/11', revenue: 0, orders: 0 },
          { label: '07/11', revenue: 0, orders: 0 },
          { label: '08/11', revenue: 0, orders: 0 },
        ],
        recentOrders: [
          {
            id: 10,
            status: 'PENDING',
            quantity: 1,
            total: 100,
            createdAt: '2026-11-08T10:00:00',
            productId: 1,
            productName: 'Produto de teste 1',
            productHasImage: false,
          },
        ],
      },
    }),
  );

  await page.goto('/seller');
  await expect(page.getByRole('heading', { name: 'Painel do vendedor' })).toBeVisible();
  await expect(page.getByText('Meus anúncios')).toBeVisible();
  await expect(page.getByText('Pedidos recentes')).toBeVisible();
  await expect(page.getByText('Pedido #10')).toBeVisible();
});

test('vendedor edita um produto', async ({ page }) => {
  await page.route('**/api/product/edit', (route) =>
    route.fulfill({ json: { message: 'Produto editado com sucesso!' } }),
  );

  await page.goto('/seller/edit/1');
  await expect(page.getByRole('heading', { name: 'Editar anúncio' })).toBeVisible();
  await page.getByLabel('Descrição').fill('Descrição editada');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByText('Anúncio atualizado com sucesso!')).toBeVisible();
});

test('central de ajuda tem seções detalhadas', async ({ page }) => {
  await page.goto('/help');
  await expect(page.getByRole('heading', { name: 'Como podemos ajudar?' })).toBeVisible();
  await expect(page.locator('#buying').getByRole('heading', { name: 'Comprar', exact: true })).toBeVisible();
  await expect(page.locator('#selling').getByRole('heading', { name: 'Vender', exact: true })).toBeVisible();
  await expect(page.getByText('Como faço uma compra?')).toBeVisible();
});

test('checkout cria o pedido e limpa o carrinho', async ({ page }) => {
  await page.route('**/api/order/create', (route) =>
    route.fulfill({ status: 201, json: { message: 'Pedido criado com sucesso!' } }),
  );

  await page.goto('/');
  await page
    .locator('app-product-card')
    .first()
    .getByRole('button', { name: 'Adicionar', exact: true })
    .click();
  await page.locator('app-cart-drawer').getByRole('button', { name: 'Finalizar compra' }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page.getByText('Pedido confirmado!')).toBeVisible();
});

test('lista os pedidos do usuário', async ({ page }) => {
  await page.route('**/api/order/user/1', (route) =>
    route.fulfill({
      json: [
        {
          id: 10,
          status: 'PENDING',
          quantity: 1,
          total: 100,
          createdAt: '2026-11-08T10:00:00',
          productId: 1,
          productName: 'Produto de teste 1',
          productHasImage: false,
        },
      ],
    }),
  );

  await page.goto('/orders');
  await expect(page.getByText('Pedido #10')).toBeVisible();
  await expect(page.getByText('Produto de teste 1')).toBeVisible();
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
