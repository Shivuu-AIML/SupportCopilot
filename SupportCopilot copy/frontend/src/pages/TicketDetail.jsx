import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { ArrowLeft, Sparkles, Send, BookOpen, Pencil } from "lucide-react";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/tickets/${id}`);
        setTicket(res.data.ticket);
        setDraft(res.data.draft);
        if (res.data.draft) {
          setEditedText(res.data.draft.editedText || res.data.draft.generatedText);
        }
      } catch {
        toast.error("Failed to load ticket");
        navigate("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleGenerateDraft = async () => {
    setGenerating(true);
    try {
      const res = await api.post(`/tickets/${id}/draft`);
      setDraft(res.data.draft);
      setEditedText(res.data.draft.editedText || res.data.draft.generatedText);
      toast.success("Draft generated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await api.patch(`/drafts/${draft._id}`, { editedText });
      toast.success("Draft saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleManualDraft = async () => {
    if (!manualText.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(`/tickets/${id}/manual-draft`, { text: manualText });
      setDraft(res.data.draft);
      setEditedText(manualText);
      setManualMode(false);
      toast.success("Reply saved");
    } catch {
      toast.error("Failed to save reply");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await api.patch(`/drafts/${draft._id}`, { editedText, status: "sent" });
      toast.success("Reply sent — ticket resolved");
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.ticket);
      setDraft(res.data.draft);
    } catch {
      toast.error("Failed to send");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> Back to tickets
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {ticket.customerName} &lt;{ticket.customerEmail}&gt;
            </p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            ticket.status === "open" ? "bg-yellow-100 text-yellow-800" :
            ticket.status === "drafted" ? "bg-blue-100 text-blue-800" :
            "bg-green-100 text-green-800"
          }`}>
            {ticket.status}
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
          {ticket.message}
        </div>
      </div>

      {ticket.status !== "resolved" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              Reply
            </h2>
            {!draft && !manualMode && (
              <div className="flex gap-2">
                <button onClick={() => setManualMode(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  <Pencil size={16} /> Write Reply
                </button>
                <button onClick={handleGenerateDraft} disabled={generating}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
                  <Sparkles size={16} />
                  {generating ? "Generating..." : "Draft Reply (AI)"}
                </button>
              </div>
            )}
          </div>

          {manualMode && !draft && (
            <div className="space-y-4">
              <textarea rows={8} placeholder="Type your reply here..." value={manualText} onChange={(e) => setManualText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              <div className="flex gap-3">
                <button onClick={handleManualDraft} disabled={saving || !manualText.trim()}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm">
                  <Send size={16} /> {saving ? "Saving..." : "Save & Continue"}
                </button>
                <button onClick={() => { setManualMode(false); setManualText(""); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {draft ? (
            <div className="space-y-4">
              <textarea rows={8} value={editedText} onChange={(e) => setEditedText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />

              {draft.sourceArticles?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <BookOpen size={14} /> Source articles ({draft.sourceArticles.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {draft.sourceArticles.map((a) => (
                      <span key={a._id} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                        {a.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {draft.status === "draft" && (
                  <>
                    <button onClick={handleSend} disabled={saving}
                      className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm">
                      <Send size={16} /> {saving ? "Sending..." : "Mark as Sent"}
                    </button>
                    <button onClick={handleSaveDraft} disabled={saving}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Save Draft
                    </button>
                  </>
                )}
                {draft.status === "sent" && (
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <Send size={16} /> Sent
                  </span>
                )}
              </div>
            </div>
          ) : !manualMode && (
            <p className="text-sm text-gray-400">Write a reply manually or use AI to generate one from your KB articles.</p>
          )}
        </div>
      )}

      {ticket.status === "resolved" && draft && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Sent Reply</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
            {draft.editedText || draft.generatedText}
          </div>
          {draft.sourceArticles?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Source articles</p>
              <div className="flex flex-wrap gap-2">
                {draft.sourceArticles.map((a) => (
                  <span key={a._id} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                    {a.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
