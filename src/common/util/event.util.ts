import { SendOP } from 'src/common/constant/message';

export namespace EventUtil {
  export const createHello = (userId: string) => {
    return {
      op: SendOP.HELLO,
      d: { id: userId },
    };
  };
}
