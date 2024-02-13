import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './src/router/users.router.js';
import DocumentsRouter from './src/router/documents.router.js';
<<<<<<< HEAD
=======
import ProfileRouter from './src/router/profile.router.js';
>>>>>>> c6a810cf702f2050c6a0fc7cd525eb68378a7fd6
import errorHandlingMiddleware from './src/middlewares/error-handling.middleware.js';
import logMiddleware from './src/middlewares/log.middleware.js';

const app = express();
const PORT = 3336;

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use('/api', [UsersRouter, DocumentsRouter, ProfileRouter]);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
