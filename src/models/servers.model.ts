export enum ServerStatus {
  Online = "online",
  Offline = "offline",
  Maintenance = "maintenance",
}

export interface Server {
  id: string;
  region: string;
  playlist: string;
  status: ServerStatus;
  maxPlayers: number;
  players: number;
  bucketId: string;
  customKey: string;
  ip: string;
  port: number;
}
