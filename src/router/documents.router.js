import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

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

    let allowedCategories = ['CHIT_CHAT']; // user와 admin이 모두 작성 가능한 카테고리

    // admin인 경우 PROMOTION 카테고리도 작성 가능
    if (role === 'admin') {
      allowedCategories.push('PROMOTION');
    }

    // 요청된 카테고리가 허용된 카테고리 목록에 있는지 확인
    if (!allowedCategories.includes(category)) {
      return res
        .status(403)
        .json({ message: '해당 카테고리에 작성할 권한이 없습니다.' });
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

// 2. 최신 게시글 조회 API
router.get('/posts/latest', async (req, res, next) => {
  try {
    // 서버에서 최신 게시글을 가져오기
    const latestPosts = await prisma.posts.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // 게시글 조회수 증가
    for (const post of latestPosts) {
      await prisma.posts.update({
        where: { postId: post.userId },
        data: { views: post.views + 1 },
      });
    }

    // 최신 게시글을 클라이언트에게 HTTP 응답으로 전달
    return res.status(200).json({ data: latestPosts });
  } catch (error) {
    // 오류가 발생한 경우 적절한 오류 처리를 수행.
    next(error);
  }
});

// 3. 내 게시글 조회 API >> 이제 이것을 가지고 내 글만 확인할 수 있는 피드를 만들면 되지 않을까요...?ㅎ
router.get('/posts/mypost/:userId', async (req, res, next) => {
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

//4. 게시물 수정 API
router.put('/Posts/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;
    const { title, content } = req.body;

    const posts = await prisma.posts.findFirst({
      where: { postId: +postId },
    });
    if (!title)
      return res.status(404).json({ message: '게시물 조회에 실패하였습니다.' });

    await prisma.posts.update({
      data: {
        title,
        content,
        createdAt,
        updatedAt,
      },
      where: { postId: +postId, userId: +userId },
    });

    return res.json({ message: '게시물이 수정됨' });
  } catch (error) {
    if (error.name === 'PrismaClientKnownRequestError')
      return res.status(403).json({ message: '권한이 없습니다' });
  }
});

// 5. 게시물 삭제 API (사용자 및 관리자 권한)
router.delete('/posts', authMiddleware, async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { postId } = req.body;

    const post = await prisma.posts.findFirst({
      where: { postId: postId },
    });

    // 게시물이 존재하지 않는 경우
    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    // 사용자가 관리자인 경우 또는 게시물 작성자인 경우에만 삭제 허용
    if (role !== 'admin' && post.userId !== userId) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    await prisma.posts.delete({
      where: { postId: postId, userId: +userId },
    });

    return res.json({ message: '게시물이 삭제됨' });
  } catch (error) {
    if (error.name === 'PrismaClientKnownRequestError') {
      return res.status(403).json({ message: '권한이 없습니다' });
    } else {
      return next(error);
    }
  }
});
export default router;
