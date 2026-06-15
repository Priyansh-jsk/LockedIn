import crypto from 'crypto'

export interface KeyPair {
  publicKey: string
  privateKey: string
}

/**
 * Generates a 2048-bit RSA keypair.
 * The public key is exported in PEM SPKI format.
 * The private key is encrypted symmetrically using AES-256-CBC with the user's passphrase (password)
 * and exported in PEM PKCS8 format.
 */
export function generateUserKeys(passphrase: string): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase,
    },
  })

  return {
    publicKey,
    privateKey,
  }
}

/**
 * Decrypts an encrypted private key PEM using the user's passphrase.
 * Returns the plain text private key PEM.
 */
export function decryptPrivateKey(encryptedPrivateKeyPem: string, passphrase: string): string {
  const privateKeyObject = crypto.createPrivateKey({
    key: encryptedPrivateKeyPem,
    format: 'pem',
    type: 'pkcs8',
    passphrase,
  })

  return privateKeyObject.export({
    type: 'pkcs8',
    format: 'pem',
  }) as string
}
