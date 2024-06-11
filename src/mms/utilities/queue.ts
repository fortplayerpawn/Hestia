import type { ServerWebSocket } from "bun";
import type { ServiceData } from "../service";

export function createNewQueue(socket: ServerWebSocket<ServiceData>) {
  const { region, playlist, buildId, customKey } = socket.data.payload;

  
}
