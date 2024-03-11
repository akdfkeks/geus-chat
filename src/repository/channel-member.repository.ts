import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/service/prisma.service';
import { IFindChannelMemberResult } from 'src/structure/dto/Channel';

@Injectable()
export class ChannelMemberRepository {
  constructor(private readonly prisma: PrismaService) {}
}
