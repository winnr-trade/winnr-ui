"use client";

import { Keypair } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Shield } from "lucide-react";
import { getUserNote } from "@/api/notes";
import { getBalance } from "@/api/wallet/getBalance";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tokens } from "@/config/constants";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { deriveStealthKey } from "@/lib/crypto/stealth";
import { formatCurrency, truncateAddress } from "@/utils";

interface StealthAddressEntry {
  address: string;
  nonce: bigint;
  balance: bigint;
}

/** Minimum balance threshold: 1 cent = 10_000 in 6-decimal units */
const MIN_BALANCE = 10_000n;
const BATCH_SIZE = 5;
/** Stop after this many consecutive batches where every address has zero balance */
const MAX_EMPTY_BATCHES = 2;

async function fetchStealthAddressesWithBalance(
  mainAddress: string,
  shieldedWallet: ShieldedWallet,
): Promise<StealthAddressEntry[]> {
  const latestNote = await getUserNote(mainAddress, shieldedWallet);
  if (!latestNote || latestNote.nonce === 0n) return [];

  const entries: StealthAddressEntry[] = [];
  let consecutiveEmptyBatches = 0;
  let nonce = latestNote.nonce;

  while (nonce >= 1n) {
    // 1. Derive a batch of addresses (no async work yet)
    const batch: { nonce: bigint; address: string }[] = [];
    for (let i = 0; i < BATCH_SIZE && nonce >= 1n; i++, nonce--) {
      const stealthPrivateKey = deriveStealthKey(shieldedWallet.stealthSecret, nonce);
      const address = Keypair.fromSeed(stealthPrivateKey).publicKey.toBase58();
      batch.push({ nonce, address });
    }

    // 2. Fetch all balances in the batch concurrently
    const balances = await Promise.all(
      batch.map(({ address }) => getBalance(address, tokens.usdc.id)),
    );

    // 3. Collect entries that meet the threshold
    let batchHasBalance = false;
    for (let i = 0; i < batch.length; i++) {
      const balance = balances[i];
      if (balance >= MIN_BALANCE) {
        entries.push({ address: batch[i].address, nonce: batch[i].nonce, balance });
        batchHasBalance = true;
      }
    }

    // 4. Early-exit if too many consecutive empty batches
    if (batchHasBalance) {
      consecutiveEmptyBatches = 0;
    } else {
      consecutiveEmptyBatches++;
      if (consecutiveEmptyBatches >= MAX_EMPTY_BATCHES) break;
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StealthAddresses() {
  const { address: mainAddress } = useMainWallet();
  const { isEnabled, wallet } = useShieldedWallet();

  const { data: entries, isLoading } = useQuery({
    queryKey: ["stealthAddresses", mainAddress],
    queryFn: () => {
      if (!mainAddress || !wallet) throw new Error("Missing wallet context");
      return fetchStealthAddressesWithBalance(mainAddress, wallet);
    },
    enabled: isEnabled && !!mainAddress && !!wallet,
    staleTime: 30_000,
  });

  // Only renders in private mode
  if (!isEnabled) return null;

  const handleCollect = (_address: string) => {
    // TODO: implement collect logic
  };

  return (
    <div className="flex flex-col mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
          Stealth Addresses
        </h2>
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border px-3 py-1 bg-surface-container-low rounded-none">
          {isLoading ? "—" : `${entries?.length ?? 0} Active`}
        </span>
      </div>

      <div className="border border-border bg-surface-container-low rounded-none">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground text-xs font-sans uppercase tracking-widest">
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning stealth addresses...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4">
                  Address
                </TableHead>
                <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                  Nonce
                </TableHead>
                <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                  Balance
                </TableHead>
                <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries && entries.length > 0 ? (
                entries.map((entry) => (
                  <TableRow
                    key={entry.address}
                    className="border-b border-border/50 hover:bg-surface-container transition-colors"
                  >
                    <TableCell className="px-4 py-4">
                      <span className="text-sm font-mono text-violet-300" title={entry.address}>
                        {truncateAddress(entry.address, 6, 6)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-4 py-4">
                      <span className="text-sm font-sans font-bold text-muted-foreground">
                        #{entry.nonce.toString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-4 py-4">
                      <span className="text-sm font-sans font-bold text-white">
                        {formatCurrency(entry.balance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-4 py-4">
                      <Button
                        variant="outline"
                        size="xs"
                        className="text-violet-400 tracking-widest uppercase border-violet-500/30 bg-violet-500/5 hover:text-violet-300 hover:border-violet-400 hover:bg-violet-500/15 transition-colors shadow-none rounded-none"
                        onClick={() => handleCollect(entry.address)}
                      >
                        COLLECT
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="p-12 text-center">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      No stealth addresses with balance found
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
