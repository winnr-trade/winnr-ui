// import { Note } from "./note"
// import { MerkleTree } from "../tree"
// import { OrderType, Outcome, Side } from "@/lib/rollup/types";
// import { deriveStealthWallet } from "../stealth";
// import { generateProof } from "./proof";

// export const prepareStealthOrderTx = async (orderParams: {
//     marketId: number;
//     outcome: Outcome;
//     side: Side;
//     price: bigint;
//     quantity: number;
//     orderType: OrderType;
// }, masterKey: Uint8Array) => {
//     const {
//         marketId,
//         outcome,
//         side,
//         price,
//         quantity,
//         orderType,
//     } = orderParams;

//     // TODO: get real note
//     const note = Note.dummy();

//     // TODO: get real nonce
//     const nonce = 0;

//     const stealthKp = deriveStealthWallet(masterKey, nonce);

//     const tree = new MerkleTree(TREE_LEVELS);

//     const { proof } = await generateProof({
//         note,
//         amount: 0n,
//         tree,
//         isDeposit: false,
//         isAccountCreation: false,
//     });

//     return {
//         proof,
//         commitment: proof.publicSignals[0],
//         nullifier: proof.publicSignals[1],
//         stealthAddress: stealthKp.publicKey.toBase58(),
//         marketId,
//         outcome,
//         side,
//         price,
//         quantity,
//         orderType,
//     }
// }
