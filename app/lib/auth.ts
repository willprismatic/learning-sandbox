/**
 * HMAC-based session token utilities for access code authentication.
 * Uses Web Crypto API for Edge Runtime compatibility (Next.js middleware).
 *
 * Token format: {timestamp}.{hmac_hex}
 * The HMAC is computed over "{timestamp}.{accessCode}" using a derived key.
 */

const COOKIE_NAME = "demo_session";
const ENCODER = new TextEncoder();

async function getKey(accessCode: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    ENCODER.encode(accessCode),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function hexEncode(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexDecode(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Create a signed session token for a valid access code.
 */
export async function createSessionToken(accessCode: string): Promise<string> {
  const timestamp = Date.now().toString();
  const key = await getKey(accessCode);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    ENCODER.encode(`${timestamp}.${accessCode}`),
  );
  return `${timestamp}.${hexEncode(signature)}`;
}

/**
 * Validate a session token against the current access code.
 * Returns true if the token was signed with this access code.
 */
export async function validateSessionToken(
  token: string,
  accessCode: string,
): Promise<boolean> {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;

  const timestamp = token.substring(0, dotIndex);
  const signatureHex = token.substring(dotIndex + 1);

  if (!timestamp || !signatureHex) return false;

  try {
    const key = await getKey(accessCode);
    return crypto.subtle.verify(
      "HMAC",
      key,
      hexDecode(signatureHex),
      ENCODER.encode(`${timestamp}.${accessCode}`),
    );
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
