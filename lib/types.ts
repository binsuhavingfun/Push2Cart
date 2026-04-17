export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  average_rating?: number;
  review_count?: number;
};

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
};

export type AuthUser = {
  id: string;
  email?: string | null;
};

export type OrderStatus =
  | "Order Placed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered";

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  address: string;
  phone?: string | null;
  full_name?: string | null;
};

export type Voucher = {
  id: string;
  user_id: string;
  code: string;
  discount_percent: number;
  is_used: boolean;
};

export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  username?: string;
};
