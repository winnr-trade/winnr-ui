import { bytesToNumberBE } from "@noble/ciphers/utils.js";
import { poseidonHash } from "../hash";
import { randomBytes } from "crypto";

export class Note {
    owner: bigint;
    amount: bigint;
    salt: bigint;
    index?: number;


    constructor(params: { owner: bigint, amount: bigint, salt: bigint, index?: number }) {
        this.owner = params.owner;
        this.amount = params.amount;
        this.salt = params.salt;
        this.index = params.index;
    }

    commitment(): bigint {
        return poseidonHash([
            this.owner,
            this.amount,
            this.salt,
        ]);
    }

    nullifier(): bigint {
        if (!Number.isFinite(this.index)) {
            throw new Error("Note has no index");
        }
        return poseidonHash([
            this.commitment(),
            BigInt(this.index as number),
        ]);
    }

    static dummy(): Note {
        return new Note({
            owner: 0n,
            amount: 0n,
            salt: bytesToNumberBE(randomBytes(31)),
            index: 0,
        })
    }
}