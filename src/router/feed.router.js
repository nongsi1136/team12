import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// trend 피드 페이지
router.get('/feeds/trend', async (req, res) => {
  const posts = await prisma.posts.findMany({
    select: {
      postId: true,
      imageUrl: true,
      title: true,
      user: {
        select: {
          name: true,
        },
      },
      views: true,
      content: true,
      createdAt: true,
    },
    orderBy: {
      views: 'desc',
    },
  });
  return res.status(200).json({ data: posts });
});

// 상태-홍보 피드 페이지
router.get('/feeds/event', async (req, res) => {
  const posts = await prisma.posts.findMany({
    where: {
      category: 'PROMOTION',
    },
    select: {
      postId: true,
      thumbnailUrl: true,
      title: true,
      user: {
        select: {
          name: true,
        },
      },
      views: true,
      content: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return res.status(200).json({ data: posts });
});

// 자유 게시글(잡담) 피드 페이지
router.get('/feeds/chat', async (req, res) => {
  const posts = await prisma.posts.findMany({
    where: {
      category: 'CHIT_CHAT',
    },
    select: {
      postId: true,
      thumbnailUrl: true,
      title: true,
      user: {
        select: {
          name: true,
        },
      },
      views: true,
      content: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return res.status(200).json({ data: posts });
});

// 내 피드 확인 페이지
// 3. 내 게시글 조회 API
router.get('/feeds/mypost/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId가 누락되었습니다.' });
    }

    const userPosts = await prisma.posts.findMany({
      where: { userId: +userId },
      orderBy: { createdAt: 'desc' }, // 최신 게시글이 먼저 표시됩니다.
      select: {
        postId: true,
        title: true,
        content: true,
        imageUrl: true,
        user: {
          select: { name: true },
        },
        createdAt: true,
        category: true,
      },
    });

    return res.status(200).json({ data: userPosts });
  } catch (error) {
    console.error('내 게시글 조회 API 오류:', error);
    return res.status(500).json({ message: '서버 오류 발생' });
  }
});

export default router;
