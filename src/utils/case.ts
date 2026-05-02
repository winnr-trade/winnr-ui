import { camelCase } from "change-case";

/**
 * Recursively converts an object's keys from snake_case to camelCase.
 */
export function keysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v));
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: keysToCamelCase(obj[key]),
      }),
      {},
    );
  }
  return obj;
}
