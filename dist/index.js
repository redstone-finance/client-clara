import {
  secp256k1
} from "./chunk-GH23YJZM.js";
import {
  BaseError,
  BytesSizeMismatchError,
  FeeCapTooHighError,
  Hash,
  InvalidAddressError,
  InvalidChainIdError,
  InvalidLegacyVError,
  InvalidSerializableTransactionError,
  InvalidStorageKeySizeError,
  TipAboveFeeCapError,
  aexists,
  aoutput,
  bytesRegex,
  bytesToHex,
  checksumAddress,
  concat,
  concatHex,
  createCursor,
  createView,
  encodeAbiParameters,
  etherUnits,
  hexToBigInt,
  hexToBytes,
  hexToNumber,
  integerRegex,
  isAddress,
  isHex,
  keccak256,
  maxUint256,
  numberToHex,
  rotr,
  size,
  slice,
  stringToHex,
  stringify,
  toBytes,
  toBytes2,
  toHex,
  trim,
  wrapConstructor
} from "./chunk-O7TRR4XF.js";
import "./chunk-PR4QN5HX.js";

// src/client.ts
import { elizaLogger as elizaLogger9 } from "@elizaos/core";

// src/ClaraClient.ts
import {
  elizaLogger as elizaLogger3,
  getEmbeddingZeroVector
} from "@elizaos/core";
import { EventEmitter } from "events";

// src/market/AoClaraMarket.ts
import { ClaraMarketAO, ClaraProfileAO } from "redstone-clara-sdk";
import { elizaLogger } from "@elizaos/core";
import fs from "fs";
var AoClaraMarket = class {
  constructor(profileId, claraConfig) {
    this.profileId = profileId;
    this.claraConfig = claraConfig;
    this.market = new ClaraMarketAO(
      this.claraConfig.CLARA_MARKET_CONTRACT_ADDRESS
    );
    this.wallet = this.claraConfig.CLARA_PRIVATE_KEY;
  }
  profile;
  market;
  wallet;
  getProfile() {
    return this.profile;
  }
  getMarket() {
    return this.market;
  }
  getWallet() {
    return this.wallet;
  }
  async init() {
    await this.connectProfile();
  }
  async connectProfile() {
    elizaLogger.info("connecting profile", this.profileId);
    const parsedWallet = JSON.parse(this.wallet);
    if (fs.existsSync(`../profiles/${this.profileId}`)) {
      elizaLogger.info(
        `Agent already registered, connecting`,
        this.profileId
      );
      this.profile = new ClaraProfileAO(
        {
          id: this.profileId,
          jwk: parsedWallet
        },
        process.env.AO_MARKET_ID
      );
    } else {
      try {
        this.profile = await this.market.registerAgent(parsedWallet, {
          metadata: { description: this.profileId },
          topic: "tweet",
          fee: 1e7,
          agentId: this.profileId
        });
      } catch (e) {
        elizaLogger.error(`Could not create Clara profile`, e);
        throw new Error(e);
      }
      fs.mkdirSync(`../profiles/${this.profileId}`, { recursive: true });
    }
  }
};

