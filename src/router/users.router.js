// src/routes/users.router.js

import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import qs from 'qs';
import axios from 'axios';
import nodemailer from 'nodemailer';
import ejs from 'ejs';



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user :process.env.EMAIL,
    pass :process.env.PD
  },
});

// 임시로 인증번호를 저장할 객체
const emailVerifications = {};

const router = express.Router();


// 이메일 보내기
router.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  // 이메일 형식 검증
  const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailCheck.test(email)) {
    return res.status(400).json({ message: '유효하지 않은 이메일 형식입니다.' });
  }

  // 이메일 중복 검사
  const isExistUser = await prisma.users.findUnique({ where: { email } });
  if (isExistUser) {
    return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
  }

  emailVerifications[email] = verificationCode;

  // 이메일 전송
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: '회원가입 인증번호',
    text: `인증번호는 ${verificationCode}입니다.`
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: '인증번호 전송 실패' });
    } else {
      console.log('Email sent: ' + info.response);
      // 이메일 전송 성공 후에 사용자 생성
      const user = await prisma.users.create({
        data: {
          verificationCode,
          email,
    
        }
      });
      return res.status(200).json({ message: '인증번호가 전송되었습니다.' });
    }
  });
});


// 회원가입
router.post("/sign-up", async (req, res) => {
  const {email,password,name,age,gender,introduce,career,role,confirm,verificationCode,} = req.body;
  // 필수 필드 및 비밀번호 확인 (이전 코드 참조)
  const userWithCode = await prisma.users.findUnique({ where: { email } });
  if (!userWithCode ||userWithCode.verificationCode !== parseInt(verificationCode)) {
    return res.status(400).json({ message: "인증번호가 일치하지 않습니다." });
  }
  if (password !== confirm) {
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await prisma.users.update({
    where: { email: email },
    data: { password: hashedPassword, name, role },
  });
  // UserInfos 테이블에 사용자 정보를 추가합니다.a
  const userInfo = await prisma.userInfos.create({
    data: {
      userId: user.userId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
      age,
      gender: gender.toUpperCase(), // 성별을 대문자로 변환합니다.
      introduce,
      career,
    },
  });
  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
    const { email, password } = req.body;
    const user = await prisma.users.findFirst({ where: { email } });

    if (!email || !password ) {
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
      'custom-secret-key',
     
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

//카카오

//인가코드 받기
router.get("/oauth", (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
  res.redirect(kakaoAuthUrl);
});


//토큰받기

router.get("/oauth/callback", async (req, res) => {
  const AUTHORIZE_CODE = req.query.code;
  
  const tokenData = qs.stringify({
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_ID,
    redirect_uri: process.env.KAKAO_REDIRECT_URI,
    code: AUTHORIZE_CODE,
  });

  const tokenConfig = {
    method: 'post',
    url: 'https://kauth.kakao.com/oauth/token',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    data: tokenData
  };

  try {
    const tokenResponse = await axios(tokenConfig);
    const accessToken = tokenResponse.data.access_token;

    const userInfoResponse = await axios({
      method: 'get',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    const email = userInfoResponse.data.kakao_account.email;
    const name = userInfoResponse.data.properties.nickname;

    if (!email) {
      return res.status(400).send('이메일 정보가 필요합니다.');
    }

    // 데이터베이스에 사용자 정보 저장
    const user = await prisma.users.upsert({
      where: { email },
      update: { name }, // 이미 존재하는 사용자 업데이트
      create: { email, name }, // 새 사용자 생성
    });

    res.json({
      message: '로그인이 완료되었습니다',
      userDetails: {
        userId: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).send('사용자 정보를 가져오는데 실패했습니다.');
  }
});


    




// 로그아웃

router.get("/oauth/logout", async (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.KAKAO_ID}&logout_redirect_uri=${process.env.KAKAO_LOGOUT_URI}`;
  res.redirect(kakaoAuthUrl);
});

router.get("/oauth/logout/callback", (req, res) => {
  return res.status(200).json({ message: "로그아웃 성공" });
});

export default router;




