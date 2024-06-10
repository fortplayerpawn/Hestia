import { Hono } from "hono";
import Logger, { LogLevel } from "./utils/logging";
import Config from "./wrappers/Env.wrapper";
import Database from "./wrappers/Database.wrapper";

export const config = new Config().getConfig();
export const app = new Hono({ strict: false });
export const logger = new Logger(LogLevel.DEBUG);

const db = new Database();

db.connect();
db.createTables();

import("./mms/service");

Bun.serve({
  fetch: app.fetch,
  port: config.http_port,
});

logger.startup(`HTTP listening on port ${config.http_port}.`);
