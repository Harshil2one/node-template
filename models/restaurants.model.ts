import { RESTAURANT_MODE, RESTAURANT_TYPE } from "../enums/restaurants.enum";

export interface IRestaurant {
  id: number;
  open: number;
  name: string;
  images: string[];
  address: string;
  email: string;
  contact: string;
  time  : string;
  distance?: string;
  ratings?: number;
  rate?: number;
  special: string[];
  type: RESTAURANT_TYPE;
  offers: string[];
  bankOffers?: string;
  mode: RESTAURANT_MODE;
  food: number[];
  created_by: number;
  affectedRows?: number;
  insertId?: number;
}

export interface IFood {
  id: number;
  image: string;
  name: string;
  description?: string;
  price: number;
  type: RESTAURANT_TYPE;
  isBest: number;
  ratings: number;
  ratingsCount: number;
  affectedRows?: number;
}

export interface IBooking {
  readonly id: number;
  table_number: number;
  restaurant_id: number;
  user_id: number;
  persons: number;
  time: string;
  created_at: string;
  affectedRows?: number;
}