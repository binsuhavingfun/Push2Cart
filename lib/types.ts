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

export type PaymentMethod = "Cash on Delivery";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_method?: PaymentMethod | null;
  payment_status?: PaymentStatus | null;
  total_price: number;
  created_at: string;
  address: string;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  street_address?: string | null;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  delivery_notes?: string | null;
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
