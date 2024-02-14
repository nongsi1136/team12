import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './src/router/users.router.js';
import DocumentsRouter from './src/router/documents.router.js';
import ProfileRouter from './src/router/profile.router.js';
import FeedRouter from './src/router/feed.router.js';
import CommentRouter from './src/router/comment.router.js';
import errorHandlingMiddleware from './src/middlewares/error-handling.middleware.js';
import logMiddleware from './src/middlewares/log.middleware.js';

const app = express();
const PORT = 3336;

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use('/api', [
  UsersRouter,
  DocumentsRouter,
  ProfileRouter,
  FeedRouter,
  CommentRouter,
]);

app.use(errorHandlingMiddleware);

app.listen(PORT, '0.0.0.0', () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
