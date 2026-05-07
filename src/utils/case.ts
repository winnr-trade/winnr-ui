import { camelCase } from "change-case";

/**
 * Recursively converts an object's keys from snake_case to camelCase.
 */
export function keysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v));
  }
  if (obj !== null && typeof obj === "object" && obj.constructor === Object) {
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      result[camelCase(key)] = keysToCamelCase(obj[key]);
    }
    return result;
  }
  return obj;
}
