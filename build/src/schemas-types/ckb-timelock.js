"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializeLockHash = exports.LockHash = exports.SerializeSignatureVec = exports.SignatureVec = exports.SerializeSignature = exports.Signature = exports.SerializePubKeyHashVec = exports.PubKeyHashVec = exports.SerializePubKeyHash = exports.PubKeyHash = exports.SerializeLock = exports.Lock = exports.SerializeArgs = exports.Args = void 0;
function dataLengthError(actual, required) {
    throw new Error(`Invalid data length! Required: ${required}, actual: ${actual}`);
}
function assertDataLength(actual, required) {
    if (actual !== required) {
        dataLengthError(actual, required);
    }
}
function assertArrayBuffer(reader) {
    if (reader instanceof Object && reader.toArrayBuffer instanceof Function) {
        reader = reader.toArrayBuffer();
    }
    if (!(reader instanceof ArrayBuffer)) {
        throw new Error("Provided value must be an ArrayBuffer or can be transformed into ArrayBuffer!");
    }
    return reader;
}
function verifyAndExtractOffsets(view, expectedFieldCount, compatible) {
    if (view.byteLength < 4) {
        dataLengthError(view.byteLength, ">4");
    }
    const requiredByteLength = view.getUint32(0, true);
    assertDataLength(view.byteLength, requiredByteLength);
    if (requiredByteLength === 4) {
        return [requiredByteLength];
    }
    if (requiredByteLength < 8) {
        dataLengthError(view.byteLength, ">8");
    }
    const firstOffset = view.getUint32(4, true);
    if (firstOffset % 4 !== 0 || firstOffset < 8) {
        throw new Error(`Invalid first offset: ${firstOffset}`);
    }
    const itemCount = firstOffset / 4 - 1;
    if (itemCount < expectedFieldCount) {
        throw new Error(`Item count not enough! Required: ${expectedFieldCount}, actual: ${itemCount}`);
    }
    else if ((!compatible) && itemCount > expectedFieldCount) {
        throw new Error(`Item count is more than required! Required: ${expectedFieldCount}, actual: ${itemCount}`);
    }
    if (requiredByteLength < firstOffset) {
        throw new Error(`First offset is larger than byte length: ${firstOffset}`);
    }
    const offsets = [];
    for (let i = 0; i < itemCount; i++) {
        const start = 4 + i * 4;
        offsets.push(view.getUint32(start, true));
    }
    offsets.push(requiredByteLength);
    for (let i = 0; i < offsets.length - 1; i++) {
        if (offsets[i] > offsets[i + 1]) {
            throw new Error(`Offset index ${i}: ${offsets[i]} is larger than offset index ${i + 1}: ${offsets[i + 1]}`);
        }
    }
    return offsets;
}
function serializeTable(buffers) {
    const itemCount = buffers.length;
    let totalSize = 4 * (itemCount + 1);
    const offsets = [];
    for (let i = 0; i < itemCount; i++) {
        offsets.push(totalSize);
        totalSize += buffers[i].byteLength;
    }
    const buffer = new ArrayBuffer(totalSize);
    const array = new Uint8Array(buffer);
    const view = new DataView(buffer);
    view.setUint32(0, totalSize, true);
    for (let i = 0; i < itemCount; i++) {
        view.setUint32(4 + i * 4, offsets[i], true);
        array.set(new Uint8Array(buffers[i]), offsets[i]);
    }
    return buffer;
}
class Args {
    constructor(reader, { validate = true } = {}) {
        this.view = new DataView(assertArrayBuffer(reader));
        if (validate) {
            this.validate();
        }
    }
    validate(compatible = false) {
        const offsets = verifyAndExtractOffsets(this.view, 0, true);
        if (offsets[1] - offsets[0] !== 1) {
            throw new Error(`Invalid offset for threshold: ${offsets[0]} - ${offsets[1]}`);
        }
        if (offsets[2] - offsets[1] !== 1) {
            throw new Error(`Invalid offset for request_first_n: ${offsets[1]} - ${offsets[2]}`);
        }
        new PubKeyHashVec(this.view.buffer.slice(offsets[2], offsets[3]), { validate: false }).validate();
        new PubKeyHash(this.view.buffer.slice(offsets[3], offsets[4]), { validate: false }).validate();
        new LockHash(this.view.buffer.slice(offsets[4], offsets[5]), { validate: false }).validate();
    }
    getThreshold() {
        const start = 4;
        const offset = this.view.getUint32(start, true);
        const offset_end = this.view.getUint32(start + 4, true);
        return new DataView(this.view.buffer.slice(offset, offset_end)).getUint8(0);
    }
    getRequestFirstN() {
        const start = 8;
        const offset = this.view.getUint32(start, true);
        const offset_end = this.view.getUint32(start + 4, true);
        return new DataView(this.view.buffer.slice(offset, offset_end)).getUint8(0);
    }
    getMultiPubkey() {
        const start = 12;
        const offset = this.view.getUint32(start, true);
        const offset_end = this.view.getUint32(start + 4, true);
        return new PubKeyHashVec(this.view.buffer.slice(offset, offset_end), { validate: false });
    }
    getSinglePubkey() {
        const start = 16;
        const offset = this.view.getUint32(start, true);
        const offset_end = this.view.getUint32(start + 4, true);
        return new PubKeyHash(this.view.buffer.slice(offset, offset_end), { validate: false });
    }
    getOutputHash() {
        const start = 20;
        const offset = this.view.getUint32(start, true);
        const offset_end = this.view.byteLength;
        return new LockHash(this.view.buffer.slice(offset, offset_end), { validate: false });
    }
}
exports.Args = Args;
function SerializeArgs(value) {
    const buffers = [];
    const thresholdView = new DataView(new ArrayBuffer(1));
    thresholdView.setUint8(0, value.threshold);
    buffers.push(thresholdView.buffer);
    const requestFirstNView = new DataView(new ArrayBuffer(1));
    requestFirstNView.setUint8(0, value.request_first_n);
    buffers.push(requestFirstNView.buffer);
    buffers.push(SerializePubKeyHashVec(value.multi_pubkey));
    buffers.push(SerializePubKeyHash(value.single_pubkey));
    buffers.push(SerializeLockHash(value.output_hash));
    return serializeTable(buffers);
}
exports.SerializeArgs = SerializeArgs;
class Lock {
    constructor(reader, { validate = true } = {}) {
        this.view = new DataView(assertArrayBuffer(reader));
        if (validate) {
            this.validate();
        }
    }
    validate(compatible = false) {
        const offsets = verifyAndExtractOffsets(this.view, 0, true);
        if (offsets[1] - offsets[0] !== 1) {
            throw new Error(`Invalid offset for sign_flag: ${offsets[0]} - ${offsets[1]}`);
        }
        new Args(this.view.buffer.slice(offsets[1], offsets[2]), { validate: false }).validate();
        new SignatureVec(this.view.buffer.slice(offsets[2], offsets[3]), { validate: false }).validate();
    }
    getSignFlag() {
        const start = 4;
        const offset = this.view.getUint32(start, true);
        const offset_end = this.view.getUint32(start + 4, true);
        return new DataView(this.view.buffer.slice(offset, offset_end)).getUint8(0);
    }
    getArgs() {
        const start = 8;
        const offset = this.view.getUint32(start, true);
        const offset_end = this.view.getUint32(start + 4, true);
        return new Args(this.view.buffer.slice(offset, offset_end), { validate: false });
    }
    getSignature() {
        const start = 12;
        const offset = this.view.getUint32(start, true);
        const offset_end = this.view.byteLength;
        return new SignatureVec(this.view.buffer.slice(offset, offset_end), { validate: false });
    }
}
exports.Lock = Lock;
function SerializeLock(value) {
    const buffers = [];
    const signFlagView = new DataView(new ArrayBuffer(1));
    signFlagView.setUint8(0, value.sign_flag);
    buffers.push(signFlagView.buffer);
    buffers.push(SerializeArgs(value.args));
    buffers.push(SerializeSignatureVec(value.signature));
    return serializeTable(buffers);
}
exports.SerializeLock = SerializeLock;
class PubKeyHash {
    constructor(reader, { validate = true } = {}) {
        this.view = new DataView(assertArrayBuffer(reader));
        if (validate) {
            this.validate();
        }
    }
    validate(compatible = false) {
        assertDataLength(this.view.byteLength, 20);
    }
    indexAt(i) {
        return this.view.getUint8(i);
    }
    raw() {
        return this.view.buffer;
    }
    static size() {
        return 20;
    }
}
exports.PubKeyHash = PubKeyHash;
function SerializePubKeyHash(value) {
    const buffer = assertArrayBuffer(value);
    assertDataLength(buffer.byteLength, 20);
    return buffer;
}
exports.SerializePubKeyHash = SerializePubKeyHash;
class PubKeyHashVec {
    constructor(reader, { validate = true } = {}) {
        this.view = new DataView(assertArrayBuffer(reader));
        if (validate) {
            this.validate();
        }
    }
    validate(compatible = false) {
        if (this.view.byteLength < 4) {
            dataLengthError(this.view.byteLength, ">4");
        }
        const requiredByteLength = this.length() * PubKeyHash.size() + 4;
        assertDataLength(this.view.byteLength, requiredByteLength);
        for (let i = 0; i < 0; i++) {
            const item = this.indexAt(i);
            item.validate(compatible);
        }
    }
    indexAt(i) {
        return new PubKeyHash(this.view.buffer.slice(4 + i * PubKeyHash.size(), 4 + (i + 1) * PubKeyHash.size()), { validate: false });
    }
    length() {
        return this.view.getUint32(0, true);
    }
}
exports.PubKeyHashVec = PubKeyHashVec;
function SerializePubKeyHashVec(value) {
    const array = new Uint8Array(4 + PubKeyHash.size() * value.length);
    (new DataView(array.buffer)).setUint32(0, value.length, true);
    for (let i = 0; i < value.length; i++) {
        const itemBuffer = SerializePubKeyHash(value[i]);
        array.set(new Uint8Array(itemBuffer), 4 + i * PubKeyHash.size());
    }
    return array.buffer;
}
exports.SerializePubKeyHashVec = SerializePubKeyHashVec;
class Signature {
    constructor(reader, { validate = true } = {}) {
        this.view = new DataView(assertArrayBuffer(reader));
        if (validate) {
            this.validate();
        }
    }
    validate(compatible = false) {
        assertDataLength(this.view.byteLength, 65);
    }
    indexAt(i) {
        return this.view.getUint8(i);
    }
    raw() {
        return this.view.buffer;
    }
    static size() {
        return 65;
    }
}
exports.Signature = Signature;
function SerializeSignature(value) {
    const buffer = assertArrayBuffer(value);
    assertDataLength(buffer.byteLength, 65);
    return buffer;
}
exports.SerializeSignature = SerializeSignature;
class SignatureVec {
    constructor(reader, { validate = true } = {}) {
        this.view = new DataView(assertArrayBuffer(reader));
        if (validate) {
            this.validate();
        }
    }
    validate(compatible = false) {
        if (this.view.byteLength < 4) {
            dataLengthError(this.view.byteLength, ">4");
        }
        const requiredByteLength = this.length() * Signature.size() + 4;
        assertDataLength(this.view.byteLength, requiredByteLength);
        for (let i = 0; i < 0; i++) {
            const item = this.indexAt(i);
            item.validate(compatible);
        }
    }
    indexAt(i) {
        return new Signature(this.view.buffer.slice(4 + i * Signature.size(), 4 + (i + 1) * Signature.size()), { validate: false });
    }
    length() {
        return this.view.getUint32(0, true);
    }
}
exports.SignatureVec = SignatureVec;
function SerializeSignatureVec(value) {
    const array = new Uint8Array(4 + Signature.size() * value.length);
    (new DataView(array.buffer)).setUint32(0, value.length, true);
    for (let i = 0; i < value.length; i++) {
        const itemBuffer = SerializeSignature(value[i]);
        array.set(new Uint8Array(itemBuffer), 4 + i * Signature.size());
    }
    return array.buffer;
}
exports.SerializeSignatureVec = SerializeSignatureVec;
class LockHash {
    constructor(reader, { validate = true } = {}) {
        this.view = new DataView(assertArrayBuffer(reader));
        if (validate) {
            this.validate();
        }
    }
    validate(compatible = false) {
        assertDataLength(this.view.byteLength, 20);
    }
    indexAt(i) {
        return this.view.getUint8(i);
    }
    raw() {
        return this.view.buffer;
    }
    static size() {
        return 20;
    }
}
exports.LockHash = LockHash;
function SerializeLockHash(value) {
    const buffer = assertArrayBuffer(value);
    assertDataLength(buffer.byteLength, 20);
    return buffer;
}
exports.SerializeLockHash = SerializeLockHash;
//# sourceMappingURL=ckb-timelock.js.map