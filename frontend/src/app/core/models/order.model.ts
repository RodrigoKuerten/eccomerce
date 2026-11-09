export interface Order {
  id: number;
  status: string;
  quantity: number;
  total: number;
  createdAt: string;
  productId: number;
  productName: string;
  productHasImage: boolean;
}

export interface CreateOrderPayload {
  userId: number;
  productId: number;
  quantity: number;
}
