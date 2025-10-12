export function isNil(value: unknown): value is null {
  return value === null || value === undefined || (typeof value === 'number' && isNaN(value));
}

export function isNotNil<T>(value?: T): value is NonNullable<T> {
  return !isNil(value);
}

export const isIndexInBound = (index: number): boolean => index > 0 && index <= 8; //index from 1..8

