import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

//사용자 회원가입 API
router.post('/sign-up', async (req, res, next) => {
  const {
    email,
    password,
    name,
    age,
    gender,
    introduce,
    career,
    role,
    confirm,
    position,
    gym,
    awards,
  } = req.body; //★ 필드 추가
  const emailcheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailcheck.test(email)) {
    return res
      .status(400)
      .json({ message: '유효하지 않은 이메일 형식입니다.' });
  }

  const isExistUser = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: '빈칸을 모두 채워주세요' });
  }

  if (isExistUser) {
    return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
  }

  if (password !== confirm) {
    return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Users 테이블에 사용자를 추가합니다.
  const user = await prisma.users.create({
    data: { email, password: hashedPassword, name, role },
  });
  // UserInfos 테이블에 사용자 정보를 추가합니다.a
  const userInfo = await prisma.userInfos.create({
    data: {
      userId: user.userId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
      age,
      gender: gender.toUpperCase(), // 성별을 대문자로 변환합니다.
      introduce,
      career,
      position,
      gym,
      awards,
    }, //★ 필드 추가
  });

  return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});

//로그인

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.users.findFirst({ where: { email } });

  if (!email || !password) {
    return res.status(400).json({ message: '비밀번호와 이메일을 입력하세요' });
  }

  if (!user)
    return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
  // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
  else if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

  // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
  const token = jwt.sign(
    {
      userId: user.userId,
    },
    'custom-secret-key'
  );

  // authotization 쿠키에 Berer 토큰 형식으로 JWT를 저장합니다.
  res.cookie('authorization', `Bearer ${token}`);
  return res.status(200).json({ message: '로그인 성공' });
});

//로그아웃
router.post('/log-out', (req, res) => {
  res.clearCookie('authorization', { path: '/', secure: true });
  return res.status(200).json({ message: '로그아웃 되었습니다.' });
});

export default router;
