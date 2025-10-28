export interface IUser {
  id: number;
  name: string;
  email: string;
  contact: string;
  password: string;
  isAdmin: boolean;
  image: string;
  cart: { restaurant: number; food: number[] };
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pin: string;
  };
  affectedRows?: number;
}
