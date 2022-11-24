import { camelCase, toUpper } from 'lodash';
import { customAlphabet } from 'nanoid';

/**
 * Collapse multiple spaces and trim with the optional lowercasing
 */
export const collapseSpaces = (str: string, toLowerCase = false): string => {
  const result = str.replace(/\s\s+/g, ' ').trim();
  return toLowerCase ? result.toLowerCase() : result;
};

/**
 * Returns true if string begins with a digit
 */
export const beginsWithDigit = (str: string): boolean => !!str.match(/^\d/);

/**
 * Transform string to PacsalCase
 */
export const toPascalCase = (str: string): string =>
  camelCase(str).replace(/^(.)/, toUpper);

export const getNanoId = (
  size = 21,
  chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890',
): string => customAlphabet(chars, size)();
