import { ORDER_STATUS } from "../enums/restaurants.enum";

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
  order_status: ORDER_STATUS;
  pickup_by: number;
  pickup_time: number;
  delivery_fee: number;
  ratings: number;
  ratingsText: string;
  affectedRows?: number;
}
