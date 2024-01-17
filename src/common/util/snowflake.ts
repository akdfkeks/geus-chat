import * as Flake from 'flake-idgen';

const flake = new Flake();

export namespace SnowFlake {
  export const generate = () => {
    return BigInt('0x' + flake.next().toString('hex'));
  };
}
