import { Ed25519Signer } from "@sovereign-sdk/signers";
import { hexToBytes } from "@sovereign-sdk/utils";

async function main() {
  const pk = "5087c12ea7c12024b3f798c5d73587463af17c9fce04d9e6fe873893102a6c64";
  const bytes = hexToBytes(pk);
  const signer = new Ed25519Signer(bytes);
  
  // Try to get pubkey
  const pubkey = await signer.publicKey();
  console.log("pubkey:", pubkey);

  // Check how to encode base58. Can we import bs58?
  try {
    const bs58 = require("bs58");
    console.log("bs58 found:", bs58.encode(pubkey));
  } catch(e) {
    console.log("bs58 not found");
  }
}
main().catch(console.error);
