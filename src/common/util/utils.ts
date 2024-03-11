export const isTruthy = (input: unknown): boolean => {
  switch (input) {
    case undefined:
    case false:
    case null:
    case '':
    case 0:
    case -0:
    case 0n:
    case -0n:
      return false;
    default:
      if (Number.isNaN(input)) return false;
  }
  return true;
};

export const isFalsy = (input: unknown): boolean => {
  return !isTruthy(input);
};
