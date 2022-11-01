import { camelCase, toUpper } from 'lodash';

export const collapseSpaces = (str: string, toLowerCase = false): string => {
  const result = str.replace(/\s\s+/g, ' ').trim();
  return toLowerCase ? result.toLowerCase() : result;
};

export const beginsWithDigit = (str: string): boolean => !!str.match(/^\d/);

export const toPascalCase = (str: string): string =>
  camelCase(str).replace(/^(.)/, toUpper);

// TODO Replace with well-tested npm module
export const getRandomId = (length = 10): string => {
  const create = (): string =>
    String(
      Math.floor(
        // eslint-disable-next-line no-restricted-properties
        Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
      ),
    );

  const isValid = (rnd: string): boolean => {
    if (rnd.length !== length) {
      return false;
    }

    // Avoid ids starting with 0
    return rnd.charAt(0) !== '0';
  };

  let result = create();

  do {
    result = create();
  } while (!isValid(result));

  return result;
};
