export function SerializeArgs(value: any): ArrayBuffer;
export function SerializeLock(value: any): ArrayBuffer;
export function SerializePubKeyHash(value: any): ArrayBuffer;
export function SerializePubKeyHashVec(value: any): ArrayBufferLike;
export function SerializeSignature(value: any): ArrayBuffer;
export function SerializeSignatureVec(value: any): ArrayBufferLike;
export function SerializeLockHash(value: any): ArrayBuffer;
export class Args {
    constructor(reader: any, { validate }?: {
        validate?: boolean | undefined;
    });
    view: DataView;
    validate(compatible?: boolean): void;
    getThreshold(): number;
    getRequestFirstN(): number;
    getSinglePubkey(): PubKeyHash;
    getMultiPubkey(): PubKeyHashVec;
}
export class Lock {
    constructor(reader: any, { validate }?: {
        validate?: boolean | undefined;
    });
    view: DataView;
    validate(compatible?: boolean): void;
    getArgs(): Args;
    getSignFlag(): number;
    getSignature(): SignatureVec;
}
export class PubKeyHash {
    static size(): number;
    constructor(reader: any, { validate }?: {
        validate?: boolean | undefined;
    });
    view: DataView;
    validate(compatible?: boolean): void;
    indexAt(i: any): number;
    raw(): ArrayBuffer;
}
export class PubKeyHashVec {
    constructor(reader: any, { validate }?: {
        validate?: boolean | undefined;
    });
    view: DataView;
    validate(compatible?: boolean): void;
    indexAt(i: any): PubKeyHash;
    length(): number;
}
export class Signature {
    static size(): number;
    constructor(reader: any, { validate }?: {
        validate?: boolean | undefined;
    });
    view: DataView;
    validate(compatible?: boolean): void;
    indexAt(i: any): number;
    raw(): ArrayBuffer;
}
export class SignatureVec {
    constructor(reader: any, { validate }?: {
        validate?: boolean | undefined;
    });
    view: DataView;
    validate(compatible?: boolean): void;
    indexAt(i: any): Signature;
    length(): number;
}
export class LockHash {
    static size(): number;
    constructor(reader: any, { validate }?: {
        validate?: boolean | undefined;
    });
    view: DataView;
    validate(compatible?: boolean): void;
    indexAt(i: any): number;
    raw(): ArrayBuffer;
}
