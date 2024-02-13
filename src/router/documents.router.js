import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

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

    // 최신 게시글을 클라이언트에게 HTTP 응답으로 전달
    return res.status(200).json({ data: latestPosts });
  } catch (error) {
    // 오류가 발생한 경우 적절한 오류 처리를 수행.
    next(error);
  }
});

// 3. 게시물 조회 API
router.get('/posts/:postId', async (req, res, next) => {
  const { postId } = req.params;

  try {
    // 게시물 조회
    const post = await prisma.posts.findUnique({
      where: { postId: parseInt(postId) },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: '해당 게시물을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    await prisma.posts.update({
      where: { postId: parseInt(postId) },
      data: { views: post.views + 1 },
    });

    // 클라이언트에 응답 전달
    return res.status(200).json({ data: post });
  } catch (error) {
    next(error);
  }
});

//4. 게시물 수정 API
router.put(
  '/posts/postedit/:postId',
  authMiddleware,
  async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.user;
    const { title, content, imageUrl } = req.body;

    try {
      const post = await prisma.posts.findFirst({
        where: { postId: +postId },
      });
      if (!post)
        return res
          .status(404)
          .json({ message: '게시물 조회에 실패하였습니다.' });

      // 본인이 작성한 게시글에 대해서만 수정이 가능하게
      if (post.userId !== parseInt(userId)) {
        return res
          .status(401)
          .json({ message: '해당 이력서를 수정할 권한이 없습니다' });
      }

      // 게시물 수정 시 updatedAt 값을 설정하기 위해 현재 시간을 사용
      const updatedAt = new Date();

      const updatedPost = await prisma.posts.update({
        where: { postId: parseInt(postId) },
        data: {
          title,
          content,
          imageUrl,
          updatedAt,
        },
        where: { postId: +postId, userId: +userId },
      });

      return res.json({
        data: updatedPost,
        message: '게시글이 수정되었습니다.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// 5. 게시물 삭제 API (사용자 및 관리자 권한)
router.delete('/posts/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { postId } = req.body;

    const post = await prisma.posts.findUnique({
      where: { postId: parseInt(postId) },
    });

    // 게시물이 존재하지 않는 경우
    if (!post) {
      return res
        .status(404)
        .json({ message: '해당 게시물을 찾을 수 없습니다.' });
    }

    // 사용자가 관리자인 경우 또는 게시물 작성자인 경우에만 삭제 허용
    if (role !== 'admin' && post.userId !== userId) {
      return res
        .status(403)
        .json({ message: '해당 게시글을 삭제할 권한이 없습니다.' });
    }

    await prisma.posts.delete({
      where: { postId: parseInt(postId) },
    });

    return res.json({ message: '게시물이 삭제되었습니다.' });
  } catch (error) {
    if (error.name === 'PrismaClientKnownRequestError') {
      return res.status(403).json({ message: '권한이 없습니다' });
    } else {
      return next(error);
    }
  }
});
export default router;
