export const postRegisterView = async (req, res) => {
  const {ip} = req.ip;
  const {postId} = req.cookies;
  
  if(!post) {
    res.status(400).json({
      success: false,
      message: "post가 존재하지 않습니다." 
    })
  };

  try{
    if(!req.cookies[postId]) {
      res.cookie(postId, ip, {maxAge: '24h'});
    
      const post = await prisma.posts.findFirst({
        where: {
          postId: +postId,
        }, 
        select: {
          views,
        }
      })

      post.views += 1;

      await prisma.posts.update({
        where: {
          postId: +postId,
        },
        data: {
          views: post.views,
        }
      });

      return res.status(200).json({post});
    } else {
      const post = await prisma.posts.findFirst({
        where: {
          postId: +postId,
        }, 
        select: {
          views: true,
        }
      });
      return res.status(200).json({post});
    }
  } catch (error) {
    return res.status(400).json({message: "error가 발생했습니다."})
  }
}

// 라우터 생성
const router = express.Router();
// 라우팅
router.get('/posts/:postId', postRegisterView);
// 라우터를 express application 에 등록
app.use('/api', router)