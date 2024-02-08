import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
import dotenv from 'dotenv';

dotenv.config();

export default async function (req, res, next) {
  function validateToken(token, secretkey) {
    try {
      return jwt.verify(token, secretkey);
    } catch (err) {
      return null;
    }
  }
  try {
    const { authorization } = req.cookies;
    if (!authorization) {
      const { refresh } = req.cookies;

      if (!refresh) throw new Error('Refresh Token이 존재하지 않습니다.');

      const payload = validateToken(refresh, process.env.REFRESH_SecretKey);
      if (!payload) throw new Error('Refresh Token이 정상적이지 않습니다');

      const userInfo = await prisma.refreshTokens.findMany({
        where: { userId: payload.userId },
      });

      if (userInfo.length === 0) {
        return res.status(404).json({
          message: 'Refresh Token의 정보가 서버에 존재하지 않습니다.',
        });
      }

      const newaccessToken = jwt.sign(
        { userId: payload.userId },
        process.env.ACCESS_SecretKey,
        {
          expiresIn: '12h',
        }
      );
      res.cookie('authorization', `Bearer ${newaccessToken}`);
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      res.clearCookie('authorization');
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    }
    return res.status(500).json({ message: err.message });
  }
}