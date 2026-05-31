import { bytesToNumberBE, concatBytes, numberToBytesBE } from "@noble/ciphers/utils.js";
import { randomBytes } from "@noble/hashes/utils.js";
import { circuitPath } from "@/config/constants";
import type { MerkleTree } from "../tree";
import { generateSnarkProof } from "../zk";
import { Note } from "./note";

export const generateTxProof = async (params: {
  note: Note;
  amount: bigint;
  tree: MerkleTree;
  isDeposit: boolean;
  isAccountCreation: boolean;
}) => {
  const { note, amount, tree, isDeposit, isAccountCreation } = params;

  if (!Number.isFinite(note.index)) {
    throw new Error("Note index is required for proof generation");
  }

  const root = tree.root;

  let publicDepositAmount: bigint = 0n;
  let publicWithdrawAmount: bigint = 0n;
  let forceDummyNote: boolean = false;
  const outputNote = new Note({
    owner: note.owner,
    amount: note.amount,
    salt: bytesToNumberBE(randomBytes(24)),
    nonce: note.nonce + 1n,
  });

  if (isAccountCreation) {
    forceDummyNote = true;
  }

  if (isDeposit) {
    publicDepositAmount = amount;
    outputNote.amount += amount;
  } else {
    publicWithdrawAmount = amount;
    outputNote.amount -= amount;
  }

  if (outputNote.amount < 0n) {
    throw new Error("Invalid output note amount");
  }

  let pathElements: bigint[];
  let pathIndices: bigint[];

  // Account creation required dummy input note
  if (isAccountCreation) {
    pathElements = Array(tree.depth).fill(0n);
    pathIndices = Array(tree.depth).fill(0n);
  } else {
    const merkleProof = tree.createProof(note.index as number);
    pathElements = merkleProof.pathElements;
    pathIndices = merkleProof.pathIndices;
  }

  console.log("note==", note);

  const inputs = {
    // Public inputs
    root,
    nullifier: note.nullifier(),
    output_commitment: outputNote.commitment(),
    force_dummy_note: BigInt(forceDummyNote),
    public_deposit_amount: publicDepositAmount,
    public_withdraw_amount: publicWithdrawAmount,
    // Private inputs of input note
    owner: note.owner,
    amount: note.amount,
    salt: note.salt,
    nonce: note.nonce,
    note_index: BigInt(note.index || 0),
    path_elements: pathElements,
    path_indices: pathIndices,
    // Private inputs of output note
    output_owner: outputNote.owner,
    output_amount: outputNote.amount,
    output_salt: outputNote.salt,
    output_nonce: outputNote.nonce,
  };

  const snarkJs = (globalThis as any).snarkjs;

  if (!snarkJs) {
    throw new Error("Snarkjs not found or not ready");
  }

  const { proof } = await generateSnarkProof({
    snarkJs,
    inputs,
    circuit: circuitPath,
  });

  const proofBigInts = [...proof.a, ...proof.b.flat(), ...proof.c];
  const proofBytesArr = proofBigInts.map((n) => numberToBytesBE(n, 32) as Uint8Array);
  const proofBytes = concatBytes(...proofBytesArr) as Uint8Array;

  const publicInputs = {
    root,
    nullifier: inputs.nullifier,
    outputCommitment: inputs.output_commitment,
    forceDummyNote: inputs.force_dummy_note,
    publicDepositAmount: inputs.public_deposit_amount,
    publicWithdrawAmount: inputs.public_withdraw_amount,
  };

  return {
    proof: proofBytes,
    publicInputs,
    outputNote,
  };
};
