import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { isNil } from 'src/common/util/utils';
import * as error from 'src/common/error/http-error';

export class ParseBigIntPipe implements PipeTransform {
  public transform(value: any, meta: ArgumentMetadata) {
    if (isNil(value) || !this.isParsable(value)) {
      throw new BadRequestException(error.BAD_REQUEST);
    }
    return BigInt(value);
  }

  protected isParsable(value: any) {
    return (
      ['string', 'number', 'bigint'].includes(typeof value) && new RegExp(/^[0-9]+$/).test(value)
    );
  }
}
