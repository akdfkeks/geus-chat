import * as jwt from 'jsonwebtoken';

export namespace JWTHelper {
  export const generate = (payload: any) => (secret: string) => (options?: jwt.SignOptions) =>
    jwt.sign(payload, secret, options);

  export const verify =
    <PayloadType = any>(token: any) =>
    (secret: string) =>
    (options?: jwt.VerifyOptions) =>
      jwt.verify(token, secret, options) as PayloadType;

  export const decode =
    <PayloadType = any>(token: any) =>
    (options?: jwt.DecodeOptions) =>
      jwt.decode(token) as PayloadType;
}
