export const getPosts = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/posts/"); // your API URL
    if (!response.ok) throw new Error("Failed to fetch posts");
    const data = await response.json();
    return data; // { featured: ..., posts: [...] }
  } catch (error) {
    console.error(error);
    return { featured: null, posts: [] };
  }
};

// NEW: Fetch a single post by slug (preferred for clean URLs)
export const getPostBySlug = async (slug) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/posts/slug/${slug}/`);
    if (!response.ok) throw new Error("Failed to fetch post by slug");
    const data = await response.json();
    return data; // single post object
  } catch (error) {
    console.error(error);
    return null;
  }
};