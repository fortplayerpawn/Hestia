import { app, config } from "..";

Bun.serve({
  port: config.matchmaker_port,
  fetch(request, server) {
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

    server.upgrade(request, {
      data: {
        key,
        body: encrypted,
      },
    });

    return new Response("Hestia MMS");
  },
});
