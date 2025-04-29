import { customAlphabet } from 'nanoid';

// URL-safe characters: a-zA-Z0-9
const EDIT_KEY_LENGTH = 10;
const EDIT_KEY_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(EDIT_KEY_ALPHABET, EDIT_KEY_LENGTH);

// Create a new edit key
export function createEditKey(): string {
  return nanoid();
}

// Validate edit key format (optional regex check)
export function isValidEditKey(key: string): boolean {
  const regex = new RegExp(`^[${EDIT_KEY_ALPHABET}]{${EDIT_KEY_LENGTH}}$`);
  return regex.test(key);
}
