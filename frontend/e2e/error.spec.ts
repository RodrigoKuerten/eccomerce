import { test, expect } from '@playwright/test';

test('página 404 personalizada oferece caminhos de volta', async ({ page }) => {
  await page.goto('/endereco-que-nao-existe');

  const error = page.locator('.error');

  await expect(error.getByRole('heading', { name: /saiu da praça/i })).toBeVisible();
  await expect(error.getByText('Erro 404')).toBeVisible();
  await expect(error.getByRole('link', { name: 'Voltar para a home' })).toHaveAttribute(
    'href',
    '/',
  );
  await expect(error.getByRole('link', { name: 'Explorar produtos' })).toHaveAttribute(
    'href',
    '/products',
  );
});

test('página de erro genérico oferece caminhos de volta', async ({ page }) => {
  await page.goto('/error');

  const error = page.locator('.error');

  await expect(error.getByRole('heading', { name: /algo deu errado/i })).toBeVisible();
  await expect(error.getByRole('link', { name: 'Central de ajuda' })).toHaveAttribute(
    'href',
    '/help',
  );
});
