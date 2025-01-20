import crypto from "crypto";

export function createHmacHash(data: string) {
  const secretKey = process.env.SECRET_KEY || "";
  return crypto.createHmac("sha256", secretKey).update(data).digest("hex");
}
