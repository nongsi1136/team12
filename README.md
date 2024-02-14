프로젝트 README
안녕하세요 팀12조 입니다. 저희는 fithub 라는 PT 에 대한 다양한 정보를 공유하고 피트니스 운영자들이 관심 고객 대상으로 홍보할 수 있는 플랫폼을 만들고자 하였습니다.

프로젝트 소개 
이 프로젝트는 Express.js를 사용하여 구축된 웹 어플리케이션입니다. 
사용자는 회원가입을 통해 계정을 생성하고, 로그인하여 게시물을 작성하거나 댓글을 달 수 있습니다. 또한, 특정 카테고리의 피드를 조회하거나 사용자의 프로필을 관리할 수 있습니다.

주요 기능
✅ 사용자 인증 및 회원가입
- 사용자는 이메일과 비밀번호를 이용하여 회원가입을 할 수 있습니다.
- 회원가입 후 인증된 사용자는 로그인할 수 있습니다.

✅ 게시물 관리
- 사용자는 로그인한 후 게시물을 작성할 수 있습니다.
- 게시물은 다양한 카테고리로 분류됩니다.

✅ 댓글 기능
- 사용자는 게시물에 댓글을 작성할 수 있습니다.
- 작성된 댓글은 게시물에 표시됩니다.

✅ 피드 조회
- 사용자는 다양한 카테고리의 피드를 조회할 수 있습니다.
- 특정 카테고리의 인기 있는 게시물을 확인할 수 있습니다.

✅ 사용자 프로필 관리
: 사용자는 자신의 프로필을 수정하거나 삭제할 수 있습니다.

기술 스택
- Express.js: 웹 어플리케이션 백엔드 구축에 사용됩니다.
- Prisma: 데이터베이스 ORM으로 사용되며, PostgreSQL과 연동하여 데이터를 관리합니다.
- bcrypt: 사용자 비밀번호 해싱에 사용됩니다.
- jsonwebtoken: 사용자 인증에 사용됩니다.
- winston: 로깅을 위한 라이브러리로 사용됩니다.

프로젝트 구조
- src/routes: Express 라우터 및 컨트롤러가 위치합니다.
- src/utils/prisma: Prisma ORM을 위한 설정 파일과 모델이 위치합니다.
- src/middlewares: Express 미들웨어가 위치합니다.
