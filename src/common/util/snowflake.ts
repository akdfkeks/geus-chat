import * as Flake from 'flake-idgen';

export const GEUS_EPOCH = 1704067200000; //01/01/2024, 00:00:00 (UTC +00:00)

const flake = new Flake({ worker: process.pid, epoch: GEUS_EPOCH });

export namespace SnowFlake {
  export const generate = () => {
    return BigInt('0x' + flake.next().toString('hex'));
  };
  export const parseDate = (snowflake: number | bigint) => {
    const ms = (BigInt(snowflake) >> 22n) as unknown as number;
    return new Date(ms + GEUS_EPOCH);
  };
}
