import { tags } from 'typia';

export interface EventData<PayloadType = any> {
  op: number & tags.Minimum<0> & tags.Maximum<100>;
  d: PayloadType;
}
