"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Web3 = require('web3');
const blockchainPb = require('../proto-js/blockchain_pb');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const web3 = new Web3('');
const getNonce = () => {
    return web3.utils.randomHex(5);
};
const hex2bytes = (hex) => {
    if (typeof hex === 'string') {
        return web3.utils.hexToBytes(hex.startsWith('0x') ? hex : '0x' + hex);
    }
    if (typeof hex === 'number') {
        return '0x' + hex.toString(16);
    }
    throw new Error('Invalid Hex or Number');
};
const sign = ({ privateKey, data = '', nonce = getNonce(), quota, validUntilBlock, value, version = 0, chainId = 1, to = '', }) => {
    const tx = new blockchainPb.Transaction();
    if (nonce === undefined) {
        throw new Error('Nonce should be set');
    }
    else {
        tx.setNonce(nonce);
    }
    if (quota > 0) {
        tx.setQuota(quota);
    }
    else {
        throw new Error('Quota should be set larger than 0');
    }
    try {
        const _value = hex2bytes(value || '');
        tx.setData(new Uint8Array(_value));
    }
    catch (err) {
        throw new Error(err);
    }
    if (to) {
        tx.setTo(to);
    }
    if (validUntilBlock === undefined) {
        throw new Error('ValidUntilBlock should be set');
    }
    else {
        tx.setValidUntilBlock(validUntilBlock);
    }
    if (chainId === undefined) {
        throw new Error('Chain Id should be set');
    }
    else {
        tx.setChainId(chainId);
    }
    try {
        const _data = hex2bytes(data);
        tx.setData(new Uint8Array(_data));
    }
    catch (err) {
        throw new Error(err);
    }
    tx.setVersion(version);
    const txMsg = tx.serializeBinary();
    const hashedMsg = web3.utils.sha3(txMsg).slice(2);
    var key = ec.keyFromPrivate(privateKey, 'hex');
    var sign = key.sign(new Buffer(hashedMsg.toString(), 'hex'));
    var sign_r = sign.r.toString(16);
    var sign_s = sign.s.toString(16);
    if (sign_r.length == 63)
        sign_r = '0' + sign_r;
    if (sign_s.length == 63)
        sign_s = '0' + sign_s;
    var signature = sign_r + sign_s;
    var sign_buffer = new Buffer(signature, 'hex');
    var sigBytes = new Uint8Array(65);
    sigBytes.set(sign_buffer);
    sigBytes[64] = sign.recoveryParam;
    const unverifiedTx = new blockchainPb.UnverifiedTransaction();
    unverifiedTx.setTransaction(tx);
    unverifiedTx.setCrypto(blockchainPb.Crypto.SECP);
    unverifiedTx.setSignature(sigBytes);
    const serializedUnverifiedTx = unverifiedTx.serializeBinary();
    const hexUnverifiedTx = web3.utils.bytesToHex(serializedUnverifiedTx);
    return hexUnverifiedTx;
};
exports.default = sign;
