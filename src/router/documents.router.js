import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();







// 게시물 수정 API
router.put(
    '/Posts/:postId',
    authMiddleware,
    loginMiddleware,
    async (req, res, next) => {
      try {
        const { postId } = req.params;
        const { userId } = req.user;
        const { title, content} = req.body;
  
        const posts = await prisma.posts.findFirst({
          where: { postId: +postId },
        });
        if (!title)
          return res
            .status(404)
            .json({ message: '게시물 조회에 실패하였습니다.' });
  
        await prisma.posts.update({
          data: {
            title,
            content,
            createdAt,
            updatedAt
          },
          where: { postId: +postId, userId: +userId },
        });
  
        return res.json({ message: '게시물이 수정됨' });
      } catch (error) {
        if (error.name === 'PrismaClientKnownRequestError')
          return res.status(403).json({ message: '권한이 없습니다' });
      }
    }
  );
  
  // 게시물 삭제 API (사용자 및 관리자 권한)
router.delete(
  '/posts',
  authMiddleware,
  loginMiddleware,
  async (req, res, next) => {
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
  }
);
  export default router;