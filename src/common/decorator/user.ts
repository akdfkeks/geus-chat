import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const ReqUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return BigInt(request.user.uid);
});
