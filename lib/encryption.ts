import crypto from "crypto";

// ENCRYPTION_KEY harus 32 byte, di-generate sekali lalu disimpan di .env
// (lihat ENCRYPTION_KEY di .env.example — generate dengan:
//  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY tidak ditemukan di environment variables");
  }
  return Buffer.from(key, "base64");
}

// Format hasil: iv:authTag:ciphertext (semua base64, dipisah ':')
export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decrypt(cipherText: string): string {
  const [ivB64, authTagB64, dataB64] = cipherText.split(":");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Format ciphertext tidak valid");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
