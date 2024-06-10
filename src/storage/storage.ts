import type { ServerWebSocket } from "bun";
import type { ServiceData } from "../mms/service";

interface Client {
  sessionId: string;
  matchId: string;
  customKey: string;
  accountId: string;
  ticketId: string;
  region: string;
  playlist: string;
  bucketId: string;
  socket: ServerWebSocket<ServiceData>;
}

export const clients: Map<string, Client> = new Map();

export const clientsSetup = {
  getClients: (): Client[] => {
    return Array.from(clients.values());
  },
  getClientById: (id: string): Client | undefined => {
    return clients.get(id);
  },
  addClient: (id: string, client: Client): void => {
    clients.set(id, client);
  },
  deleteClient: (id: string): void => {
    clients.delete(id);
  },
};
