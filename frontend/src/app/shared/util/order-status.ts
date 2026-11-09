export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PAID: 'Pago',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  CANCELED: 'Cancelado',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
