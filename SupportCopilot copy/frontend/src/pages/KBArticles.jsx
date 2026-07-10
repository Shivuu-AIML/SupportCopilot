import { useState, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Plus, Search, BookOpen, Edit3 } from "lucide-react";

export default function KBArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", tags: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchArticles = async () => {
    try {
      const params = search ? { search } : {};
      const res = await api.get("/kb", { params });
      setArticles(res.data.articles);
    } catch {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchArticles();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      if (editing) {
        await api.patch(`/kb/${editing._id}`, payload);
        toast.success("Article updated");
      } else {
        await api.post("/kb", payload);
        toast.success("Article created");
      }
      setShowForm(false);
      setEditing(null);
      setForm({ title: "", body: "", tags: "" });
      fetchArticles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (article) => {
    setEditing(article);
    setForm({ title: article.title, body: article.body, tags: article.tags.join(", ") });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this article?")) return;
    try {
      await api.delete(`/kb/${id}`);
      toast.success("Article deleted");
      fetchArticles();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KB Articles</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: "", body: "", tags: "" }); }}
          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> New Article
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">{editing ? "Edit Article" : "New Article"}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
            <textarea required rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {submitting ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={48} className="mx-auto mb-3 opacity-40" />
          <p>{search ? "No matching articles" : "No KB articles yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article._id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white">{article.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.body}</p>
                  {article.tags?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {article.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">by {article.createdBy?.name}</p>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <button onClick={() => handleEdit(article)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(article._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
