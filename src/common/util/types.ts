export type Merge<F, S> = {
  [K in keyof F | keyof S]: K extends keyof S ? S[K] : K extends keyof F ? F[K] : never;
};

export type Flatten<S extends any[], T extends any[] = []> = S extends [infer X, ...infer Y]
  ? X extends any[]
    ? Flatten<[...X, ...Y], T>
    : Flatten<[...Y], [...T, X]>
  : T;
