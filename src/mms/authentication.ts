import { config } from "..";
import { Decrypt } from "../utils/AESEncryption";
import { z } from "zod";

const PayloadSchema = z.object({
  accountId: z.string(),
  timestamp: z.string(),
  accessToken: z.string(),
  playlist: z.string(),
  buildId: z.string(),
  region: z.string(),
  customKey: z.string(),
});

export interface Payload extends z.infer<typeof PayloadSchema> {}

export default async function authenticate(
  headers: Headers,
  signature: string
): Promise<any> {
  try {
    const authorization = headers.get("Authorization");

    if (
      !authorization ||
      !authorization.includes("Epic-Signed") ||
      !authorization.includes("mms-player")
    )
      throw new Error("Unauthorized request");

    const decodedSignature = Decrypt(signature, config.encryptionKey);

    if (!decodedSignature) throw new Error("Invalid Encryption Key.");

    let parsedPayload: Payload;

    try {
      parsedPayload = PayloadSchema.parse(JSON.parse(decodedSignature));
    } catch (error) {
      return new Response("Failed to parse Payload!");
    }

    const tokenTimestamp: Date = new Date(parsedPayload.timestamp);

    if (!isNaN(tokenTimestamp.getTime())) {
      const currentUtcTime: Date = new Date();
      const tokenLifetimeThreshold: number = 24 * 60 * 60 * 1000;

      if (
        currentUtcTime.getTime() - tokenTimestamp.getTime() <=
        tokenLifetimeThreshold
      )
        return parsedPayload;

      throw new Error("Socket connection terminated!");
    } else {
      throw new Error("Invalid timestamp in payload.");
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid payload format.");
    } else {
      const err: Error = error as Error;
      throw new Error(err.message);
    }
  }
}
