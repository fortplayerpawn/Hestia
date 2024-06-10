import crypto from "node:crypto";

export function Decrypt(encryptedBase64: string, key: string): string {
  const keyBytes: Buffer = Buffer.from(key, "utf8");
  const sha256 = crypto.createHash("sha256");
  const hashedKeyBytes = sha256.update(keyBytes).digest();

  const encryptedData: Buffer = Buffer.from(encryptedBase64, "base64");

  const iv = encryptedData.slice(0, 16);
  const encryptedText = encryptedData.slice(16);

  const aes = crypto.createDecipheriv("aes-256-cbc", hashedKeyBytes, iv);
  aes.setAutoPadding(true);

  let decryptedData = aes.update(encryptedText);
  decryptedData = Buffer.concat([decryptedData, aes.final()]);

  return decryptedData.toString("utf8");
}
