import express from 'express';
import {prisma} from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 댓글 작성 
router.post('/posts/:postId/comments', authMiddleware, async(req, res, next)=>{
  const {postId} = req.params;
  const {content} = req.body; 
  const {userId} = req.user; 

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId
    }});
  
    if (!post) return res.status(404).json({message: '게시글이 존재하지 않습니다.'})

  const comment = await prisma.comments.create({
    data: {
      postId,
      userId,
      content,
      createdAt,
      }
    });

  return res.status(201).json({data: comment});
});

//댓글 목록 보기
router.get('/posts/:postId/comments', async (req, res, next) => {
  const {postId} = req.params; 

  const comments = await prisma.comments.findMany({
    where: {postId: +postId}, 
    orderBy: {createdAt: 'desc'}
  });

  return res.status(200).json({data: comments});
});


// 댓글 수정
router.get('/posts/:postId/comments/:commentId', async (req, res, next) => {
  const {postId, commentId} = req.params;
  const {content} = req.body; 

  const comment = await prisma.comments.findMany({
    where: {
      commentId: +commentId
    }
  });

  await prisma.comments.update({
    where: {
      commentId: +commentId, 
    }, 
    data: {
      postId,
      content,
    }
  })

  return res.status(200).json({data: comment});
});


// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', async(req, res)=>{
  const {commentId} = req.params;

  const comment = await prisma.comments.findFirst({
    where: {
      commentId: +commentId,
    }
  });

  await prisma.comments.delete({
    where: {
      commentId: comment.commentId,
    }, 
  })

  return res.status(201).json({message: "댓글을 삭제하였습니다."});

})

export default router;