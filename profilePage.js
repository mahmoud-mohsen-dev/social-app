setupUI();
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");
getUserPosts(userId);
