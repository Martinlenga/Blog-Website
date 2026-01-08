import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPost } from "../services/api";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    getPost(id).then(data => setPost(data)).catch(() => setPost(null));
  }, [id]);

  if (!post) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;

  return (
    <div className="container">
      <h1 className="post-detail-title">{post.title}</h1>
      <small className="post-detail-meta">
        By {post.author} · {new Date(post.created_at).toLocaleDateString()}
      </small>
      <p className="post-detail-content">{post.content}</p>
    </div>
  );
};

export default PostDetail;
