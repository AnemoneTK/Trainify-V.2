import crypto from "crypto";

// ตั้งค่าคีย์และ IV จาก environment variables หรือค่าดีฟอลต์
const encryptionKey =
  process.env.ENCRYPTION_KEY || "TrainifyKey#CSI401SPUProjectKEYs"; // ควรเป็น 32 ไบต์ (256 บิต)
const iv = process.env.ENCRYPTION_IV || "TrainifyKey#CSIs"; // ควรเป็น 16 ไบต์ (128 บิต)

// ฟังก์ชันเข้ารหัส
function encryptData(data: string): string {
  // ตรวจสอบขนาดของคีย์และ IV
  if (Buffer.byteLength(encryptionKey) !== 32) {
    throw new Error("Encryption key must be 32 bytes (256 bits) long.");
  }
  if (Buffer.byteLength(iv) !== 16) {
    throw new Error(
      "Initialization vector (IV) must be 16 bytes (128 bits) long."
    );
  }

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "utf-8"), // ใช้ utf-8 แทน hex
    Buffer.from(iv, "utf-8") // ใช้ utf-8 แทน hex
  );

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// ฟังก์ชันถอดรหัส
function decryptData(encryptedData: string): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "utf-8"), // ใช้ utf-8 แทน hex
    Buffer.from(iv, "utf-8") // ใช้ utf-8 แทน hex
  );

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export { encryptData, decryptData };
