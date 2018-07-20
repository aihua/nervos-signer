import { ec, hex2bytes, bytes2hex, sha3 } from './index'
const Signature = require('elliptic/lib/elliptic/ec/signature')
const blockchainPb = require('../proto-js/blockchain_pb')

const unsigner = (hexUnverifiedTransaction: string) => {
  const bytesUnverifiedTransaction = hex2bytes(hexUnverifiedTransaction)
  const unverifiedTransaction = blockchainPb.UnverifiedTransaction.deserializeBinary(
    bytesUnverifiedTransaction,
  )
  const transactionPb = unverifiedTransaction.getTransaction()
  const signature = unverifiedTransaction.getSignature()
  const crypto = unverifiedTransaction.getCrypto()
  const transaction = blockchainPb.Transaction.toObject(true, transactionPb)

  const sign = new Signature({
    r: bytes2hex(signature.slice(0, 32)).slice(2),
    s: bytes2hex(signature.slice(32, 64)).slice(2),
    recoveryParam: signature[64],
  })

  const txMsg = transactionPb.serializeBinary()
  const hashedMsg = sha3(txMsg).slice(2)

  const msg = new Buffer(hashedMsg.toString(), 'hex')

  const pubPoint = ec.recoverPubKey(msg, sign, sign.recoveryParam, 'hex')

  const publicKey = pubPoint
    .encode('hex')
    .slice(2)
    .toLowerCase()
  const bytesPubkey = new Buffer(hex2bytes(publicKey))
  const address = sha3(bytesPubkey)
    .slice(-40)
    .toLowerCase()

  const hexSig = bytes2hex(signature).slice(2)
  const result = { transaction, signature: hexSig, crypto, publicKey, address }

  return result
}

export default unsigner
