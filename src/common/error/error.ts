export namespace ERROR {
  export const BAD_REQUEST = {
    CODE: 4001,
    MESSAGE: 'Bad request',
  };
  export namespace AUTH {
    export const NO_AUTH_TOKEN = {
      CODE: 4011,
      MESSAGE: 'No authentication token',
    };
  }
  export namespace CONNECTION {
    export const USER_NOT_FOUND = {
      CODE: 4041,
      MESSAGE: 'User not found',
    };

    export const FAIL_TO_REGISTER = {
      CODE: 5001,
      MESSAGE: 'Fail to register client',
    };
  }
  export namespace BUSSINESS {}
}
