// src/app.js
// 프로필 서버
import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './router/users.router.js';
import ProfileRouter from './router/profile.router.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';

const app = express();
const PORT = 3018;

app.use(express.json());
app.use(cookieParser());
app.use(errorHandlingMiddleware);

app.use('/api', [UsersRouter, ProfileRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
