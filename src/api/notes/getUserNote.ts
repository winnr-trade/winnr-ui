import { hexToBytes } from "@noble/ciphers/utils.js";
import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { Note } from "@/lib/crypto/tx/note";

interface NoteResponseItem {
  leaf_index: number;
  memo: string;
}

const getStoredNote = (mainAddress: string): Note | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(`winnr_shielded_note_${mainAddress}`);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return new Note({
      owner: BigInt(parsed.owner),
      amount: BigInt(parsed.amount),
      salt: BigInt(parsed.salt),
      nonce: BigInt(parsed.nonce),
      index: parsed.index !== undefined ? Number(parsed.index) : undefined,
    });
  } catch {
    return null;
  }
};

const setStoredNote = (mainAddress: string, note: Note): void => {
  if (typeof window === "undefined") return;
  const serialized = {
    owner: note.owner.toString(),
    amount: note.amount.toString(),
    salt: note.salt.toString(),
    nonce: note.nonce.toString(),
    index: note.index,
  };
  localStorage.setItem(`winnr_shielded_note_${mainAddress}`, JSON.stringify(serialized));
};

export const getUserNote = async (
  mainAddress: string,
  shieldedWallet: ShieldedWallet,
): Promise<Note | null> => {
  const lastNote = getStoredNote(mainAddress);
  const fromIndex = lastNote && typeof lastNote.index === "number" ? lastNote.index : 0;

  let latestNote = lastNote;
  let page = 0;
  const limit = 100;
  let hasMore = true;

  try {
    while (hasMore) {
      const { data } = await http.get<{ success: boolean; data: NoteResponseItem[] }>("/notes", {
        params: {
          from_index: fromIndex,
          page,
          limit,
        },
      });

      const batch = data.data || [];
      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of batch) {
        const memoHex = item.memo;
        if (!memoHex) continue;

        const cleanHex = memoHex.startsWith("0x") ? memoHex.slice(2) : memoHex;
        let memoBytes: Uint8Array;
        try {
          memoBytes = hexToBytes(cleanHex);
        } catch {
          continue;
        }

        const decrypted = Note.fromMemo(memoBytes, shieldedWallet);
        if (decrypted) {
          latestNote = new Note({
            owner: decrypted.owner,
            amount: decrypted.amount,
            salt: decrypted.salt,
            nonce: decrypted.nonce,
            index: Number(item.leaf_index),
          });
        }
      }

      if (batch.length < limit) {
        hasMore = false;
      } else {
        page++;
      }
    }

    if (latestNote) {
      setStoredNote(mainAddress, latestNote);
    }
  } catch (error) {
    console.error("Failed to fetch/decrypt user notes:", error);
  }

  return latestNote;
};

export const useGetShieldedNote = (params: {
  mainAddress?: string;
  shieldedWallet?: ShieldedWallet | null;
}) => {
  const { mainAddress, shieldedWallet } = params;
  return useQuery({
    queryKey: ["shieldedNote", mainAddress],
    queryFn: async () => {
      if (!mainAddress || !shieldedWallet) return null;
      return getUserNote(mainAddress, shieldedWallet);
    },
    enabled: !!mainAddress && !!shieldedWallet,
  });
};
