import * as Flake from 'flake-idgen';

export const GEUS_EPOCH = 1704067200000; //01/01/2024, 00:00:00 (UTC +00:00)

const flake = new Flake({ worker: process.pid, epoch: GEUS_EPOCH });

export namespace SnowFlake {
  export const generate = (): bigint => {
    try {
      return BigInt('0x' + flake.next().toString('hex'));
    } catch (e) {
      // 계속 실패하면 콜스택 터지나
      return SnowFlake.generate();
    }
  };
  export const parseDate = (snowflake: number | bigint) => {
    const ms = (BigInt(snowflake) >> 22n) as unknown as number;
    return new Date(ms + GEUS_EPOCH);
  };
}
