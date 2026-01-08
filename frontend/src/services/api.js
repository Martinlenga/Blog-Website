// src/services/api.js
const API_URL = "http://127.0.0.1:8000/api";

export const getPosts = async () => {
  const res = await fetch("http://127.0.0.1:8000/api/posts/");
  if (!res.ok) {
    throw new Error("API error");
  }
  return res.json();
};


export const getPost = async (id) => {
  const res = await fetch(`${API_URL}/posts/${id}/`);
  if (!res.ok) {
    throw new Error("API error");
  }
  return res.json();
};
