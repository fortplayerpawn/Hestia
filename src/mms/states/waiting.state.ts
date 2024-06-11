import type { ServerWebSocket } from "bun";
import type { ServiceData } from "../service";
import { clientsSetup } from "../../storage/storage";
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
        totalPlayers: clients.length,
        connectedPlayers: clients.length,
        state: "Waiting",
      },
      name: "StatusUpdate",
    })
  );
}
