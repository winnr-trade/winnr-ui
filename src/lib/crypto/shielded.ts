import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { babyjubjub } from '@noble/curves/misc.js';
import { bytesToNumberBE, numberToBytesBE } from '@noble/curves/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAIN = "v1-winnr-shielded";
const ORDER = babyjubjub.Point.CURVE().n;

function modField(bytes: Uint8Array): Uint8Array {
    const scalar = bytesToNumberBE(bytes) % ORDER;
    return numberToBytesBE(scalar, 32);
}



/**
 * The message the user must sign with their main wallet to register a shielded
 * wallet.  The resulting signature is used as the entropy source for all key
 * derivations below.
 */
export const shieldedRegistrationMessage = (walletAddress: string) =>
    `Winnr Shielded Wallet Registration\nmain wallet: ${walletAddress}\nversion: 1`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShieldedWallet {
    /** 32-byte master secret — never expose this outside key-derivation code. */
    masterSecret: Uint8Array;
    /** 32-byte spending key — authorises creating / nullifying notes. */
    spendingKey: Uint8Array;
    /** 32-byte viewing key — allows reading note contents without spending. */
    viewingKey: Uint8Array;
    /** 32-byte stealth secret — root for all stealth address derivation, derived
     *  from spendingKey (not masterSecret) to separate signing authority from
     *  derivation root. */
    stealthSecret: Uint8Array;
}

// ─── Derivation ───────────────────────────────────────────────────────────────

/**
 * Derives a ShieldedWallet from the raw bytes of the signature
 *
 * Derivation tree (HKDF-SHA256):
 *
 *   signature
 *     └─ masterSecret  (IKM = signature,     salt = DOMAIN, info = "master")
 *          ├─ spendingKey (IKM = masterSecret, salt = DOMAIN, info = "spend")
 *          └─ viewingKey  (IKM = masterSecret, salt = DOMAIN, info = "view")
 */
export const deriveShieldedWallet = (signature: Uint8Array): ShieldedWallet => {
    const salt = new TextEncoder().encode(DOMAIN);

    // Step 1 — master secret
    const masterSecret = hkdf(
        sha256,
        signature,                            // IKM  — entropy source
        salt,                                 // salt — fixed domain string
        new TextEncoder().encode("master"),   // info — purpose label
        32,
    );

    // Step 2 — spending key
    const spendingKey = modField(hkdf(
        sha256,
        masterSecret,                         // IKM
        salt,                                 // same salt
        new TextEncoder().encode("spend"),    // different info → different output
        48,
    ));

    // Step 3 — viewing key
    const viewingKey = modField(hkdf(
        sha256,
        masterSecret,                         // IKM
        salt,                                 // same salt
        new TextEncoder().encode("view"),     // different info → different output
        48,
    ));

    // Step 4 — stealth secret (root for all stealth address derivation)
    // Derived from spendingKey, not masterSecret — separates signing authority
    // from the derivation root used by stealth addresses.
    const stealthSecret = hkdf(
        sha256,
        spendingKey,                          // IKM
        salt,                                 // same salt
        new TextEncoder().encode("stealth"),  // different info → different output
        32,
    );

    return { masterSecret, spendingKey, viewingKey, stealthSecret };
};
