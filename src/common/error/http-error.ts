import { ErrorCause } from 'src/structure/error/error-cause';

export const INTERNAL_SERVER_ERROR: ErrorCause = {
  code: '100-000',
  title: 'Internal server error',
  message: 'An unhandled exception occurred.',
};

export const BAD_REQUEST: ErrorCause = {
  code: '100-001',
  title: '요청을 처리할 수 없습니다.',
  message: '요청 형식이 올바르지 않습니다.',
};

export const NO_PERMISSION: ErrorCause = {
  code: '100-101',
  title: '요청을 처리할 수 없습니다.',
  message: '인증 정보가 유효하지 않습니다.',
};

export const LOGIN_BAD_REQUEST: ErrorCause = {
  code: '100-102',
  title: '로그인에 실패했습니다.',
  message: '요청 형식이 올바르지 않습니다.',
};

export const REFRESH_BAD_REQUEST: ErrorCause = {
  code: '100-103',
  title: '사용자 인증에 실패했습니다.',
  message: '인증 정보가 올바르지 않습니다.',
};

export const MSG_HISTORY_NOT_MEMBER: ErrorCause = {
  code: '100-201',
  title: '대화내역을 불러올 수 없습니다.',
  message: '잘못된 요청입니다.',
};
