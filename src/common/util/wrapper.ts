export namespace Wrapper {
  export const TryOrThrow = <T>(tryable: (...args: any[]) => T, throwable?: any): T => {
    try {
      return tryable();
    } catch (e) {
      throw throwable ?? e;
    }
  };
  export const TryOrThrowAsync = async <T>(tryable: (...args: any[]) => Promise<T>, throwable?: any): Promise<T> => {
    try {
      return await tryable();
    } catch (e) {
      throw throwable ?? e;
    }
  };
}
