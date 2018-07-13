import { ec, hex2bytes, bytes2hex, sha3 } from './index'
const Signature = require('elliptic/lib/elliptic/ec/signature')
const blockchainPb = require('../proto-js/blockchain_pb')

// const hash = '3e30a38d0c1ba31af1d51bb73431646122054b28ce29a19e47a369ac8de49bd9'

// const signature =
//   '0x3f6f408dc4090b189f8e30e2c54861ab4a4164743755e42686e2916d0ce50b56ef36463fc866c5c549192729e4152ae89c8abd10ebb9e50d37054d2d4875f43700'

const content =
  '0x0afd01186420ff93ebdc032af0016060604052341561000f57600080fd5b60d38061001d6000396000f3006060604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806360fe47b114604e5780636d4ce63c14606e575b600080fd5b3415605857600080fd5b606c60048080359060200190919050506094565b005b3415607857600080fd5b607e609e565b6040518082815260200191505060405180910390f35b8060008190555050565b600080549050905600a165627a7a723058202d9a0979adf6bf48461f24200e635bc19cd1786efbcfc0608eb1d76114d405860029380112413f6f408dc4090b189f8e30e2c54861ab4a4164743755e42686e2916d0ce50b56ef36463fc866c5c549192729e4152ae89c8abd10ebb9e50d37054d2d4875f43700'

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

  console.log('hashed')
  console.log(hashedMsg)
  const pubPoint = ec.recoverPubKey(msg, sign, sign.recoveryParam)

  const publicKey = pubPoint.encode('hex').slice(2)
  console.log(sha3(publicKey).slice(-40))

  const hexSig = bytes2hex(signature).slice(2)
  const result = { transaction, signature: hexSig, crypto }

  return result
}

console.log(unsigner(content))
