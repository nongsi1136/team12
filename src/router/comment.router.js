import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import joi from 'joi';

const schema = joi.object({
  content: joi.string().min(1).max(300).required(),
});

const router = express.Router();

// 댓글 작성
router.post(
  '/posts/:postId/comments',
  authMiddleware,
  async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.user;
    const { content } = req.body;

    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: '포스트가 존재하지 않습니다.' });
    }

    if (!content) {
      return res
        .status(404)
        .json({ success: false, message: '댓글의 내용이 비어있습니다.' });
    }

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: '알 수 없는 사용자입니다. 로그인을 진행해주세요.',
      });
    }

    const post = await prisma.posts.findFirst({
      where: {
        postId: +postId,
      },
    });

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: '게시물이 존재하지 않습니다.' });

    const comment = await prisma.comments.create({
      data: {
        postId: parseInt(postId),
        userId,
        content,
      },
    });

    return res.status(201).json({ data: comment });
  }
);

//댓글 목록 보기
router.get('/posts/:postId/comments', async (req, res, next) => {
  const { postId } = req.params;

  if (!postId) {
    return res
      .status(404)
      .json({ success: false, message: '게시물이 존재하지 않습니다.' });
  }

  const comments = await prisma.comments.findMany({
    where: { postId: +postId },
    select: {
      commentId: true,
      userId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.status(200).json({ data: comments });
});

// 댓글 수정
router.patch(
  '/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { postId, commentId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: '게시물 조회에 실패하였습니다.' });
    }

    if (!commentId) {
      return res
        .status(400)
        .json({ success: false, message: '수정할 댓글을 찾을 수 없습니다.' });
    }

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: '댓글의 내용이 비어있습니다.' });
    }

    const comment = await prisma.comments.findUnique({
      where: {
        commentId: +commentId,
      },
      select: {
        userId: true,
        content: true,
      },
    });

    if (user.userId !== comment.userId) {
      return res
        .status(400)
        .json({ success: false, message: '댓글을 수정할 권한이 없습니다.' });
    }

    await prisma.comments.update({
      where: {
        commentId: +commentId,
      },
      data: {
        content,
      },
    });

    return res.status(200).json({ data: comment });
  }
);

// 댓글 삭제
router.delete(
  '/posts/:postId/comments/:commentId',
  authMiddleware,

  async (req, res) => {
    const { postId, commentId } = req.params;
    const user = req.user;

    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: '게시물 조회에 실패하였습니다.' });
    }

    if (!commentId) {
      return res
        .status(400)
        .json({ success: false, message: '삭제할 댓글을 찾을 수 없습니다.' });
    }

    const comment = await prisma.comments.findUnique({
      where: {
        commentId: +commentId,
      },
      select: {
        userId: true,
      },
    });

    if (user.userId !== comment.userId) {
      return res
        .status(400)
        .json({ success: false, message: '댓글을 삭제할 권한이 없습니다.' });
    }

    await prisma.comments.delete({
      where: {
        commentId: parseInt(commentId),
      },
    });

    return res
      .status(201)
      .json({ success: true, message: '댓글을 삭제하였습니다.' });
  }
);

export default router;
