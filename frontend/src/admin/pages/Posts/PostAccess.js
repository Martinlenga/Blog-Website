import { useEffect, useState } from "react";
import { getCategories, getAdminPostAccess } from "../../services/adminApi";
import TableToolbar from "../../components/TableToolbar";
import Pagination from "../../components/Pagination";

export default function AllPostAccess() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, dateRange]);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        if (res.data && Array.isArray(res.data.categories)) {
          setCategories(res.data.categories);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch post access data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { page, search, category, date_range: dateRange };
        const res = await getAdminPostAccess(params);
        setData(res.data.results || []);
        setPageCount(Math.ceil(res.data.count / 10));
      } catch (err) {
        console.error("Error fetching post access:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, search, category, dateRange]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Post Access</h2>

      <TableToolbar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories} // populated from backend
        dateRange={dateRange}
        setDateRange={setDateRange}
        showPriceFilter={false}
      />

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Post Title</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">User Email</th>
              <th className="px-4 py-2 text-left">Granted At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-sm text-gray-500">
                  Loading post access records…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-sm text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2 text-sm">{item.id}</td>
                  <td className="px-4 py-2 font-medium text-sm">{item.post_title}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.post_category}</td>
                  <td className="px-4 py-2 text-sm">{item.user_email}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(item.granted_at).toLocaleDateString("en-GB")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.granted_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} pageCount={pageCount} />
    </div>
  );
}
