import { users } from "../config/socket.config";

// Handle emit to user for multiple tab open
export const emitToUser = (
  io: any,
  userIds: number | number[],
  event: string,
  payload: any,
  notification?: any
) => {
  const ids = Array.isArray(userIds) ? userIds : [userIds];

  ids.forEach((userId) => {
    const socketIds = users.get(userId);
    if (socketIds) {
      socketIds.forEach((id: string) => {
        io?.to(id).emit(event, payload);

        if (notification) {
          io.to(id).emit("receive_notification", notification);
        }
      });
    } else {
      console.log(`User ${userId} is not connected`);
    }
  });
};
