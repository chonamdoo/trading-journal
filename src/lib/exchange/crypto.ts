import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export interface EncryptedSecret {
  ciphertext: string;
  iv: string;
  tag: string;
  kid: string;
  version: 1;
}

export interface EncryptionContext {
  userId: string;
  exchange: string;
  field: string;
}

function getCurrentKeyId(): string {
  return process.env.EXCHANGE_ENCRYPTION_KEY_ID ?? 'primary';
}

function getConfiguredKeys(): Record<string, string> {
  const currentKid = getCurrentKeyId();
  const keys: Record<string, string> = {};

  if (process.env.EXCHANGE_ENCRYPTION_KEY) {
    keys[currentKid] = process.env.EXCHANGE_ENCRYPTION_KEY;
  }

  if (process.env.EXCHANGE_ENCRYPTION_KEYRING) {
    const parsed = JSON.parse(process.env.EXCHANGE_ENCRYPTION_KEYRING) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('EXCHANGE_ENCRYPTION_KEYRING must be a JSON object.');
    }
    for (const [kid, value] of Object.entries(parsed)) {
      if (typeof value !== 'string') {
        throw new Error('EXCHANGE_ENCRYPTION_KEYRING values must be base64 strings.');
      }
      keys[kid] = value;
    }
  }

  return keys;
}

function getEncryptionKey(kid = getCurrentKeyId()): Buffer {
  const rawKey = getConfiguredKeys()[kid];
  if (!rawKey) {
    throw new Error(`Exchange encryption key is not available for kid: ${kid}`);
  }

  const key = Buffer.from(rawKey, 'base64');
  if (key.length !== 32) {
    throw new Error('EXCHANGE_ENCRYPTION_KEY must be a base64-encoded 32 byte key.');
  }

  return key;
}

function contextToAad(context: EncryptionContext): Buffer {
  return Buffer.from(JSON.stringify({
    exchange: context.exchange,
    field: context.field,
    userId: context.userId,
    version: 1,
  }), 'utf8');
}

export function encryptSecret(value: string, context: EncryptionContext): EncryptedSecret {
  const iv = randomBytes(12);
  const kid = getCurrentKeyId();
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(kid), iv);
  cipher.setAAD(contextToAad(context));
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    kid,
    version: 1,
  };
}

export function decryptSecret(secret: EncryptedSecret, context: EncryptionContext): string {
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(secret.kid),
    Buffer.from(secret.iv, 'base64'),
  );
  decipher.setAAD(contextToAad(context));
  decipher.setAuthTag(Buffer.from(secret.tag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(secret.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
