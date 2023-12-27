import { PrismaClient } from '@prisma/client';
import { log } from 'console';
import { ulid } from 'ulidx';

const prisma = new PrismaClient();

async function main() {
  const userNames = ['alice', 'bob', 'joi'];
  const channelIds = [ulid(), ulid(), ulid(), ulid()];

  await prisma.gh_User.createMany({
    skipDuplicates: true,
    data: createDummyFromUserNames(userNames),
  });

  const users = await prisma.gh_User.findMany({ where: { user_id: { gte: 0 } } });

  await prisma.gh_ChannelInfo.createMany({
    skipDuplicates: true,
    data: channelIds.map((ulid, index) => {
      return {
        id: ulid,
        owner_id: users[0].user_id,
        name: 'channel' + index,
      };
    }),
  });

  await prisma.gh_MemberInChannel.createMany({
    skipDuplicates: true,
    data: [
      {
        user_email: 'alice@example.com',
        channel_id: channelIds[0],
      },
      {
        user_email: 'alice@example.com',
        channel_id: channelIds[1],
      },
      {
        user_email: 'alice@example.com',
        channel_id: channelIds[2],
      },
      {
        user_email: 'bob@example.com',
        channel_id: channelIds[0],
      },
      {
        user_email: 'bob@example.com',
        channel_id: channelIds[2],
      },
      {
        user_email: 'joi@example.com',
        channel_id: channelIds[3],
      },
    ],
  });
}

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

export default async function prismaSeed() {
  console.log('\nSetting up test data ...\n');
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch((e) => {
      console.error(e);
    });

  return 1;
}

function createDummyFromUserNames(names: string[]) {
  return names.map((name, index) => {
    return {
      email: name + '@example.com',
      birth: new Date(),
      name: name,
      nickname: name,
      password: '$2b$10$V2DqPU8ZHJNLnEFEznxXyOUf9RFFw84QfTv16hA87AVOljn3HOytu', // plain: "test"
      phone_num: '010-0000-000' + index,
      provider: '',
      user_type: '',
    };
  });
}
