import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

let server: any = null;
let io: Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
> | null = null;
let socket: Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
> | null = null;

export const users = new Map();

export const initializeSocket = (app: Express.Application) => {
  server = createServer(app);
  io = new Server(server, { cors: { origin: "*" } });

  io.on(
    "connection",
    (
      _socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ) => {
      socket = _socket;

      socket.on("register", (userId) => {
        if (!users.has(userId)) {
          users.set(userId, new Set());
        }
        users.get(userId)?.add(socket?.id);
      });

      socket.on("disconnect", () => {
        for (const [userId, socketSet] of users.entries()) {
          socketSet.delete(socket?.id);
          if (socketSet.size === 0) {
            users.delete(userId);
          }
        }
      });
    }
  );

  return { io, server };
};

export const getSocket = () => ({ io, socket });
