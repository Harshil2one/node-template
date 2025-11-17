export interface IUser {
  id: number;
  name: string;
  email: string;
  contact: string;
  password: string;
  image: string;
  cart: { restaurant: number; food: number[] };
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pin: string;
  };
  readonly role: number;
  readonly token: string | null;
  affectedRows?: number;
}

export interface IRole {
  readonly id: number;
  role: string;
}
