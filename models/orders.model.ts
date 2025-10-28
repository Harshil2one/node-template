export interface IOrder {
    id: string;
    user_id: number;
    order_id: string;
    receipt: string;
    payment_id: string;
    amount: number;
    status: string;
    created_at: number;
    restaurant: number;
    food: number[];
    affectedRows?: number;
  }
  