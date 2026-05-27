import { randomBytes } from "@noble/hashes/utils.js";
import { bytesToNumberBE } from "@noble/ciphers/utils.js";
import { circuitPath } from "@/config/constants";
import { Note } from "./note"
import { generateSnarkProof } from "../zk";
import { MerkleTree } from "../tree";

export const generateProof = async (params: {
    note: Note,
    amount: bigint,
    tree: MerkleTree,
    isDeposit: boolean,
    isAccountCreation: boolean
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
        amount: 0n,
        salt: bytesToNumberBE(randomBytes(24)),
    })

    if (isAccountCreation) {
        forceDummyNote = true;
    }

    if (isDeposit) {
        publicDepositAmount = amount;
        forceDummyNote = true;
        outputNote.amount += amount;
    } else {
        publicWithdrawAmount = amount;
        outputNote.amount -= amount;
    }

    if (outputNote.amount <= 0n) {
        throw new Error("Invalid output note amount");
    }

    const merkleProof = tree.createProof(note.index as number);

    const inputs = {
        // Public inputs
        root,
        nullifier: note.nullifier(),
        outputCommitment: outputNote.commitment(),
        forceDummyNote: BigInt(forceDummyNote),
        publicDepositAmount,
        publicWithdrawAmount,
        // Private inputs of input note
        owner: note.owner,
        amount: note.amount,
        salt: note.salt,
        noteIndex: BigInt(note.index || 0),
        pathElements: merkleProof.pathElements,
        pathIndices: merkleProof.pathIndices,
        // Private inputs of output note
        outputOwner: outputNote.owner,
        outputAmount: outputNote.amount,
        outputSalt: outputNote.salt,
    }

    const snarkJs = (globalThis as any).snarkjs;

    if (!snarkJs) {
        throw new Error("Snarkjs not found or not ready");
    }

    const proof = await generateSnarkProof({ snarkJs, inputs, circuit: circuitPath });
    return proof;
}