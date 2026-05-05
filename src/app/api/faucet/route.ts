import { Ed25519Signer } from "@sovereign-sdk/signers";
import { NextResponse } from "next/server";
import { tokens } from "@/config/constants";
import { rollupChainId, rollupEndpoint } from "@/config/env";
import { RollupClient } from "@/lib/rollup";
import { parseUsd } from "@/utils";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const minterKey = process.env.USDC_MINTER_PRIVATE_KEY;
    if (!minterKey) {
      console.error("USDC_MINTER_PRIVATE_KEY not found in environment");
      return NextResponse.json({ error: "Faucet not configured" }, { status: 500 });
    }

    const client = new RollupClient(rollupEndpoint, rollupChainId);
    const signer = new Ed25519Signer(minterKey);
    const amount = parseUsd(10000);

    const callMessage = {
      bank: {
        mint: {
          mint_to_address: address,
          coins: {
            amount: amount,
            token_id: tokens.usdc.id,
          },
        },
      },
    };

    await client.rollup.call(callMessage, { signer });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Faucet error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mint test funds" },
      { status: 500 },
    );
  }
}
