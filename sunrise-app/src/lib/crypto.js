// Simple AES-GCM encryption/decryption helpers using Web Crypto API

export async function generateKey(secret) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("collegeTrackerSalt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  return key;
}

export async function encryptData(secret, data) {
  const key = await generateKey(secret);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encoded = enc.encode(JSON.stringify(data));

  const cipher = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const ivStr = btoa(String.fromCharCode(...iv));
  const cipherStr = btoa(String.fromCharCode(...new Uint8Array(cipher)));

  return `${ivStr}:${cipherStr}`;
}

export async function decryptData(secret, encrypted) {
  const [ivStr, cipherStr] = encrypted.split(":");
  const iv = Uint8Array.from(atob(ivStr), (c) => c.charCodeAt(0));
  const cipherBytes = Uint8Array.from(atob(cipherStr), (c) => c.charCodeAt(0));

  const key = await generateKey(secret);
  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(plainBuffer));
}
