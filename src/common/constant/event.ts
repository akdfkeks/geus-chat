/**
 * 사전 정의한 메세지
 */

import { SendOP } from 'src/common/constant/message';

export const CLIENT_AUTH_FAILED = {
  op: SendOP.ERROR,
  d: { code: 4000, message: '사용자 인증에 실패했습니다.' },
};

export const CLIENT_REG_FAILED = {
  op: SendOP.ERROR,
  d: { code: 4000, message: '사용자 등록에 실패했습니다.' },
};
