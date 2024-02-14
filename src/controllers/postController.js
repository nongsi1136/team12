import { prisma } from '../utils/prisma/index.js';

export const postRegisterView = async (req, res) => {
  const {ip} = req;
  const {postId} = req.params
  
  console.log(req.cookies[postId]);
  try {
    if (!req.cookies[postId]) {
      const post = await prisma.posts.findFirst({
        where: {
          postId: +req.params.postId,
        },
        select: {
          views: true,
        },
      });
      
      post.views += 1;

      await prisma.posts.update({
        where: {
          postId: +req.params.postId,
        },
        data: {
          views: post.views,
        },
      });

      res.cookie(postId, ip, { maxAge: 1000 * 60 * 60});
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
