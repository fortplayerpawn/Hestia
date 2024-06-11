import { clientsSetup } from "../../storage/storage";
import type { AuthPayload } from "../service";

export function findClientInQueue(
  payload: AuthPayload,
  sessionId: string,
  matchId: string
) {
  const { region, playlist, customKey } = payload;

  return clientsSetup
    .getClients()
    .filter(
      (x) =>
        x.region === region &&
        x.playlist === playlist &&
        x.customKey === customKey &&
        x.sessionId === sessionId &&
        x.matchId === matchId
    );
}
