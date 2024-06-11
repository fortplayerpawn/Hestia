import type { ServerWebSocket } from "bun";
import type { ServiceData } from "../service";
import { findClientInQueue } from "../utilities/find";

export default function (socket: ServerWebSocket<ServiceData>) {
  const clients = findClientInQueue(
    socket.data.payload,
    socket.data.sessionId,
    socket.data.matchId
  );

  return socket.send(
    JSON.stringify({
      payload: {
        state: "Queued",
        status: clients.length === 0 ? 2 : 3,
        estimatedWaitSec: 10 * Math.random(),
        queuedPlayers: clients.length,
        ticketId: socket.data.ticketId,
      },
    })
  );
}
