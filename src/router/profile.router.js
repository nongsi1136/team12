import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 사용자 프로필 상세조회*/
router.get('/profile/:userId', authMiddleware, async (req, res, next) => {
  try {
    // 사용자ID 추출
    const { userId } = req.params;

    // 사용자ID 존재 여부 검증
    if (!userId) {
      return res.status(400).json({
        message: 'userId를 포함하여 요청하기 바랍니다.',
      });
    }

    // Prisma 에서 사용자ID 상세정보 추출
    const myProfile = await prisma.users.findFirst({
      where: {
        userId: +userId,
      },
      select: {
        userId: true,
        name: true,
        email: true,
        userInfos: {
          select: {
            age: true,
            gender: true,
            position: true,
            career: true,
            introduce: true,
            awards: true,
            gym: true,
          },
        },
      },
    });
    console.log('myProfile:' + myProfile);

    if (!myProfile) {
      return res.status(400).json({
        message: '존재하지 않는 사용자입니다.',
      });
    }

    // 사용자 상세정보 응답 반환
    return res.status(200).json({ data: myProfile });
  } catch (error) {
    //오류 발생 시, 처리
    next(error);
  }
});

/** 사용자 프로필 수정*/
router.patch(
  '/profile/:userId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const reqUserId = req.user.userId;
      const reqRole = req.user.role;
      const {
        name,
        age,
        gender,
        position,
        career,
        gym,
        awards,
        introduce,
        password,
        confirm,
        role,
      } = req.body;

      //요청파라미터 포함 유무 검증
      if (!userId) {
        return res.status(400).json({
          message: 'userId를 포함하여 요청하기 바랍니다.',
        });
      }

      const user = await prisma.users.findFirst({
        where: {
          userId: +userId,
        },
      });

      //사용자 존재 여부 검증
      if (!user) {
        return res.status(400).json({
          message: '존재하지 않는 사용자입니다.',
        });
      }

      //사용자 정보 수정 권한 여부 검증
      if (user.userId !== reqUserId && reqRole !== 'admin') {
        return res.status(403).json({
          message: '사용자정보 수정 권한이 없는 요청입니다.',
        });
      }

      // 사용자정보 필수 요청데이터 포함 여부 검증
      if (!name) {
        return res.status(400).json({
          message: '이름은 필수값입니다.',
        });
      }
      if (!role) {
        return res.status(400).json({
          message: '역할은 필수값입니다.',
        });
      }

      // 사용자 정보 수정
      //1. Users 테이블의 사용자정보 수정(일반)
      await prisma.users.update({
        where: {
          userId: +userId,
        },
        data: {
          name,
          role,
        },
      });

      //2. Users 테이블의 사용자정보 수정(비밀번호)
      if (password) {
        //입력한 비밀번호와 비밀번호 확인이 일치하는지 검증
        if (password !== confirm) {
          return res
            .status(401)
            .json({ message: '입력한 비밀번호가 일치하지 않습니다.' });
        }
        //입력한 비밀번호와 DB내 저장된 비밀번호 불일치 시, 비밀번호 업데이트
        if (!(await bcrypt.compare(password, user.password))) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          await prisma.users.update({
            where: {
              userId: +userId,
            },
            data: {
              password: hashedPassword,
            },
          });
        }
      }

      // //3. UserInfos 테이블의 사용자정보 수정
      // if (gender) {
      //   gender = gender.toUpperCase();
      // }

      await prisma.userInfos.update({
        where: {
          userId: +userId,
        },
        data: {
          age,
          gender: gender.toUpperCase(), // 성별을 대문자로 변환합니다.
          introduce,
          career,
          position,
          gym,
          awards,
        },
      });

      return res.status(201).json({
        message: '사용자 정보가 정상적으로 수정되었습니다.',
      });
    } catch (error) {
      return next(error);
    }
  }
);

/** 사용자 프로필 삭제*/
router.delete(
  '/profile/:userId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const reqUserId = req.user.userId;
      const reqRole = req.user.role;

      //요청파라미터 포함 유무 검증
      if (!userId) {
        return res.status(400).json({
          message: 'userId를 포함하여 요청하기 바랍니다.',
        });
      }

      const user = await prisma.users.findFirst({
        where: {
          userId: +userId,
        },
      });

      console.log('user:' + user);
      //사용자 존재 여부 검증
      if (!user) {
        return res.status(400).json({
          message: '존재하지 않는 사용자입니다.',
        });
      }

      console.log('user.userId:' + user.userId);
      //사용자 정보 삭제 권한 여부 검증
      if (user.userId !== reqUserId && reqRole !== 'admin') {
        return res.status(403).json({
          message: '사용자정보 삭제 권한이 없는 요청입니다.',
        });
      }

      //사용자 정보 삭제 수행
      await prisma.users.delete({
        where: {
          userId: +userId,
        },
      });
      return res.status(201).json({ message: '사용자정보가 삭제 되었습니다' });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
 