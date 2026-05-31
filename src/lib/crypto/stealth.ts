import { numberToBytesBE } from "@noble/ciphers/utils.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { concatBytes } from "@noble/hashes/utils.js";

const STEALTH_DOMAIN = "v1-winnr-stealth";
const DETECTION_TAG_LENGTH = 32;

export const deriveStealthKey = (stealthSecret: Uint8Array, nonce: bigint): Uint8Array => {
  const domain = new TextEncoder().encode(STEALTH_DOMAIN);
  const info = numberToBytesBE(nonce, 8);
  const seed = hkdf(sha256, stealthSecret, domain, info, 32);
  return seed as Uint8Array;
};

export function deriveDetectionTag(
  viewKey: Uint8Array,
  marketId: number,
  nonce: bigint,
): Uint8Array {
  const info = concatBytes(numberToBytesBE(nonce, 8), numberToBytesBE(marketId, 8));
  return hmac(sha256, viewKey, info).slice(0, DETECTION_TAG_LENGTH) as Uint8Array;
}
