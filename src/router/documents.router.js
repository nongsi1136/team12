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
  
  // 게시물 삭제 API
  router.delete(
    '/Posts',
    authMiddleware,
    loginMiddleware,
    async (req, res, next) => {
      try {
        const { userId } = req.user;
        const { postId } = req.body;
  
        const post = await prisma.posts.findFirst({
          where: { postId: postId },
        });
        if (!post)
          return res
            .status(404)
            .json({ message: '게시물 조회에 실패하였습니다.' });
  
        await prisma.posts.delete({
          where: { postId: postId, userId: +userId },
        });
  
        return res.json({ message: '게시물이 삭제됨' });
      } catch (error) {
        if (error.name === 'PrismaClientKnownRequestError')
          return res.status(403).json({ message: '권한이 없습니다' });
      }
    }
  );

  export default router;