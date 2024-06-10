import { app, config, logger } from "..";
import { clients } from "../storage/storage";
import authenticate, { type Payload } from "./authentication";
import uuid from "uuid";

interface AuthPayload extends Payload {
  accountId: string;
  timestamp: string;
  accessToken: string;
  playlist: string;
  buildId: string;
  region: string;
  customKey: string;
  userAgent: string;
}

export type ServiceData = {
  payload: AuthPayload;
  sessionId: string;
  matchId: string;
  ticketId: string;
};

Bun.serve<ServiceData>({
  port: config.matchmaker_port,
  async fetch(request, server) {
    if (!request.headers || !request.headers.get("Authorization"))
      return new Response("Missing headers.", {
        status: 400,
      });

    const authorization = request.headers.get("Authorization");

    if (!authorization)
      return new Response("Authorization payload is invalid.", {
        status: 400,
      });

    const [, , encrypted, json, signature] = authorization.split(" ");

    if (!encrypted)
      return new Response("Unauthorized request", { status: 401 });

    const key = request.headers.get("Sec-WebSocket-Key");
    const response = await authenticate(request.headers, signature);

    if (!response)
      return new Response("Authorization Payload is Invalid!", {
        status: 400,
      });

    const ticketId = uuid.v4().replace(/-/gi, "");
    const matchId = uuid.v4().toString().replace(/-/gi, "");
    const sessionId = uuid.v4().toString().replace(/-/gi, "");

    server.upgrade(request, {
      data: {
        key,
        body: encrypted,
        response,
        ticketId,
        matchId,
        sessionId,
      },
    });

    return new Response("Hestia MMS");
  },
  websocket: {
    open(socket) {
      clients.set(socket.data.payload.accountId, {
        sessionId: socket.data.sessionId,
        matchId: socket.data.matchId,
        customKey: socket.data.payload.customKey,
        accountId: socket.data.payload.accountId,
        ticketId: socket.data.ticketId,
        region: socket.data.payload.region,
        playlist: socket.data.payload.playlist,
        bucketId: socket.data.payload.buildId,
        socket,
      });
    },
    message(socket, message) {},
  },
});

logger.startup(`Matchmaker listening on port ${config.matchmaker_port}.`);
