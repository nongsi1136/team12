import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// 게시글 작성 API
router.post('/posts', authMiddleware, async (req, res, next) => {
  const { title, content, category } = req.body;
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
      },
    });
    return res.status(201).json({ data: post });
  } catch (error) {
    next(error);
  }
});
