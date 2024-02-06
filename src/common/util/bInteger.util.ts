// @ts-nocheck

export namespace BigIntegerUtil {
  /**
   * 인자로 전달된 BigInt 형식의 값을 String으로 변환합니다.
   * 객체의 경우 재귀 탐색하며 변환을 수행합니다.
   */
  export function stringifyBigInt(data: unknown) {
    if (Array.isArray(data)) {
      return data.map((i) => stringifyBigInt(i));
    }

    if (typeof data === 'object' && data !== null) {
      const result = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          result[key] = stringifyBigInt(data[key]);
        }
      }
      return result;
    }

    if (typeof data === 'bigint') {
      return data.toString();
    }

    return data;
  }

  /**
   * 인자로 전달된 값을 Number 또는 BigInt로 변환합니다.
   * 객체의 경우 재귀 탐색하며 변환을 수행합니다.
   */
  export function parseBigInt<T = any>(data: unknown) {
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map((item) => parseBigInt(item));
      }

      const result = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          result[key] = parseBigInt(data[key]);
        }
      }
      return result as T;
    }

    if (typeof data === 'string' && /^-?[0-9]+$/.test(data)) {
      return Number.isSafeInteger(Number(data)) ? parseInt(data, 10) : BigInt(data);
    }

    return data;
  }
}
