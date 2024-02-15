# 프로젝트 README

안녕하세요 팀12조 입니다. 저희는 fithub 라는 PT 에 대한 다양한 정보를 공유하고 피트니스 운영자들이 관심 고객 대상으로 홍보할 수 있는 플랫폼을 만들고자 하였습니다.

## 프로젝트 소개 
이 프로젝트는 Express.js를 사용하여 구축된 웹 어플리케이션입니다. 
사용자는 회원가입을 통해 계정을 생성하고, 로그인하여 게시물을 작성하거나 댓글을 달 수 있습니다. 또한, 특정 카테고리의 피드를 조회하거나 사용자의 프로필을 관리할 수 있습니다.

## 발표 자료

[fithub 개발 프로젝트 발표 자료](https://www.notion.so/nongsi/fithub-291635c6c39642ec9d724549e9338710?pvs=4)

[인섬니아 실행 유튜브 영상](https://youtu.be/Tpz5AqhTSjk?si=QGsPD8SqN9G6ROLo)

## 🚀 주요 기능 
<details> 
 <summary> 주요 기능 </summary>
<div markdown="1">

### ✅ 사용자 인증 및 회원가입
- 사용자는 이메일과 비밀번호를 이용하여 회원가입을 할 수 있습니다.
- 회원가입 후 인증된 사용자는 로그인할 수 있습니다.
- role 을 통해 사용자의 역할을 정의하였습니다.

### ✅ 게시물 관리
- 사용자는 로그인한 후 게시물을 작성할 수 있습니다.
- 게시물은 다양한 카테고리(홍보, 잡담)로 분류됩니다.
- 주어진 role 에 따라 게시글 홍보 카테고리에 작성할 수 있는 권한을 부여하였습니다.
ㄴ admin만 PROMOTION 카테고리에 작성이 가능합니다.
- 게시물을 수정 및 삭제할 수 있습니다.
- 특정 게시물 조회시 쿠키를 활용하여 클라이언트의 IP와 게시물 ID를 저장하고, 클라이언트로부터 전달된 쿠키를 확인하여 중복 조회를 방지하고자 했습니다.

### ✅ 댓글 기능
- 사용자는 게시물에 댓글을 작성할 수 있습니다.
- 작성된 댓글은 게시물에 표시됩니다.

### ✅ 피드 조회 (trend, chat, event, myfeed)
- 사용자는 다양한 카테고리의 피드를 조회할 수 있습니다.
- 트렌드 피드를 제외한 모든 피드는 최신순으로 정렬됩니다.
- 특정 카테고리의 인기 있는 게시물을 확인할 수 있습니다.

### ✅ 사용자 프로필 관리
- 사용자는 자신의 프로필을 수정하거나 삭제할 수 있습니다.
- 사용자 프로필을 수정할 때 비빌번호 재설정도 가능합니다.
- 프로필을 삭제하면 회원 정보가 삭제되어 회원 탈퇴 처리 됩니다.

</div>
</details>


## 🗂 프로젝트 구조
<details> 
 <summary> Back-End (Nodejs) </summary>
<div markdown="2">
 
    📦src
    ┣ 📂controllers
    ┃ ┗ 📜postController.js
    ┣ 📂middlewares
    ┃ ┣ 📜auth.middleware.js            # 사용자 인증 미들웨어
    ┃ ┣ 📜error-handling.middleware.js  # 에러 처리 미들웨어
    ┃ ┗ 📜log.middleware.js             # 로그 처리 미들웨어
    ┣ 📂router
    ┃ ┣ 📜comment.router.js             # 댓글 API
    ┃ ┣ 📜documents.router.js           # 게시글 API
    ┃ ┣ 📜feed.router.js                # feed API
    ┃ ┣ 📜profile.router.js             # 프로필 API
    ┃ ┗ 📜users.router.js               # 회원가입,로그-인/아웃 API
    ┗ 📂utils
    ┃ ┗ 📂prisma
    ┃ ┃ ┗ 📜index.js

 </div>
</details>

## 🛠 설계

<details> 
 <summary> ERD </summary>
<div markdown="3">
 
 [FitHub ERD](https://www.erdcloud.com/d/cXRBC7cAAyf7R4jsi)
 
 </div>
</details>

<details> 
 <summary> API 명세서 </summary>
<div markdown="4">

 [API 명세서 노션](https://www.notion.so/nongsi/2-API-b990897507f544cc85cb014e047806f0?pvs=4)
 
 </div>
</details>

## 👨‍👨‍👧‍👦 팀원 소개

<table>
  <tbody>
    <tr>
      <td align="center"><a href=""><img src="https://github.com/nongsi1136/team12/assets/154482024/d524c960-f171-48a1-8158-4f815b19403a"width="100px;" alt=""/><br /><sub><b>FE 팀장 : 정신홍 </b></sub></a><br /></td>
      <td align="center"><a href=""><img src="https://github.com/nongsi1136/team12/assets/154482024/35771e1d-f933-460f-9abd-d89b07aae6ec" width="100px;" alt=""/><br /><sub><b>FE 팀원 : 김주영 </b></sub></a><br /></td>
      <td align="center"><a href=""><img src="https://github.com/nongsi1136/team12/assets/154482024/456aa118-90c5-4c96-82e7-c9449e5a6dcd" width="100px;" alt=""/><br /><sub><b>FE 팀원 : 황세민 </b></sub></a><br /></td>
     <tr/>
       <td align="center"><a href=""><img src="https://github.com/nongsi1136/team12/assets/154482024/fa8dff64-5322-412b-8ffb-9eb54ff7c864" width="100px;" alt=""/><br /><sub><b>FE 부팀장 : 최인철 </b></sub></a><br /></td>
      <td align="center"><a href=""><img src="https://github.com/nongsi1136/team12/assets/154482024/cf1a2725-3b99-44fe-ac61-91669dfddefa" width="100px;" alt=""/><br /><sub><b>BE 팀원 : 노세웅 </b></sub></a><br /></td>
    </tr>
  </tbody>
</table>


