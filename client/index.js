async function createPost(title, content, category, imageUrl) {
  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 인증 토큰을 포함하여 요청
      },
      body: JSON.stringify({ title, content, category, imageUrl }),
    });

    if (response.ok) {
      // 게시글 작성 성공 시 서버에서 최신 게시물을 조회하는 요청을 보냄
      fetchLatestPosts();
    } else {
      console.error("게시글 작성 실패:", response.statusText);
    }
  } catch (error) {
    console.error("게시글 작성 오류:", error);
  }
}

async function fetchLatestPosts() {
  try {
    const response = await fetch("/api/posts/latest");
    if (response.ok) {
      const data = await response.json();

      // 최신 게시물 데이터를 화면에 표시하는 함수 호출
      renderLatestPosts(data);
    } else {
      console.error("최신 게시물 조회 실패:", response.statusText);
    }
  } catch (error) {
    console.error("최신 게시물 조회 오류:", error);
  }
}
