import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createAdminPost, updateAdminPost } from "../services/adminApi";
import placeholder from "../../assets/article-placeholder.jpg"; // adjust path to your assets

export default function PostModal({ open, post, onClose, refresh }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(""); // backend default respected
  const [featured, setFeatured] = useState(false);
  const [banner, setBanner] = useState(null); // new file upload
  const [preview, setPreview] = useState(placeholder); // use placeholder by default
  const [metaDescription, setMetaDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when editing a post or creating new
  useEffect(() => {
    setTitle(post?.title || "");
    setExcerpt(post?.excerpt || "");
    setContent(post?.content || "");
    
    // Use backend defaults if creating a new post
    setCategory(post?.category || "General");
    setPrice(
      post?.price !== undefined && post?.price !== null
        ? Number(post.price).toFixed(2)
        : "150.00"
    );

    setFeatured(post?.featured || false);
    setMetaDescription(post?.meta_description || "");
    setBanner(null);

    // Decide preview image: backend URL or placeholder
    const imageUrl = post?.banner_image
      ? post.banner_image.startsWith("http")
        ? post.banner_image
        : `http://127.0.0.1:8000${post.banner_image}`
      : placeholder;
    setPreview(imageUrl);

    setErrors({});
  }, [post]);


  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setPreview(URL.createObjectURL(file)); // immediate preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = new FormData();
      data.append("title", title);
      data.append("excerpt", excerpt);
      data.append("content", content);
      data.append("category", category);
      if (price !== "") data.append("price", price.toString());
      data.append("featured", featured ? "true" : "false");
      data.append("meta_description", metaDescription);
      if (banner) data.append("banner_image", banner);

      if (post) {
        await updateAdminPost(post.slug, data);
      } else {
        await createAdminPost(data);
      }

      refresh();
      onClose();
    } catch (err) {
      console.error("Backend error:", err.response || err);
      if (err.response && err.response.data) setErrors(err.response.data);
      else alert("Unexpected error: Could not save post.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X />
        </button>
        <h2 className="text-xl font-bold mb-4">{post ? "Edit Post" : "New Post"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
            {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block font-medium mb-1">Excerpt</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary"
              className="w-full border rounded px-3 py-2"
            />
            {errors.excerpt && <p className="text-red-600 text-sm">{errors.excerpt}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="block font-medium mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full border rounded px-3 py-2"
            />
            {errors.content && <p className="text-red-600 text-sm">{errors.content}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Type category"
              className="w-full border rounded px-3 py-2"
            />
            {errors.category && <p className="text-red-600 text-sm">{errors.category}</p>}
          </div>

          {/* Meta Description */}
          <div>
            <label className="block font-medium mb-1">Meta Description</label>
            <input
              type="text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Meta description"
              className="w-full border rounded px-3 py-2"
            />
            {errors.meta_description && <p className="text-red-600 text-sm">{errors.meta_description}</p>}
          </div>

          {/* Price + Featured */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Price (Kshs.)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Leave empty to use default"
                className="w-full border rounded px-3 py-2"
              />
              {errors.price && <p className="text-red-600 text-sm">{errors.price}</p>}
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <span>Featured</span>
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <label className="block font-medium mb-1">Banner Image</label>
            <input type="file" accept="image/*" onChange={handleBannerChange} />
            {preview && (
              <img
                src={preview}
                alt="Banner Preview"
                className="w-32 h-16 object-cover mt-2 rounded"
              />
            )}
            {errors.banner_image && <p className="text-red-600 text-sm">{errors.banner_image}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {post ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
