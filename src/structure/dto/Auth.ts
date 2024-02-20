import typia from 'typia';

import * as tags from 'typia/lib/tags';

export interface JWTPayload {
  uid: number;
}

export interface IUserLoginDto {
  email: string & tags.MinLength<1> & tags.MaxLength<50>; // & tags.Format<'email'>;
  password: string & tags.MinLength<1> & tags.MaxLength<50> & tags.Format<'password'>;
}
