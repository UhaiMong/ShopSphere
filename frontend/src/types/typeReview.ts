// Review
export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  product: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}
