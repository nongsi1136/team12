import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

async function fetchLatestPosts(userId) {
  try {
    const latestPosts = await prisma.posts.findMany({
      orderBy: { createdAt: 'desc' },
      take: 9,
    });
    return latestPosts;
  } catch (error) {
    throw new Error(`최신 게시글 조회 오류: ${error}`);
  }
}

// 1. 게시글 작성 API
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

    const latestPosts = await fetchLatestPosts(userId); // 클라이언트에서 최신 게시글 조회를 요청하는 함수

    return res.status(201).json({ data: post, latestPosts });
  } catch (error) {
    next(error);
  }
});

// 2. 최신 게시글 조회 API
router.get('/posts/latest', async (req, res, next) => {
  try {
    // 서버에서 최신 게시글을 가져오기
    const latestPosts = await prisma.posts.findMany({
      orderBy: { createdAt: 'desc' },
      take: 9, // 최신 게시글 중 최대 9개만 가져옴, 변경 가능
    });

    // 최신 게시글을 클라이언트에게 HTTP 응답으로 전달
    return res.status(200).json({ data: latestPosts });
  } catch (error) {
    // 오류가 발생한 경우 적절한 오류 처리를 수행.
    next(error);
  }
});

// 3. 내 게시글 조회 API >> 이제 이것을 가지고 내 글만 확인할 수 있는 피드를 만들면 되지 않을까요...?ㅎ
router.get('/posts/:userId', async (req, res, next) => {
  const { userId } = req.params;

  try {
    const myPost = await prisma.posts.findMany({
      where: { userId: parseInt(userId, 10) },
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
        category: true,
      },
    });
    return res.status(200).json({ data: myPost });
  } catch (error) {
    next(error);
  }
});
