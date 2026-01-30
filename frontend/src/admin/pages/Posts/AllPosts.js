import { useEffect, useState } from "react";
import { Trash2, Edit, Star } from "lucide-react";
import { getAdminPosts, deleteAdminPost, bulkFeaturePosts } from "../../services/adminApi";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Skeleton from "../../components/Skeleton";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import PostModal from "../../components/PostModal";
import TableToolbar from "../../components/TableToolbar";

import placeholder from "../../../assets/article-placeholder.jpg";


export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search + Filters
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [categories, setCategories] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  // Modals & Confirms
  const [confirm, setConfirm] = useState({ open: false, slugs: [] });
  const [modal, setModal] = useState({ open: false, post: null });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getAdminPosts({
        page,
        search,
        category,
        minPrice,
        maxPrice,
        dateRange,
      });

      // Use backend-provided banner_image and price exactly as returned
      setPosts(res.data.results);

      setPageCount(Math.ceil(res.data.count / 10));

      // Extract unique categories dynamically
      const uniqueCategories = [
        ...new Set(res.data.results.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchPosts();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search, dateRange, category, minPrice, maxPrice, page]);

  const handleDelete = async (slug) => {
    try {
      await deleteAdminPost(slug);
      fetchPosts();
      setConfirm({ open: false, slugs: [] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeature = async (slug) => {
    try {
      await bulkFeaturePosts([slug]);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">All Posts</h2>

      {/* Toolbar */}
      <TableToolbar
        search={search}
        setSearch={setSearch}
        dateRange={dateRange}
        setDateRange={setDateRange}
        category={category}
        setCategory={setCategory}
        categories={categories}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      >
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={() => setModal({ open: true, post: null })}
        >
          + New Post
        </button>
      </TableToolbar>

      {/* Posts Table */}
      {loading ? (
        <Skeleton rows={10} />
      ) : posts.length === 0 ? (
        <EmptyState
            title="No Post found"
            description="Posts will appear if available."
        />
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Banner</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Featured</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Price (Kshs.)</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => {
                const imageUrl = post.banner_image
                  ? post.banner_image.startsWith("http")
                    ? post.banner_image
                    : `http://127.0.0.1:8000${post.banner_image}`
                  : placeholder;

                return (
                  <tr key={post.slug} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{post.title}</td>
                    <td className="px-4 py-2">
                      <img
                        src={imageUrl}
                        alt={post.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-2">{post.author}</td>
                    <td className="px-4 py-2">{post.category}</td>
                    <td className="px-4 py-2">
                      <StatusBadge featured={post.featured} />
                    </td>
                    <td className="px-4 py-2">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {post.price ? Number(post.price).toFixed(2) : "-"}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-800"
                        onClick={() => setModal({ open: true, post })}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-amber-600 hover:text-amber-800"
                        onClick={() => handleFeature(post.slug)}
                      >
                        <Star size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => setConfirm({ open: true, slugs: [post.slug] })}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination page={page} setPage={setPage} pageCount={pageCount} />
        </div>
      )}

      {confirm.open && (
        <ConfirmDialog
          title="Delete Post"
          message="Are you sure you want to delete this post?"
          onConfirm={() => handleDelete(confirm.slugs[0])}
          onCancel={() => setConfirm({ open: false, slugs: [] })}
        />
      )}

      {modal.open && (
        <PostModal
          open={modal.open}
          post={modal.post}
          onClose={() => setModal({ open: false, post: null })}
          refresh={fetchPosts}
        />
      )}
    </div>
  );
}
