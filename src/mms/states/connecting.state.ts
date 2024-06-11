import type { ServerWebSocket } from "bun";
import type { ServiceData } from "../service";

export default function (socket: ServerWebSocket<ServiceData>) {
  return socket.send(
    JSON.stringify({
      payload: {
        state: "Connecting",
      },
      name: "StatusUpdate",
    })
  );
}
