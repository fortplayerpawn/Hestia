import dotenv from "dotenv";
import { ZodType, z } from "zod";

dotenv.config();

type ConfigType = z.infer<typeof configSchema>;

const configSchema = z.object({
  matchmaker_port: z.number(),
  http_port: z.number(),
  databaseUrl: z.string(),
});

export default class Config {
  private config: ConfigType;

  constructor() {
    const parsedConfig = configSchema.safeParse({
      matchmaker_port: parseInt(Bun.env.matchmaker_port as string, 10),
      http_port: parseInt(Bun.env.http_port as string, 10),
      databaseUrl: Bun.env.databaseUrl,
    });

    // Check if parsing was successful
    if (!parsedConfig.success)
      throw new Error(
        parsedConfig.error.errors.map((err) => err.message).join("\n")
      );

    this.config = parsedConfig.data;
  }

  public getConfig(): ConfigType {
    // console.log("Config registered:", this.config);

    return this.config;
  }
}
