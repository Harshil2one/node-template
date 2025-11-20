import db from "../config/db.config";
import { USER_ROLE } from "../enums/auth.enum";
import { IUser } from "../models/auth.model";
import admin from "firebase-admin";

export const getUser = async (id: number): Promise<IUser> => {
  const [[user]] = (await db.query("SELECT * FROM users WHERE id = ?", [
    id,
  ])) as unknown as [[IUser]];
  return user;
};

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

export const sendFCM = async (
  token: string,
  title: string,
  body: string,
  link?: string
) => {
  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          title,
          body,
          icon: "/logo.png",
        },
        fcmOptions: {
          link: "http://localhost:5173" + link || "",
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Notification Send:", response);
  } catch (err: any) {
    console.error("ERROR:", err.errorInfo || err);
  }
};