// src/market/StoryClaraMarket.ts
import {
  ClaraMarketStory,
  ClaraProfileStory,
  storyAeneid,
  storyMainnet
} from "redstone-clara-sdk";
import { elizaLogger as elizaLogger2 } from "@elizaos/core";

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js
function publicKeyToAddress(publicKey) {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26);
  return checksumAddress(`0x${address}`);
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/encoding/toRlp.js
function toRlp(bytes, to = "hex") {
  const encodable = getEncodable(bytes);
  const cursor = createCursor(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (to === "hex")
    return bytesToHex(cursor.bytes);
  return cursor.bytes;
}
function getEncodable(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList(bytes.map((x) => getEncodable(x)));
  return getEncodableBytes(bytes);
}
function getEncodableList(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode } of list) {
        encode(cursor);
      }
    }
  };
}
function getEncodableBytes(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? hexToBytes(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
function getSizeOfLength(length) {
  if (length < 2 ** 8)
    return 1;
  if (length < 2 ** 16)
    return 2;
  if (length < 2 ** 24)
    return 3;
  if (length < 2 ** 32)
    return 4;
  throw new BaseError("Length is too large.");
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/experimental/eip7702/utils/hashAuthorization.js
function hashAuthorization(parameters) {
  const { chainId, contractAddress, nonce, to } = parameters;
  const hash = keccak256(concatHex([
    "0x05",
    toRlp([
      chainId ? numberToHex(chainId) : "0x",
      contractAddress,
      nonce ? numberToHex(nonce) : "0x"
    ])
  ]));
  if (to === "bytes")
    return hexToBytes(hash);
  return hash;
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/blob/blobsToCommitments.js
function blobsToCommitments(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = [];
  for (const blob of blobs)
    commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
  return to === "bytes" ? commitments : commitments.map((x) => bytesToHex(x));
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/blob/blobsToProofs.js
function blobsToProofs(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = typeof parameters.commitments[0] === "string" ? parameters.commitments.map((x) => hexToBytes(x)) : parameters.commitments;
  const proofs = [];
  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    const commitment = commitments[i];
    proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
  }
  return to === "bytes" ? proofs : proofs.map((x) => bytesToHex(x));
}

// ../../node_modules/.pnpm/@noble+hashes@1.6.1/node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE ? 4 : 0;
  const l = isLE ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE);
  view.setUint32(byteOffset + l, wl, isLE);
}
var Chi = (a, b, c) => a & b ^ ~a & c;
var Maj = (a, b, c) => a & b ^ a & c ^ b & c;
var HashMD = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE) {
    super();
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    const { view, buffer, blockLen } = this;
    data = toBytes2(data);
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    this.buffer.subarray(pos).fill(0);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.length = length;
    to.pos = pos;
    to.finished = finished;
    to.destroyed = destroyed;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
};

// ../../node_modules/.pnpm/@noble+hashes@1.6.1/node_modules/@noble/hashes/esm/sha256.js
var SHA256_K = /* @__PURE__ */ new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_IV = /* @__PURE__ */ new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA256 = class extends HashMD {
  constructor() {
    super(64, 32, 8, false);
    this.A = SHA256_IV[0] | 0;
    this.B = SHA256_IV[1] | 0;
    this.C = SHA256_IV[2] | 0;
    this.D = SHA256_IV[3] | 0;
    this.E = SHA256_IV[4] | 0;
    this.F = SHA256_IV[5] | 0;
    this.G = SHA256_IV[6] | 0;
    this.H = SHA256_IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    SHA256_W.fill(0);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    this.buffer.fill(0);
  }
};
var sha256 = /* @__PURE__ */ wrapConstructor(() => new SHA256());

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/hash/sha256.js
function sha2562(value, to_) {
  const to = to_ || "hex";
  const bytes = sha256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
function commitmentToVersionedHash(parameters) {
  const { commitment, version = 1 } = parameters;
  const to = parameters.to ?? (typeof commitment === "string" ? "hex" : "bytes");
  const versionedHash = sha2562(commitment, "bytes");
  versionedHash.set([version], 0);
  return to === "bytes" ? versionedHash : bytesToHex(versionedHash);
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js
function commitmentsToVersionedHashes(parameters) {
  const { commitments, version } = parameters;
  const to = parameters.to ?? (typeof commitments[0] === "string" ? "hex" : "bytes");
  const hashes = [];
  for (const commitment of commitments) {
    hashes.push(commitmentToVersionedHash({
      commitment,
      to,
      version
    }));
  }
  return hashes;
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/constants/blob.js
var blobsPerTransaction = 6;
var bytesPerFieldElement = 32;
var fieldElementsPerBlob = 4096;
var bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob;
var maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction - // terminator byte (0x80).
1 - // zero byte (0x00) appended to each field element.
1 * fieldElementsPerBlob * blobsPerTransaction;

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/constants/kzg.js
var versionedHashVersionKzg = 1;

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/errors/blob.js
var BlobSizeTooLargeError = class extends BaseError {
  constructor({ maxSize, size: size2 }) {
    super("Blob size is too large.", {
      metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size2} bytes`],
      name: "BlobSizeTooLargeError"
    });
  }
};
var EmptyBlobError = class extends BaseError {
  constructor() {
    super("Blob data must not be empty.", { name: "EmptyBlobError" });
  }
};
var InvalidVersionedHashSizeError = class extends BaseError {
  constructor({ hash, size: size2 }) {
    super(`Versioned hash "${hash}" size is invalid.`, {
      metaMessages: ["Expected: 32", `Received: ${size2}`],
      name: "InvalidVersionedHashSizeError"
    });
  }
};
var InvalidVersionedHashVersionError = class extends BaseError {
  constructor({ hash, version }) {
    super(`Versioned hash "${hash}" version is invalid.`, {
      metaMessages: [
        `Expected: ${versionedHashVersionKzg}`,
        `Received: ${version}`
      ],
      name: "InvalidVersionedHashVersionError"
    });
  }
};

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/blob/toBlobs.js
function toBlobs(parameters) {
  const to = parameters.to ?? (typeof parameters.data === "string" ? "hex" : "bytes");
  const data = typeof parameters.data === "string" ? hexToBytes(parameters.data) : parameters.data;
  const size_ = size(data);
  if (!size_)
    throw new EmptyBlobError();
  if (size_ > maxBytesPerTransaction)
    throw new BlobSizeTooLargeError({
      maxSize: maxBytesPerTransaction,
      size: size_
    });
  const blobs = [];
  let active = true;
  let position = 0;
  while (active) {
    const blob = createCursor(new Uint8Array(bytesPerBlob));
    let size2 = 0;
    while (size2 < fieldElementsPerBlob) {
      const bytes = data.slice(position, position + (bytesPerFieldElement - 1));
      blob.pushByte(0);
      blob.pushBytes(bytes);
      if (bytes.length < 31) {
        blob.pushByte(128);
        active = false;
        break;
      }
      size2++;
      position += 31;
    }
    blobs.push(blob);
  }
  return to === "bytes" ? blobs.map((x) => x.bytes) : blobs.map((x) => bytesToHex(x.bytes));
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/blob/toBlobSidecars.js
function toBlobSidecars(parameters) {
  const { data, kzg, to } = parameters;
  const blobs = parameters.blobs ?? toBlobs({ data, to });
  const commitments = parameters.commitments ?? blobsToCommitments({ blobs, kzg, to });
  const proofs = parameters.proofs ?? blobsToProofs({ blobs, commitments, kzg, to });
  const sidecars = [];
  for (let i = 0; i < blobs.length; i++)
    sidecars.push({
      blob: blobs[i],
      commitment: commitments[i],
      proof: proofs[i]
    });
  return sidecars;
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/transaction/getTransactionType.js
function getTransactionType(transaction) {
  if (transaction.type)
    return transaction.type;
  if (typeof transaction.authorizationList !== "undefined")
    return "eip7702";
  if (typeof transaction.blobs !== "undefined" || typeof transaction.blobVersionedHashes !== "undefined" || typeof transaction.maxFeePerBlobGas !== "undefined" || typeof transaction.sidecars !== "undefined")
    return "eip4844";
  if (typeof transaction.maxFeePerGas !== "undefined" || typeof transaction.maxPriorityFeePerGas !== "undefined") {
    return "eip1559";
  }
  if (typeof transaction.gasPrice !== "undefined") {
    if (typeof transaction.accessList !== "undefined")
      return "eip2930";
    return "legacy";
  }
  throw new InvalidSerializableTransactionError({ transaction });
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/errors/typedData.js
var InvalidDomainError = class extends BaseError {
  constructor({ domain }) {
    super(`Invalid domain "${stringify(domain)}".`, {
      metaMessages: ["Must be a valid EIP-712 domain."]
    });
  }
};
var InvalidPrimaryTypeError = class extends BaseError {
  constructor({ primaryType, types }) {
    super(`Invalid primary type \`${primaryType}\` must be one of \`${JSON.stringify(Object.keys(types))}\`.`, {
      docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror",
      metaMessages: ["Check that the primary type is a key in `types`."]
    });
  }
};
var InvalidStructTypeError = class extends BaseError {
  constructor({ type }) {
    super(`Struct type "${type}" is invalid.`, {
      metaMessages: ["Struct type must not be a Solidity type."],
      name: "InvalidStructTypeError"
    });
  }
};

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/signature/hashTypedData.js
function hashTypedData(parameters) {
  const { domain = {}, message, primaryType } = parameters;
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({
    domain,
    message,
    primaryType,
    types
  });
  const parts = ["0x1901"];
  if (domain)
    parts.push(hashDomain({
      domain,
      types
    }));
  if (primaryType !== "EIP712Domain")
    parts.push(hashStruct({
      data: message,
      primaryType,
      types
    }));
  return keccak256(concat(parts));
}
function hashDomain({ domain, types }) {
  return hashStruct({
    data: domain,
    primaryType: "EIP712Domain",
    types
  });
}
function hashStruct({ data, primaryType, types }) {
  const encoded = encodeData({
    data,
    primaryType,
    types
  });
  return keccak256(encoded);
}
function encodeData({ data, primaryType, types }) {
  const encodedTypes = [{ type: "bytes32" }];
  const encodedValues = [hashType({ primaryType, types })];
  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name]
    });
    encodedTypes.push(type);
    encodedValues.push(value);
  }
  return encodeAbiParameters(encodedTypes, encodedValues);
}
function hashType({ primaryType, types }) {
  const encodedHashType = toHex(encodeType({ primaryType, types }));
  return keccak256(encodedHashType);
}
function encodeType({ primaryType, types }) {
  let result = "";
  const unsortedDeps = findTypeDependencies({ primaryType, types });
  unsortedDeps.delete(primaryType);
  const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
  for (const type of deps) {
    result += `${type}(${types[type].map(({ name, type: t }) => `${t} ${name}`).join(",")})`;
  }
  return result;
}
function findTypeDependencies({ primaryType: primaryType_, types }, results = /* @__PURE__ */ new Set()) {
  const match = primaryType_.match(/^\w*/u);
  const primaryType = match == null ? void 0 : match[0];
  if (results.has(primaryType) || types[primaryType] === void 0) {
    return results;
  }
  results.add(primaryType);
  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results);
  }
  return results;
}
function encodeField({ types, name, type, value }) {
  if (types[type] !== void 0) {
    return [
      { type: "bytes32" },
      keccak256(encodeData({ data: value, primaryType: type, types }))
    ];
  }
  if (type === "bytes") {
    const prepend = value.length % 2 ? "0" : "";
    value = `0x${prepend + value.slice(2)}`;
    return [{ type: "bytes32" }, keccak256(value)];
  }
  if (type === "string")
    return [{ type: "bytes32" }, keccak256(toHex(value))];
  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["));
    const typeValuePairs = value.map((item) => encodeField({
      name,
      type: parsedType,
      types,
      value: item
    }));
    return [
      { type: "bytes32" },
      keccak256(encodeAbiParameters(typeValuePairs.map(([t]) => t), typeValuePairs.map(([, v]) => v)))
    ];
  }
  return [{ type }, value];
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/typedData.js
function validateTypedData(parameters) {
  const { domain, message, primaryType, types } = parameters;
  const validateData = (struct, data) => {
    for (const param of struct) {
      const { name, type } = param;
      const value = data[name];
      const integerMatch = type.match(integerRegex);
      if (integerMatch && (typeof value === "number" || typeof value === "bigint")) {
        const [_type, base, size_] = integerMatch;
        numberToHex(value, {
          signed: base === "int",
          size: Number.parseInt(size_) / 8
        });
      }
      if (type === "address" && typeof value === "string" && !isAddress(value))
        throw new InvalidAddressError({ address: value });
      const bytesMatch = type.match(bytesRegex);
      if (bytesMatch) {
        const [_type, size_] = bytesMatch;
        if (size_ && size(value) !== Number.parseInt(size_))
          throw new BytesSizeMismatchError({
            expectedSize: Number.parseInt(size_),
            givenSize: size(value)
          });
      }
      const struct2 = types[type];
      if (struct2) {
        validateReference(type);
        validateData(struct2, value);
      }
    }
  };
  if (types.EIP712Domain && domain) {
    if (typeof domain !== "object")
      throw new InvalidDomainError({ domain });
    validateData(types.EIP712Domain, domain);
  }
  if (primaryType !== "EIP712Domain") {
    if (types[primaryType])
      validateData(types[primaryType], message);
    else
      throw new InvalidPrimaryTypeError({ primaryType, types });
  }
}
function getTypesForEIP712Domain({ domain }) {
  return [
    typeof (domain == null ? void 0 : domain.name) === "string" && { name: "name", type: "string" },
    (domain == null ? void 0 : domain.version) && { name: "version", type: "string" },
    typeof (domain == null ? void 0 : domain.chainId) === "number" && {
      name: "chainId",
      type: "uint256"
    },
    (domain == null ? void 0 : domain.verifyingContract) && {
      name: "verifyingContract",
      type: "address"
    },
    (domain == null ? void 0 : domain.salt) && { name: "salt", type: "bytes32" }
  ].filter(Boolean);
}
function validateReference(type) {
  if (type === "address" || type === "bool" || type === "string" || type.startsWith("bytes") || type.startsWith("uint") || type.startsWith("int"))
    throw new InvalidStructTypeError({ type });
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/constants/strings.js
var presignMessagePrefix = "Ethereum Signed Message:\n";

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
function toPrefixedMessage(message_) {
  const message = (() => {
    if (typeof message_ === "string")
      return stringToHex(message_);
    if (typeof message_.raw === "string")
      return message_.raw;
    return bytesToHex(message_.raw);
  })();
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
  return concat([prefix, message]);
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/signature/hashMessage.js
function hashMessage(message, to_) {
  return keccak256(toPrefixedMessage(message), to_);
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/transaction/assertTransaction.js
function assertTransactionEIP7702(transaction) {
  const { authorizationList } = transaction;
  if (authorizationList) {
    for (const authorization of authorizationList) {
      const { contractAddress, chainId } = authorization;
      if (!isAddress(contractAddress))
        throw new InvalidAddressError({ address: contractAddress });
      if (chainId < 0)
        throw new InvalidChainIdError({ chainId });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP4844(transaction) {
  const { blobVersionedHashes } = transaction;
  if (blobVersionedHashes) {
    if (blobVersionedHashes.length === 0)
      throw new EmptyBlobError();
    for (const hash of blobVersionedHashes) {
      const size_ = size(hash);
      const version = hexToNumber(slice(hash, 0, 1));
      if (size_ !== 32)
        throw new InvalidVersionedHashSizeError({ hash, size: size_ });
      if (version !== versionedHashVersionKzg)
        throw new InvalidVersionedHashVersionError({
          hash,
          version
        });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP1559(transaction) {
  const { chainId, maxPriorityFeePerGas, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
function assertTransactionEIP2930(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
function assertTransactionLegacy(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (typeof chainId !== "undefined" && chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/experimental/eip7702/utils/serializeAuthorizationList.js
function serializeAuthorizationList(authorizationList) {
  if (!authorizationList || authorizationList.length === 0)
    return [];
  const serializedAuthorizationList = [];
  for (const authorization of authorizationList) {
    const { contractAddress, chainId, nonce, ...signature } = authorization;
    serializedAuthorizationList.push([
      chainId ? toHex(chainId) : "0x",
      contractAddress,
      nonce ? toHex(nonce) : "0x",
      ...toYParitySignatureArray({}, signature)
    ]);
  }
  return serializedAuthorizationList;
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/transaction/serializeAccessList.js
function serializeAccessList(accessList) {
  if (!accessList || accessList.length === 0)
    return [];
  const serializedAccessList = [];
  for (let i = 0; i < accessList.length; i++) {
    const { address, storageKeys } = accessList[i];
    for (let j = 0; j < storageKeys.length; j++) {
      if (storageKeys[j].length - 2 !== 64) {
        throw new InvalidStorageKeySizeError({ storageKey: storageKeys[j] });
      }
    }
    if (!isAddress(address, { strict: false })) {
      throw new InvalidAddressError({ address });
    }
    serializedAccessList.push([address, storageKeys]);
  }
  return serializedAccessList;
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/transaction/serializeTransaction.js
function serializeTransaction(transaction, signature) {
  const type = getTransactionType(transaction);
  if (type === "eip1559")
    return serializeTransactionEIP1559(transaction, signature);
  if (type === "eip2930")
    return serializeTransactionEIP2930(transaction, signature);
  if (type === "eip4844")
    return serializeTransactionEIP4844(transaction, signature);
  if (type === "eip7702")
    return serializeTransactionEIP7702(transaction, signature);
  return serializeTransactionLegacy(transaction, signature);
}
function serializeTransactionEIP7702(transaction, signature) {
  const { authorizationList, chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP7702(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedAuthorizationList = serializeAuthorizationList(authorizationList);
  return concatHex([
    "0x04",
    toRlp([
      toHex(chainId),
      nonce ? toHex(nonce) : "0x",
      maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : "0x",
      maxFeePerGas ? toHex(maxFeePerGas) : "0x",
      gas ? toHex(gas) : "0x",
      to ?? "0x",
      value ? toHex(value) : "0x",
      data ?? "0x",
      serializedAccessList,
      serializedAuthorizationList,
      ...toYParitySignatureArray(transaction, signature)
    ])
  ]);
}
function serializeTransactionEIP4844(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP4844(transaction);
  let blobVersionedHashes = transaction.blobVersionedHashes;
  let sidecars = transaction.sidecars;
  if (transaction.blobs && (typeof blobVersionedHashes === "undefined" || typeof sidecars === "undefined")) {
    const blobs2 = typeof transaction.blobs[0] === "string" ? transaction.blobs : transaction.blobs.map((x) => bytesToHex(x));
    const kzg = transaction.kzg;
    const commitments2 = blobsToCommitments({
      blobs: blobs2,
      kzg
    });
    if (typeof blobVersionedHashes === "undefined")
      blobVersionedHashes = commitmentsToVersionedHashes({
        commitments: commitments2
      });
    if (typeof sidecars === "undefined") {
      const proofs2 = blobsToProofs({ blobs: blobs2, commitments: commitments2, kzg });
      sidecars = toBlobSidecars({ blobs: blobs2, commitments: commitments2, proofs: proofs2 });
    }
  }
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : "0x",
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? toHex(maxFeePerGas) : "0x",
    gas ? toHex(gas) : "0x",
    to ?? "0x",
    value ? toHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    maxFeePerBlobGas ? toHex(maxFeePerBlobGas) : "0x",
    blobVersionedHashes ?? [],
    ...toYParitySignatureArray(transaction, signature)
  ];
  const blobs = [];
  const commitments = [];
  const proofs = [];
  if (sidecars)
    for (let i = 0; i < sidecars.length; i++) {
      const { blob, commitment, proof } = sidecars[i];
      blobs.push(blob);
      commitments.push(commitment);
      proofs.push(proof);
    }
  return concatHex([
    "0x03",
    sidecars ? (
      // If sidecars are enabled, envelope turns into a "wrapper":
      toRlp([serializedTransaction, blobs, commitments, proofs])
    ) : (
      // If sidecars are disabled, standard envelope is used:
      toRlp(serializedTransaction)
    )
  ]);
}
function serializeTransactionEIP1559(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP1559(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : "0x",
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? toHex(maxFeePerGas) : "0x",
    gas ? toHex(gas) : "0x",
    to ?? "0x",
    value ? toHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x02",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionEIP2930(transaction, signature) {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } = transaction;
  assertTransactionEIP2930(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : "0x",
    gasPrice ? toHex(gasPrice) : "0x",
    gas ? toHex(gas) : "0x",
    to ?? "0x",
    value ? toHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x01",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionLegacy(transaction, signature) {
  const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction;
  assertTransactionLegacy(transaction);
  let serializedTransaction = [
    nonce ? toHex(nonce) : "0x",
    gasPrice ? toHex(gasPrice) : "0x",
    gas ? toHex(gas) : "0x",
    to ?? "0x",
    value ? toHex(value) : "0x",
    data ?? "0x"
  ];
  if (signature) {
    const v = (() => {
      if (signature.v >= 35n) {
        const inferredChainId = (signature.v - 35n) / 2n;
        if (inferredChainId > 0)
          return signature.v;
        return 27n + (signature.v === 35n ? 0n : 1n);
      }
      if (chainId > 0)
        return BigInt(chainId * 2) + BigInt(35n + signature.v - 27n);
      const v2 = 27n + (signature.v === 27n ? 0n : 1n);
      if (signature.v !== v2)
        throw new InvalidLegacyVError({ v: signature.v });
      return v2;
    })();
    const r = trim(signature.r);
    const s = trim(signature.s);
    serializedTransaction = [
      ...serializedTransaction,
      toHex(v),
      r === "0x00" ? "0x" : r,
      s === "0x00" ? "0x" : s
    ];
  } else if (chainId > 0) {
    serializedTransaction = [
      ...serializedTransaction,
      toHex(chainId),
      "0x",
      "0x"
    ];
  }
  return toRlp(serializedTransaction);
}
function toYParitySignatureArray(transaction, signature_) {
  const signature = signature_ ?? transaction;
  const { v, yParity } = signature;
  if (typeof signature.r === "undefined")
    return [];
  if (typeof signature.s === "undefined")
    return [];
  if (typeof v === "undefined" && typeof yParity === "undefined")
    return [];
  const r = trim(signature.r);
  const s = trim(signature.s);
  const yParity_ = (() => {
    if (typeof yParity === "number")
      return yParity ? toHex(1) : "0x";
    if (v === 0n)
      return "0x";
    if (v === 1n)
      return toHex(1);
    return v === 27n ? "0x" : toHex(1);
  })();
  return [yParity_, r === "0x00" ? "0x" : r, s === "0x00" ? "0x" : s];
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/errors/unit.js
var InvalidDecimalNumberError = class extends BaseError {
  constructor({ value }) {
    super(`Number \`${value}\` is not a valid decimal number.`, {
      name: "InvalidDecimalNumberError"
    });
  }
};

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/unit/parseUnits.js
function parseUnits(value, decimals) {
  if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
    throw new InvalidDecimalNumberError({ value });
  let [integer, fraction = "0"] = value.split(".");
  const negative = integer.startsWith("-");
  if (negative)
    integer = integer.slice(1);
  fraction = fraction.replace(/(0+)$/, "");
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1)
      integer = `${BigInt(integer) + 1n}`;
    fraction = "";
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals)
    ];
    const rounded = Math.round(Number(`${unit}.${right}`));
    if (rounded > 9)
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, "0");
    else
      fraction = `${left}${rounded}`;
    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }
    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, "0");
  }
  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/unit/parseEther.js
function parseEther(ether, unit = "wei") {
  return parseUnits(ether, etherUnits[unit]);
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/utils/signature/serializeSignature.js
function serializeSignature({ r, s, to = "hex", v, yParity }) {
  const yParity_ = (() => {
    if (yParity === 0 || yParity === 1)
      return yParity;
    if (v && (v === 27n || v === 28n || v >= 35n))
      return v % 2n === 0n ? 1 : 0;
    throw new Error("Invalid `v` or `yParity` value");
  })();
  const signature = `0x${new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).toCompactHex()}${yParity_ === 0 ? "1b" : "1c"}`;
  if (to === "hex")
    return signature;
  return hexToBytes(signature);
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/accounts/toAccount.js
function toAccount(source) {
  if (typeof source === "string") {
    if (!isAddress(source, { strict: false }))
      throw new InvalidAddressError({ address: source });
    return {
      address: source,
      type: "json-rpc"
    };
  }
  if (!isAddress(source.address, { strict: false }))
    throw new InvalidAddressError({ address: source.address });
  return {
    address: source.address,
    nonceManager: source.nonceManager,
    sign: source.sign,
    experimental_signAuthorization: source.experimental_signAuthorization,
    signMessage: source.signMessage,
    signTransaction: source.signTransaction,
    signTypedData: source.signTypedData,
    source: "custom",
    type: "local"
  };
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/accounts/utils/sign.js
var extraEntropy = false;
async function sign({ hash, privateKey, to = "object" }) {
  const { r, s, recovery } = secp256k1.sign(hash.slice(2), privateKey.slice(2), { lowS: true, extraEntropy });
  const signature = {
    r: numberToHex(r, { size: 32 }),
    s: numberToHex(s, { size: 32 }),
    v: recovery ? 28n : 27n,
    yParity: recovery
  };
  return (() => {
    if (to === "bytes" || to === "hex")
      return serializeSignature({ ...signature, to });
    return signature;
  })();
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/accounts/utils/signAuthorization.js
async function experimental_signAuthorization(parameters) {
  const { contractAddress, chainId, nonce, privateKey, to = "object" } = parameters;
  const signature = await sign({
    hash: hashAuthorization({ contractAddress, chainId, nonce }),
    privateKey,
    to
  });
  if (to === "object")
    return {
      contractAddress,
      chainId,
      nonce,
      ...signature
    };
  return signature;
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/accounts/utils/signMessage.js
async function signMessage({ message, privateKey }) {
  return await sign({ hash: hashMessage(message), privateKey, to: "hex" });
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/accounts/utils/signTransaction.js
async function signTransaction(parameters) {
  const { privateKey, transaction, serializer = serializeTransaction } = parameters;
  const signableTransaction = (() => {
    if (transaction.type === "eip4844")
      return {
        ...transaction,
        sidecars: false
      };
    return transaction;
  })();
  const signature = await sign({
    hash: keccak256(serializer(signableTransaction)),
    privateKey
  });
  return serializer(transaction, signature);
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/accounts/utils/signTypedData.js
async function signTypedData(parameters) {
  const { privateKey, ...typedData } = parameters;
  return await sign({
    hash: hashTypedData(typedData),
    privateKey,
    to: "hex"
  });
}

// ../../node_modules/.pnpm/viem@2.21.58_bufferutil@4.0.9_typescript@5.8.2_utf-8-validate@5.0.10_zod@3.23.8/node_modules/viem/_esm/accounts/privateKeyToAccount.js
function privateKeyToAccount(privateKey, options = {}) {
  const { nonceManager } = options;
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false));
  const address = publicKeyToAddress(publicKey);
  const account = toAccount({
    address,
    nonceManager,
    async sign({ hash }) {
      return sign({ hash, privateKey, to: "hex" });
    },
    async experimental_signAuthorization(authorization) {
      return experimental_signAuthorization({ ...authorization, privateKey });
    },
    async signMessage({ message }) {
      return signMessage({ message, privateKey });
    },
    async signTransaction(transaction, { serializer } = {}) {
      return signTransaction({ privateKey, transaction, serializer });
    },
    async signTypedData(typedData) {
      return signTypedData({ ...typedData, privateKey });
    }
  });
  return {
    ...account,
    publicKey,
    source: "privateKey"
  };
}

// src/market/StoryClaraMarket.ts
var StoryClaraMarket = class {
  constructor(profileId, claraConfig) {
    this.profileId = profileId;
    this.claraConfig = claraConfig;
    this.chain = process.env.CLARA_STORY_CHAIN == "mainnet" ? storyMainnet : storyAeneid;
    this.market = new ClaraMarketStory(this.chain);
    this.account = privateKeyToAccount(
      this.claraConfig.CLARA_PRIVATE_KEY
    );
  }
  profile;
  market;
  account;
  chain;
  async getProfile() {
    if (!this.profile) await this.connectProfile();
    return this.profile;
  }
  getMarket() {
    return this.market;
  }
  getWallet() {
    return JSON.stringify(this.account);
  }
  async connectProfile() {
    elizaLogger2.info("Connecting profile", this.profileId);
    this.profile = new ClaraProfileStory(this.account, storyAeneid);
    const agentData = await this.profile.agentData();
    if (agentData == null ? void 0 : agentData.exists) {
      elizaLogger2.info(
        `Agent already registered, connecting`,
        this.profileId
      );
      try {
        const oldFee = (await this.profile.agentData()).fee;
        const newFee = parseEther(this.claraConfig.CLARA_FEE);
        if (oldFee != newFee) {
          elizaLogger2.debug(
            `Clara agent's fee has changed, updating. Old fee: ${oldFee}, new fee: ${newFee}.`
          );
          await this.profile.updateFee(newFee);
          elizaLogger2.debug(`Fee updated correctly.`);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        await this.market.registerAgent(this.account, {
          metadata: JSON.stringify({ description: this.profileId }),
          topic: "tweet",
          fee: parseEther(this.claraConfig.CLARA_FEE),
          agentId: this.profileId
        });
      } catch (e) {
        elizaLogger2.error(`Could not create Clara profile`, e);
        throw new Error(e);
      }
    }
  }
};

// src/ClaraClient.ts
var ClaraClient = class extends EventEmitter {
  constructor(runtime, claraConfig) {
    super();
    this.runtime = runtime;
    this.claraConfig = claraConfig;
    this.profileId = `${this.runtime.agentId}_${claraConfig.CLARA_USERNAME}`;
    this.walletId = claraConfig.CLARA_WALLET_ID;
    this.claraMarket = this.claraConfig.CLARA_IMPL == "ao" ? new AoClaraMarket(this.profileId, this.claraConfig) : new StoryClaraMarket(this.profileId, this.claraConfig);
  }
  claraMarket;
  lastCheckedMessage = null;
  profileId;
  walletId;
  async init() {
    if (this.profileId) {
      elizaLogger3.log("Clara profile ID:", this.profileId);
    } else {
      throw new Error("Failed to load profile id");
    }
    await this.loadLatestCheckedMessage(this.claraConfig.CLARA_IMPL);
  }
  async saveRequestMessage(message, state) {
    if (message.content.text) {
      const recentMessage = await this.runtime.messageManager.getMemories(
        {
          roomId: message.roomId,
          count: 1,
          unique: false
        }
      );
      if (recentMessage.length > 0 && recentMessage[0].content === message.content) {
        elizaLogger3.debug("Message already saved", recentMessage[0].id);
      } else {
        await this.runtime.messageManager.createMemory({
          ...message,
          embedding: getEmbeddingZeroVector()
        });
      }
      await this.runtime.evaluate(message, {
        ...state,
        claraClient: this
      });
    }
  }
  async loadLatestCheckedMessage(claraImpl) {
    const latestCheckedMessage = await this.runtime.cacheManager.get(
      `${claraImpl}/${this.profileId}/latest_checked_message`
    );
    if (latestCheckedMessage) {
      this.lastCheckedMessage = latestCheckedMessage;
    }
  }
  async cacheLatestCheckedMessage(claraImpl) {
    if (this.lastCheckedMessage) {
      await this.runtime.cacheManager.set(
        `${claraImpl}/${this.profileId}/latest_checked_message`,
        this.lastCheckedMessage
      );
    }
  }
  updateLastCheckedMessage(message) {
    switch (this.claraConfig.CLARA_IMPL) {
      case "ao":
        this.lastCheckedMessage = message.timestamp;
        break;
      case "story":
        this.lastCheckedMessage = Number(message.blockNumber);
        break;
      default:
        throw new Error(
          `Unknown Clara impl: ${this.claraConfig.CLARA_IMPL}`
        );
    }
  }
  async sendTaskResult(taskId, result) {
    try {
      const profile = await this.claraMarket.getProfile();
      const response = await profile.sendTaskResult({
        taskId,
        result: JSON.stringify(result)
      });
      elizaLogger3.info(
        `Task result for id: ${taskId} sent`,
        JSON.stringify(response)
      );
      return response;
    } catch (e) {
      console.log(e);
      elizaLogger3.error(
        `Could not send task result for task: ${taskId}.`,
        e
      );
      return false;
    }
  }
};

// src/utils/environment.ts
import { z, ZodError } from "zod";
var claraEnvSchema = z.object({
  CLARA_USERNAME: z.string().min(1, "CLARA username is required"),
  CLARA_PRIVATE_KEY: z.string().min(1, "CLARA wallet is required"),
  CLARA_WALLET_ID: z.string().min(1, "CLARA wallet id is required"),
  CLARA_MARKET_CONTRACT_ADDRESS: z.string().optional(),
  CLARA_FEE: z.string().min(1, "CLARA market fee is required"),
  CLARA_POLL_INTERVAL: z.number().int()
});
async function validateAoConfig(runtime) {
  try {
    const aoConfig = {
      CLARA_USERNAME: runtime.getSetting("CLARA_AO_USERNAME") || process.env.CLARA_AO_USERNAME,
      CLARA_PRIVATE_KEY: runtime.getSetting("CLARA_AO_WALLET") || process.env.CLARA_AO_WALLET,
      CLARA_WALLET_ID: runtime.getSetting("CLARA_AO_WALLET_ID") || process.env.CLARA_AO_WALLET_ID,
      CLARA_MARKET_CONTRACT_ADDRESS: runtime.getSetting("CLARA_AO_MARKET_ID") || process.env.CLARA_AO_MARKET_ID,
      CLARA_FEE: runtime.getSetting("CLARA_AO_FEE") || process.env.CLARA_AO_FEE,
      CLARA_POLL_INTERVAL: safeParseInt(
        runtime.getSetting("CLARA_AO_POLL_INTERVAL") || process.env.CLARA_AO_POLL_INTERVAL,
        120
        // 2m
      )
    };
    return {
      ...claraEnvSchema.parse(aoConfig),
      CLARA_IMPL: "ao"
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n");
      throw new Error(
        `X/AO configuration validation failed:
${errorMessages}`
      );
    }
    throw error;
  }
}
async function validateStoryConfig(runtime) {
  try {
    const storyConfig = {
      CLARA_USERNAME: runtime.getSetting("CLARA_STORY_USERNAME") || process.env.CLARA_STORY_USERNAME,
      CLARA_PRIVATE_KEY: runtime.getSetting("CLARA_STORY_PRIVATE_KEY") || process.env.CLARA_STORY_PRIVATE_KEY,
      CLARA_WALLET_ID: privateKeyToAccount(
        runtime.getSetting("CLARA_STORY_PRIVATE_KEY") || process.env.CLARA_STORY_PRIVATE_KEY
      ).address,
      CLARA_FEE: runtime.getSetting("CLARA_STORY_FEE") || process.env.CLARA_STORY_FEE,
      CLARA_POLL_INTERVAL: safeParseInt(
        runtime.getSetting("CLARA_AO_POLL_INTERVAL") || process.env.CLARA_AO_POLL_INTERVAL,
        120
        // 2m
      )
    };
    return {
      ...claraEnvSchema.parse(storyConfig),
      CLARA_IMPL: "story"
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n");
      throw new Error(
        `Story configuration validation failed:
${errorMessages}`
      );
    }
    throw error;
  }
}
function safeParseInt(value, defaultValue) {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : Math.max(1, parsed);
}

// src/tasks/ClaraTaskClient.ts
import { elizaLogger as elizaLogger8 } from "@elizaos/core";

// src/tasks/handlers/ClaraMessageHandler.ts
import { elizaLogger as elizaLogger7, stringToUuid as stringToUuid3 } from "@elizaos/core";

// src/tasks/handlers/ClaraTaskHandler.ts
import {
  elizaLogger as elizaLogger6,
  getEmbeddingZeroVector as getEmbeddingZeroVector3,
  stringToUuid as stringToUuid2
} from "@elizaos/core";

// src/utils/utils.ts
import { getEmbeddingZeroVector as getEmbeddingZeroVector2 } from "@elizaos/core";
import { stringToUuid } from "@elizaos/core";
import { elizaLogger as elizaLogger4 } from "@elizaos/core";
var wait = (minTime = 1e3, maxTime = 3e3) => {
  const waitTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};
async function buildConversationThread(aoMessage, prompt, client, maxReplies = 10) {
  const thread = [];
  const visited = /* @__PURE__ */ new Set();
  async function processThread(currentMessage, depth = 0) {
    elizaLogger4.debug("Processing message:", {
      id: currentMessage.id,
      depth
    });
    if (!currentMessage) {
      elizaLogger4.debug("No current message found for thread building");
      return;
    }
    if (depth >= maxReplies) {
      elizaLogger4.debug("Reached maximum reply depth", depth);
      return;
    }
    const memory = await client.runtime.messageManager.getMemoryById(
      stringToUuid(currentMessage.id)
    );
    if (!memory) {
      const roomId = stringToUuid(
        currentMessage.id + "-" + client.runtime.agentId
      );
      const userId = stringToUuid(currentMessage.requester);
      await client.runtime.ensureConnection(
        userId,
        roomId,
        currentMessage.requester,
        currentMessage.requester,
        "clara"
      );
      await client.runtime.messageManager.createMemory({
        id: stringToUuid(
          currentMessage.id + "-" + client.runtime.agentId
        ),
        agentId: client.runtime.agentId,
        content: {
          text: prompt,
          source: "Clara",
          url: currentMessage.id
        },
        createdAt: currentMessage.timestamp,
        roomId,
        userId: currentMessage.requester === client.walletId ? client.runtime.agentId : stringToUuid(currentMessage.requester),
        embedding: getEmbeddingZeroVector2()
      });
    }
    if (visited.has(currentMessage.id)) {
      elizaLogger4.debug("Already visited message:", currentMessage.id);
      return;
    }
    visited.add(currentMessage.id);
    thread.unshift(currentMessage);
    elizaLogger4.debug("Current thread state:", {
      length: thread.length,
      currentDepth: depth,
      messageId: currentMessage.id
    });
  }
  await processThread(aoMessage, 0);
  elizaLogger4.debug("Final thread built:", {
    totalMessages: thread.length,
    messageIds: thread.map((t) => ({
      id: t.id,
      text: t.payload.slice(0, 50)
    }))
  });
  return thread;
}

// src/tasks/ClaraTask.ts
var ClaraTask = class {
  constructor(client, runtime) {
    this.client = client;
    this.runtime = runtime;
    this.walletId = this.client.walletId;
    this.agentId = this.runtime.agentId;
  }
  walletId;
  agentId;
};

// src/tasks/handlers/ClaraStateCompositionHandler.ts
import { elizaLogger as elizaLogger5 } from "@elizaos/core";
var ClaraStateCompositionHandler = class extends ClaraTask {
  constructor(runtime, client) {
    super(client, runtime);
  }
  async handle(claraMessage, prompt, memory) {
    const currentMessage = this.formatMessage(claraMessage, prompt);
    const thread = await buildConversationThread(
      claraMessage,
      prompt,
      this.client
    );
    elizaLogger5.info("Thread: ", thread);
    const formattedConversation = thread.map(
      (message) => `@${message.requester} (${new Date(
        message.timestamp
      ).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric"
      })}):
        ${prompt}`
    ).join("\n\n");
    elizaLogger5.info(
      `Formated conversation for message id: ${claraMessage.id}`,
      formattedConversation
    );
    return await this.runtime.composeState(memory, {
      claraClient: this.client,
      claraUserName: this.client.claraConfig.CLARA_USERNAME,
      currentMessage,
      formattedConversation,
      recentPostInteractions: [formattedConversation]
    });
  }
  formatMessage(claraMessage, prompt) {
    return `  ID: ${claraMessage.id}
  From: ${claraMessage.requester} (@${claraMessage.requester})
  Text: ${prompt}`;
  }
};

// src/tasks/handlers/ClaraTaskHandler.ts
var ClaraTaskHandler = class extends ClaraTask {
  stateCompositionHandler;
  constructor(client, runtime) {
    super(client, runtime);
    this.stateCompositionHandler = new ClaraStateCompositionHandler(
      this.runtime,
      this.client
    );
  }
  async handle({ claraMessage, claraMessageId, claraRoomId }) {
    const { payload, id, topic, requester } = claraMessage;
    if (!payload || typeof payload !== "string") {
      elizaLogger6.error(`Task id ${id}, invalid payload : `, payload);
      return;
    }
    if (!this.runtime.actions.find(
      (a) => a.name.toLowerCase() == topic.toLowerCase()
    ) && !this.runtime.actions.find(
      (action) => action.similes.find(
        (simly) => simly.toLowerCase() == topic.toLowerCase()
      )
    )) {
      elizaLogger6.log(
        `Clara task could not be processed, no action with name ${topic}.`
      );
      return;
    }
    const userIdUUID = this.buildUserUUID(requester);
    await this.runtime.ensureConnection(
      userIdUUID,
      claraRoomId,
      requester,
      requester,
      "clara"
    );
    const memory = this.buildMemory(payload, claraRoomId, userIdUUID);
    const state = await this.stateCompositionHandler.handle(
      claraMessage,
      payload,
      memory
    );
    await this.processTaskInActions(
      state,
      memory,
      claraMessage,
      claraRoomId,
      claraMessageId,
      payload,
      topic,
      id
    );
  }
  async processTaskInActions(state, memory, claraMessage, roomId, messageId, prompt, task, taskId) {
    const self = this;
    try {
      const callback = async (content) => {
        if (!content.text) {
          elizaLogger6.log(
            `Could not send result, no content generated.`
          );
          return [];
        }
        self.client.updateLastCheckedMessage(claraMessage);
        await self.client.sendTaskResult(taskId, content);
        return [];
      };
      const responseMessage = {
        id: messageId,
        userId: this.client.runtime.agentId,
        agentId: this.client.runtime.agentId,
        createdAt: Date.now(),
        content: {
          text: prompt,
          action: task,
          source: "Clara"
        },
        embedding: getEmbeddingZeroVector3(),
        roomId
      };
      await this.runtime.messageManager.createMemory(responseMessage);
      state = await this.runtime.updateRecentMessageState(
        state
      );
      await this.runtime.processActions(
        memory,
        [responseMessage],
        state,
        callback
      );
      await wait();
    } catch (error) {
      elizaLogger6.error(`Error sending response message: ${error}`);
    }
  }
  buildMemory(prompt, claraRoomId, userIdUUID) {
    return {
      content: { text: prompt },
      agentId: this.runtime.agentId,
      userId: userIdUUID,
      roomId: claraRoomId
    };
  }
  buildUserUUID(owner) {
    return stringToUuid2(owner);
  }
};

// src/tasks/handlers/ClaraMessageHandler.ts
var ClaraMessageHandler = class extends ClaraTask {
  claraTaskHandler;
  claraMessage;
  constructor(runtime, client) {
    super(client, runtime);
    this.claraTaskHandler = new ClaraTaskHandler(this.client, this.runtime);
  }
  async handle(claraMessage) {
    this.claraMessage = claraMessage;
    const { id, payload } = this.claraMessage;
    const claraMessageId = stringToUuid3(id);
    const claraRoomId = stringToUuid3(id + "-" + this.agentId);
    elizaLogger7.info(`Started processing Clara message: ${id}.`);
    const valid = await this.validate();
    if (!valid) {
      this.client.updateLastCheckedMessage(this.claraMessage);
      return;
    }
    if (!payload) {
      elizaLogger7.log(`Skipping Clara message, could not locate prompt.`);
      this.client.updateLastCheckedMessage(this.claraMessage);
      return;
    }
    await this.claraTaskHandler.handle({
      claraMessage,
      claraMessageId,
      claraRoomId
    });
    elizaLogger7.info(`Finished processing Clara message ${id}.`);
  }
  async validate() {
    const { requester } = this.claraMessage;
    if (requester === this.walletId) {
      elizaLogger7.log(
        `Skipping Clara message, message from current agent.`
      );
      return false;
    }
    let messageCursor;
    switch (this.client.claraConfig.CLARA_IMPL) {
      case "ao":
        messageCursor = this.claraMessage.timestamp;
        break;
      case "story":
        messageCursor = Number(this.claraMessage.blockNumber);
        break;
      default:
        throw new Error(
          `Unknown Clara impl: ${this.client.claraConfig.CLARA_IMPL}`
        );
    }
    if (this.client.lastCheckedMessage >= messageCursor) {
      elizaLogger7.log(`Skipping Clara message, already processed task.`);
      return false;
    }
    return true;
  }
};

// src/tasks/ClaraTaskClient.ts
var ClaraTaskClient = class {
  client;
  runtime;
  messageHandler;
  constructor(client, runtime) {
    this.client = client;
    this.runtime = runtime;
    this.messageHandler = new ClaraMessageHandler(
      this.runtime,
      this.client
    );
  }
  async start() {
    const handleTasksLoop = () => {
      this.handleTasks();
      setTimeout(
        handleTasksLoop,
        this.client.claraConfig.CLARA_POLL_INTERVAL * 1e3
      );
    };
    handleTasksLoop();
  }
  async handleTasks() {
    elizaLogger8.info("Checking CLARA tasks");
    try {
      const messageToProcess = await this.getMessageToProcess();
      if (messageToProcess) {
        await this.messageHandler.handle(messageToProcess);
      }
      await this.client.cacheLatestCheckedMessage(
        this.client.claraConfig.CLARA_IMPL
      );
      elizaLogger8.info("Finished checking Clara tasks");
    } catch (error) {
      console.log(error);
      elizaLogger8.error("Error handling Clara tasks:", error);
    }
  }
  async getMessageToProcess() {
    const profile = await this.client.claraMarket.getProfile();
    switch (this.client.claraConfig.CLARA_IMPL) {
      case "ao": {
        const message = await profile.loadNextAssignedTask();
        if (message && (!this.client.lastCheckedMessage || message.timestamp > this.client.lastCheckedMessage)) {
          return message;
        }
      }
      case "story": {
        const loadTaskResult = await profile.loadNextTask();
        if (loadTaskResult) {
          return this.parseTask(loadTaskResult);
        } else {
          return null;
        }
      }
      default:
        return null;
    }
  }
  parseTask(task) {
    return {
      ...task,
      id: task.id.toString(),
      timestamp: Number(task.timestamp),
      contextId: task.contextId.toString(),
      reward: task.reward.toString()
    };
  }
};

// src/client.ts
var ClaraManager = class {
  client;
  tasks;
  constructor(runtime, claraConfig) {
    this.client = new ClaraClient(runtime, claraConfig);
    this.tasks = new ClaraTaskClient(this.client, runtime);
  }
  async stop() {
    elizaLogger9.warn("Clara client does not support stopping yet");
  }
};
var ClaraClientInterface = {
  name: "clara",
  async start(runtime) {
    let claraConfig;
    if (runtime.getSetting("CLARA_AO_WALLET") || process.env.CLARA_AO_WALLET) {
      claraConfig = await validateAoConfig(runtime);
    } else {
      claraConfig = await validateStoryConfig(runtime);
    }
    elizaLogger9.log(
      `===== Clara client started: ${claraConfig.CLARA_IMPL}`
    );
    const manager = new ClaraManager(runtime, claraConfig);
    await manager.client.init();
    await manager.tasks.start();
    return manager;
  }
};

// src/index.ts
var claraPlugin = {
  name: "clara",
  description: "Clara client",
  clients: [ClaraClientInterface]
};
var index_default = claraPlugin;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map