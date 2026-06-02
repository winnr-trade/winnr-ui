import { babyjubjub } from "@noble/curves/misc.js";
import { bytesToNumberBE, numberToBytesBE } from "@noble/curves/utils";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { poseidonHash } from "./hash";

const DOMAIN = "v1-winnr-shielded";
const ORDER = babyjubjub.Point.CURVE().n;

function modField(bytes: Uint8Array): Uint8Array {
  const scalar = bytesToNumberBE(bytes) % ORDER;
  return numberToBytesBE(scalar, 32);
}

export class ShieldedWallet {
  /** 32-byte master secret — never expose this outside key-derivation code. */
  readonly masterSecret: Uint8Array;
  /** 32-byte spending key — authorises creating / nullifying notes. */
  readonly spendKey: Uint8Array;
  /** 32-byte viewing key — allows reading note contents without spending. */
  readonly viewKey: Uint8Array;
  /** 32-byte stealth secret — root for all stealth address derivation, derived
   *  from spendKey (not masterSecret) to separate signing authority from
   *  derivation root. */
  readonly stealthSecret: Uint8Array;
  /** poseidonHash of Point calc from spendKey scalar mul */
  readonly address: bigint;

  constructor(params: {
    masterSecret: Uint8Array;
    spendKey: Uint8Array;
    viewKey: Uint8Array;
    stealthSecret: Uint8Array;
  }) {
    this.masterSecret = params.masterSecret;
    this.spendKey = params.spendKey;
    this.viewKey = params.viewKey;
    this.stealthSecret = params.stealthSecret;

    const spendKeyScalar = bytesToNumberBE(params.spendKey);
    const p = babyjubjub.Point.BASE.multiply(spendKeyScalar);
    this.address = poseidonHash([p.x, p.y]);
  }

  /**
   * Derivation tree (HKDF-SHA256):
   *
   *   masterSecret
   *     ├─ spendKey     (IKM = masterSecret, salt = DOMAIN, info = "spend")
   *     │    └─ stealthSecret (IKM = spendKey, salt = DOMAIN, info = "stealth")
   *     └─ viewKey      (IKM = masterSecret, salt = DOMAIN, info = "view")
   */
  static fromMasterKey(masterSecret: Uint8Array): ShieldedWallet {
    const salt = new TextEncoder().encode(DOMAIN);

    const spendKey = modField(
      hkdf(sha256, masterSecret, salt, new TextEncoder().encode("spend"), 48),
    );

    const viewKey = modField(
      hkdf(sha256, masterSecret, salt, new TextEncoder().encode("view"), 48),
    );

    const stealthSecret = hkdf(sha256, spendKey, salt, new TextEncoder().encode("stealth"), 32);

    return new ShieldedWallet({
      masterSecret,
      spendKey,
      viewKey,
      stealthSecret,
    });
  }

  /**
   * Derives a full ShieldedWallet from a raw signature.
   * Use this when creating the wallet for the first time.
   * Use `fromMasterKey` when recovering from a stored masterSecret.
   */
  static fromSignature(signature: Uint8Array): ShieldedWallet {
    const salt = new TextEncoder().encode(DOMAIN);
    const masterSecret = hkdf(sha256, signature, salt, new TextEncoder().encode("master"), 32);
    return ShieldedWallet.fromMasterKey(masterSecret);
  }
}
