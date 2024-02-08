import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { error } from 'winston';

const router = express.Router();

// 게시글 작성 API
router.post('/posts', authMiddleware, async (req, res, next) => {
  const { title, content, category, imageUrl } = req.body;
  const { userId, role } = req.user;

  try {
    if (category === 'PROMOTION' && role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'PROMOTION 카테고리에 작성할 권한이 없습니다.' });
    }
    const post = await prisma.posts.create({
      data: {
        userId: +userId,
        title: title,
        content: content,
        category: category,
        imageUrl: imageUrl,
      },
    });
    return res.status(201).json({ data: post });
  } catch (error) {
    next(error);
  }
});

//게시글 상세 조회 API >> 내 글만 확인할 수 있는 피드
router.get('/posts/:userId', async (req, res, next) => {
  const { userId } = req.params;

  try {
    const myPost = await prisma.posts.findUnique({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: prisma.SortOrder.desc }, // 최신 게시글이 먼저 표시됩니다.
      select: {
        postId: true,
        title: true,
        content: true,
        imageUrl: true,
        user: {
          select: { name: true },
        },
        createdAt: true,
        category: category,
      },
    });
    return res.status(200).json({ data: myPost });
  } catch (error) {
    next(error);
  }
});
