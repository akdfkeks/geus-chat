import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { NOT_PARSABLE } from 'src/common/error/rest/expected';
import { ErrorUtil } from 'src/common/util/error.util';
import { isNil } from 'src/common/util/utils';

export class ParseBigIntPipe implements PipeTransform {
  public transform(value: any, meta: ArgumentMetadata) {
    if (isNil(value) || !this.isParsable(value)) {
      throw ErrorUtil.badRequest(NOT_PARSABLE);
    }
    return BigInt(value);
  }

  protected isParsable(value: any) {
    return ['string', 'number', 'bigint'].includes(typeof value) && new RegExp(/^[0-9]+$/).test(value);
  }
}
