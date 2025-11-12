import db from "../config/db.config";
import { USER_ROLE } from "../enums/auth.enum";
import { IUser } from "../models/auth.model";

export const getUsers = async (role: USER_ROLE, id?: number) => {
  let users = [];
  if (id) {
    const [data] = (await db.query(
      "SELECT * FROM users WHERE role = ? AND id = ?",
      [role, id]
    )) as any;
    users = data;
  } else {
    const [data] = (await db.query("SELECT * FROM users WHERE role = ?", [
      role,
    ])) as any;
    users = data;
  }
  return users?.map((user: IUser) => user?.id);
};
