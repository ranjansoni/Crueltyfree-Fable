export type Country = "CA" | "US";

export type Category =
  | "Makeup"
  | "Skincare"
  | "Hair"
  | "Body"
  | "Oral Care"
  | "Household";

export type Certification = "Leaping Bunny" | "PETA" | "Leaping Bunny + PETA";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  description: string;
  price_cad: number;
  price_usd: number;
  certification: Certification;
  vegan: boolean;
  emoji: string;
  stores_ca: string[];
  stores_us: string[];
  available_ca: boolean;
  available_us: boolean;
  tags: string[];
  upvotes: number;
  downvotes: number;
}

export interface Swap {
  id: string;
  conventional_name: string;
  conventional_brand: string;
  conventional_price_cad: number;
  conventional_price_usd: number;
  product_slug: string;
  note: string;
}

export interface VotePayload {
  productId: string;
  deviceId: string;
  vote: 1 | -1;
}
