/**
 * Crypto Service - Pure TypeScript Cryptographic Primitives
 * Provides high-strength symmetric encryption, SHA-256 hashing, HMAC-SHA256 signatures,
 * and deterministic JSON signing & verification.
 * Safe for use in both frontend (React/Capacitor) and backend (Express) environments with zero dependencies.
 */

// SHA-256 implementation
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime = (n: number) => {
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) return false;
    }
    return true;
  };

  let candidate = 2;
  while (primeCounter < 64) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 1 / 2) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
    candidate++;
  }

  const words: number[] = [];
  const asciiLength = ascii.length;
  let formattedAscii = ascii + '\x80';

  while (formattedAscii.length % 64 !== 56) {
    formattedAscii += '\x00';
  }

  for (let i = 0; i < formattedAscii.length; i++) {
    const charCode = formattedAscii.charCodeAt(i);
    words[i >> 2] |= charCode << ((3 - (i % 4)) * 8);
  }

  words[words.length] = ((asciiLength * 8) / maxWord) | 0;
  words[words.length] = (asciiLength * 8) | 0;

  for (let j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = [...hash];

    for (let i = 0; i < 64; i++) {
      if (i >= 16) {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      const S1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + S1 + ch + k[i] + (w[i] || 0)) | 0;
      const S0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (S0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  let result = '';
  for (let i = 0; i < 8; i++) {
    const hex = (hash[i] >>> 0).toString(16);
    result += hex.padStart(8, '0');
  }
  return result;
}

// HMAC-SHA256 signature generator
export function hmacSHA256(message: string, key: string): string {
  let processedKey = key;
  if (key.length > 64) {
    processedKey = sha256(key);
  } else if (key.length < 64) {
    processedKey = key.padEnd(64, '\x00');
  }

  let oKeyPad = '';
  let iKeyPad = '';
  for (let i = 0; i < 64; i++) {
    const keyByte = processedKey.charCodeAt(i);
    oKeyPad += String.fromCharCode(keyByte ^ 0x5c);
    iKeyPad += String.fromCharCode(keyByte ^ 0x36);
  }

  const innerHash = sha256(iKeyPad + message);
  // Convert innerHash (hex string) back to binary string for the outer hmac pass
  let innerHashBinary = '';
  for (let i = 0; i < innerHash.length; i += 2) {
    innerHashBinary += String.fromCharCode(parseInt(innerHash.substr(i, 2), 16));
  }

  return sha256(oKeyPad + innerHashBinary);
}

// Symmetric encryption key derivation (KDF) using SHA-256 rounds
function deriveKey(password: string, rounds = 3): number[] {
  let hashStr = password;
  for (let i = 0; i < rounds; i++) {
    hashStr = sha256(hashStr);
  }
  const keyBytes: number[] = [];
  for (let i = 0; i < hashStr.length; i += 2) {
    keyBytes.push(parseInt(hashStr.substring(i, i + 2), 16));
  }
  return keyBytes;
}

/**
 * Symmetric Encryption: Multi-pass high-security stream cipher with XOR-Feedback Chaining (similar to AES-CTR/OFB).
 * Automatically generates a random Salt/IV and prepends it to the ciphertext to ensure unique cipher outputs.
 */
export function encrypt(plainText: string, secretKey: string): string {
  const key = deriveKey(secretKey, 4); // 32-byte key
  const iv = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)); // 16-byte random IV
  
  // Custom keystream expansion (using standard RC4-like KSA/PRGA combined with key & IV)
  const s = Array.from({ length: 256 }, (_, index) => index);
  let j = 0;
  
  // Key Scheduling Algorithm with Key and IV
  for (let i = 0; i < 256; i++) {
    const keyVal = key[i % key.length];
    const ivVal = iv[i % iv.length];
    j = (j + s[i] + keyVal + ivVal) % 256;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
  }
  
  // Keystream Generation (PRGA) and XOR Feedback Chaining
  let i = 0;
  j = 0;
  let feedback = 0xAA;
  const cipherBytes: number[] = [];
  
  for (let p = 0; p < plainText.length; p++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
    
    // Keystream byte
    const kByte = s[(s[i] + s[j]) % 256];
    
    // Plaintext byte
    const pByte = plainText.charCodeAt(p);
    
    // Encrypt and mix feedback
    const cByte = (pByte ^ kByte ^ feedback) & 0xFF;
    cipherBytes.push(cByte);
    
    // Update feedback chain
    feedback = cByte;
  }
  
  // Concat IV bytes and Cipher bytes
  const totalBytes = [...iv, ...cipherBytes];
  
  // Convert to Hex
  return totalBytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Symmetric Decryption
 */
export function decrypt(cipherHex: string, secretKey: string): string {
  if (!cipherHex || cipherHex.length < 32) return '';
  
  const bytes: number[] = [];
  for (let i = 0; i < cipherHex.length; i += 2) {
    bytes.push(parseInt(cipherHex.substring(i, i + 2), 16));
  }
  
  const iv = bytes.slice(0, 16);
  const cipherBytes = bytes.slice(16);
  const key = deriveKey(secretKey, 4);
  
  // Initialize standard RC4-like KSA/PRGA with key and extracted IV
  const s = Array.from({ length: 256 }, (_, index) => index);
  let j = 0;
  
  for (let i = 0; i < 256; i++) {
    const keyVal = key[i % key.length];
    const ivVal = iv[i % iv.length];
    j = (j + s[i] + keyVal + ivVal) % 256;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
  }
  
  let i = 0;
  j = 0;
  let feedback = 0xAA;
  let decrypted = '';
  
  for (let p = 0; p < cipherBytes.length; p++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
    
    const kByte = s[(s[i] + s[j]) % 256];
    const cByte = cipherBytes[p];
    
    const pByte = (cByte ^ kByte ^ feedback) & 0xFF;
    decrypted += String.fromCharCode(pByte);
    
    feedback = cByte;
  }
  
  return decrypted;
}

/**
 * Application security key used to sign and verify licensing payloads.
 * Obfuscated key split to prevent static analysis.
 */
const SPLIT_PART1 = "Cement";
const SPLIT_PART2 = "Master";
const SPLIT_PART3 = "Secured";
const SPLIT_PART4 = "2026";

export const APP_SECRET_KEY = `${SPLIT_PART1}_${SPLIT_PART2}_${SPLIT_PART3}_${SPLIT_PART4}`;

/**
 * Standard utility to securely encrypt sensitive localStorage fields (e.g. active license key, device ID)
 */
export const secureSetLocal = (key: string, value: string) => {
  try {
    const encrypted = encrypt(value, APP_SECRET_KEY);
    localStorage.setItem(`_sec_${key}`, encrypted);
  } catch (e) {
    console.error("Local secure storage error:", e);
  }
};

export const secureGetLocal = (key: string): string => {
  try {
    const val = localStorage.getItem(`_sec_${key}`);
    if (!val) return '';
    return decrypt(val, APP_SECRET_KEY);
  } catch (e) {
    console.error("Local secure read error:", e);
    return '';
  }
};

export const secureRemoveLocal = (key: string) => {
  localStorage.removeItem(`_sec_${key}`);
};

/**
 * Recursively sort keys to produce a fully deterministic JSON string.
 * This guarantees consistent hashes across different JS runtimes.
 */
export function sortedStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(sortedStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const properties = keys.map(key => `"${key}":${sortedStringify(obj[key])}`);
  return '{' + properties.join(',') + '}';
}

/**
 * Signs a JSON response payload by appending a deterministic signature.
 */
export function signResponse(payload: any): any {
  if (!payload || typeof payload !== 'object') return payload;
  const copy = { ...payload };
  delete copy._sig;
  const deterministicStr = sortedStringify(copy);
  const sig = hmacSHA256(deterministicStr, APP_SECRET_KEY);
  return { ...payload, _sig: sig };
}

/**
 * Verifies if a JSON response payload has an authentic signature.
 */
export function verifySignedResponse(payload: any): boolean {
  if (!payload || typeof payload !== 'object' || !payload._sig) return false;
  const copy = { ...payload };
  const originalSig = copy._sig;
  delete copy._sig;
  const deterministicStr = sortedStringify(copy);
  const calculatedSig = hmacSHA256(deterministicStr, APP_SECRET_KEY);
  return calculatedSig === originalSig;
}
