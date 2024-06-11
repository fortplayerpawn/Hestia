import { app, config, logger } from "..";
import { clients, clientsSetup } from "../storage/storage";
import authenticate, { type Payload } from "./authentication";
import { v4 as uuid } from "uuid";
import { findClientInQueue } from "./utilities/find";
import { createNewQueue } from "./utilities/queue";
import connectingState from "./states/connecting.state";
import waitingState from "./states/waiting.state";
import queuedState from "./states/queued.state";

export interface AuthPayload extends Payload {
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

    const ticketId = uuid().replace(/-/gi, "");
    const matchId = uuid().replace(/-/gi, "");
    const sessionId = uuid().replace(/-/gi, "");

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
      const { data } = socket;
      const { payload } = data;

      clientsSetup.addClient(payload.accountId, {
        sessionId: data.sessionId,
        matchId: data.matchId,
        customKey: payload.customKey,
        accountId: payload.accountId,
        ticketId: data.ticketId,
        region: payload.region,
        playlist: payload.playlist,
        bucketId: payload.buildId,
        socket,
      });

      const clientsInQueue = findClientInQueue(
        payload,
        data.sessionId,
        data.matchId
      );

      // leave this out for now
      // if (!clientsInQueue || clientsInQueue.length === 100)
      //   createNewQueue(socket);

      connectingState(socket);
      waitingState(socket);
      queuedState(socket);
    },
    message(socket, message) {},
  },
});

logger.startup(`Matchmaker listening on port ${config.matchmaker_port}.`);
