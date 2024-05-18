import { ErrorResponse } from 'src/structure/error';

export const FILES_ARE_OVERSIZED: ErrorResponse = {
  code: '000-0000',
  title: '사진 전송에 실패했습니다.',
  message: '5MB 이하의 파일만 전송할 수 있습니다.',
};

export const FILES_ARE_UNSUP_TYPE: ErrorResponse = {
  code: '000-0000',
  title: '사진 전송에 실패했습니다.',
  message: '지원되지 않는 형식입니다.',
};

export const NO_ACCESS_TOKEN: ErrorResponse = {
  code: '000-0000',
  title: '요청을 처리할 수 없습니다.',
  message: '인증 정보가 올바르지 않습니다. 다시 로그인해주세요.',
};

export const NOT_PARSABLE: ErrorResponse = {
  code: '000-0000',
  title: '요청을 처리할 수 없습니다.',
  message: '잘못된 요청입니다.',
};

export const NO_SUCH_CHANNEL: ErrorResponse = {
  code: '000-0000',
  title: '채널 조회에 실패했습니다.',
  message: '존재하지 않는 채널입니다.',
};

export const NO_SUCH_USER: ErrorResponse = {
  code: '000-0000',
  title: '사용자 조회에 실패했습니다.',
  message: '존재하지 않는 사용자입니다.',
};

export const LOGIN_FAILED_BAD_REQUEST = {
  code: '000-0000',
  title: '로그인에 실패했습니다.',
  message: '요청 형식이 올바르지 않습니다.',
};

export const LOGIN_FAILED_NOT_FOUND = {
  code: '000-0000',
  title: '로그인에 실패했습니다.',
  message: '아이디 또는 비밀번호를 확인해주세요.',
};

export const AUTH_FAILED_BAD_REQUEST = {
  code: '000-0000',
  title: '사용자 인증에 실패했습니다.',
  message: '요청 형식이 올바르지 않습니다.',
};

export const FILES_UPLOAD_FAILED_UNKNOWN = {
  code: '000-0000',
  title: '사진 전송에 실패했습니다.',
  message: '이유는 나도 몰라',
};

export const MESSAGE_HISTORY_NO_PERMIT = {
  code: '000-0000',
  title: '대화내역을 불러오지 못했습니다.',
  message: '잘못된 요청입니다.',
};
