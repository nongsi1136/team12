import express from 'express';
import { prisma } from '../utils/prisma/index.js';

// 라우터 생성
// const router = express.Router();

export const postRegisterView = async (req, res) => {
  const { ip } = req.ip;
  const { postId } = req.cookies;

  // res.cookie(postId, ip, { maxAge: 1000 * 60 });

  // if (!post) {
  //   res.status(400).json({
  //     success: false,
  //     message: 'post가 존재하지 않습니다.',
  //   });
  // }

  try {
    if (!postId) {
      const post = await prisma.posts.findFirst({
        where: {
          postId: +req.params.postId,
        },
        select: {
          views: true,
        },
      });
      console.log(post);
      post.views += 1;

      await prisma.posts.update({
        where: {
          postId: +req.params.postId,
        },
        data: {
          views: post.views,
        },
      });

      return res.status(200).json({ post });
    } else {
      const post = await prisma.posts.findFirst({
        where: {
          postId: +postId,
        },
        select: {
          views: true,
        },
      });
      return res.status(200).json({ post });
    }
  } catch (error) {
    console.log(error.stack);
    return res.status(400).json({ message: error.message });
  }
};

// export default router;
