import { Hono } from "hono";
import Logger, { LogLevel } from "./utils/logging";
import Config from "./wrappers/Env.wrapper";

export const config = new Config().getConfig();
export const app = new Hono({ strict: false });

Bun.serve({
  fetch: app.fetch,
  port: config.http_port,
});
