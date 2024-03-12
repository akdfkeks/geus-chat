import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { isNil } from 'src/common/util/utils';

export class ParseBigIntPipe implements PipeTransform {
  public transform(value: any, meta: ArgumentMetadata) {
    if (isNil(value) || !this.isParsable(value)) {
      throw new BadRequestException();
    }
    return BigInt(value);
  }

  protected isParsable(value: any) {
    return ['string', 'number', 'bigint'].includes(typeof value) && new RegExp(/^[0-9]+$/).test(value);
  }
}
