import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databaseUrl),
});

const demoExamContent = [
  {
    type: 'radio',
    question: '最长的河？',
    options: ['尼罗河', '长江', '亚马孙河', '黄河'],
    score: 5,
    answer: '尼罗河',
    answerAnalyse: '通常认为尼罗河是世界最长河流。',
  },
  {
    type: 'checkbox',
    question: '下面哪些属于前端技术？',
    options: ['React', 'Vue', 'MySQL', 'CSS'],
    score: 5,
    answer: ['React', 'Vue', 'CSS'],
    answerAnalyse: 'React、Vue、CSS 都用于前端开发，MySQL 是数据库。',
  },
  {
    type: 'blank',
    question: 'HTTP 默认端口是 ____。',
    score: 5,
    answer: '80',
    answerAnalyse: 'HTTP 默认端口是 80，HTTPS 默认端口是 443。',
  },
];

async function main() {
  const creator = await prisma.user.upsert({
    where: {
      username: 'admin',
    },
    update: {
      password: '123456',
      email: 'admin@example.com',
    },
    create: {
      username: 'admin',
      password: '123456',
      email: 'admin@example.com',
    },
  });

  await prisma.user.upsert({
    where: {
      username: 'student',
    },
    update: {
      password: '123456',
      email: 'student@example.com',
    },
    create: {
      username: 'student',
      password: '123456',
      email: 'student@example.com',
    },
  });

  const existingExam = await prisma.exam.findFirst({
    where: {
      name: '示例考试',
      createUserId: creator.id,
    },
  });

  if (existingExam) {
    await prisma.exam.update({
      where: {
        id: existingExam.id,
      },
      data: {
        isPublish: true,
        isDelete: false,
        content: JSON.stringify(demoExamContent),
      },
    });
  } else {
    await prisma.exam.create({
      data: {
        name: '示例考试',
        isPublish: true,
        isDelete: false,
        content: JSON.stringify(demoExamContent),
        createUserId: creator.id,
      },
    });
  }

  console.log('Seed completed. Login users: admin/123456, student/123456');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
