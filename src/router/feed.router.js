import express from 'express';
import {prisma} from '@prisma/client';

const router = express.Router(); 
// trend 피드 페이지
router.get('/feeds/trend', async(req, res)=>{
  const posts = await prisma.posts.findMany({
    select: {
      postId: true,
      thumbnailUrl: true,
      title: true,
      user: {
        select: {
          name: true,
        }
      },
      views: true,
      content: true,
      createdAt: true,
      status: true,
    },
    orderBy: {
      views: 'desc'
    }
  })
  return res.status(200).json({data: posts});
})

// 상태-홍보 피드 페이지
router.get('/feeds/event', async(req, res)=>{
  const posts = await prisma.posts.findMany({
    where: {
      status: 'event',
    },
    select: {
      postId: true,
      thumbnailUrl: true,
      title: true,
      user: {
        select: {
          name: true,
        }
      },
      views: true,
      content: true,
      createdAt: true,
      status: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  })
  return res.status(200).json({data: posts});
})

// 상태-홍보 피드 페이지
router.get('/feeds/chat', async(req, res)=>{
  const posts = await prisma.posts.findMany({
    where: {
      status: 'chat'
    },
    select: {
      postId: true,
      thumbnailUrl: true,
      title: true,
      user: {
        select: {
          name: true,
        }
      },
      views: true,
      content: true,
      createdAt: true,
      status: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  })
  return res.status(200).json({data: posts});
})