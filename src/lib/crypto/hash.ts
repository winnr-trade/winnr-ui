import { poseidon } from "@iden3/js-crypto";

export const poseidonHash = (inputs: bigint[]) => {
  return poseidon.hash(inputs);
};
