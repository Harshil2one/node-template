export interface ICoupon {
  id: number;
  code: string;
  discount: number;
  isActive: number;
  redeemed: number[];
  affectedRows?: number;
}
