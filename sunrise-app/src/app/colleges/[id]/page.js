"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  onSnapshot,
  setDoc,
  deleteDoc 
} from "firebase/firestore";
import Link from "next/link";
import { essayPrompts } from "../../../lib/essayPrompts";

export default function CollegeDetailPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Unwrap params using React.use() for Next.js 15+
  const unwrappedParams = use(params);
  const collegeId = unwrappedParams.id;
  
  const [college, setCollege] = useState(null);
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEssayModal, setShowEssayModal] = useState(false);
  const [editingEssay, setEditingEssay] = useState(null);
  const [selectedPrompts, setSelectedPrompts] = useState([]);

  // Load college data
  useEffect(() => {
    if (!user || !collegeId) return;

    const loadCollege = async () => {
      try {
        const collegeRef = doc(db, "users", user.uid, "colleges", collegeId);
        const collegeSnap = await getDoc(collegeRef);
        
        if (collegeSnap.exists()) {
          setCollege({ id: collegeSnap.id, ...collegeSnap.data() });
        } else {
          setError("College not found");
        }
      } catch (err) {
        console.error("Error loading college:", err);
        setError("Failed to load college data");
      } finally {
        setLoading(false);
      }
    };

    loadCollege();
  }, [user, collegeId]);

  // Load essays
  useEffect(() => {
    if (!user || !collegeId) return;

    const essaysRef = collection(db, "users", user.uid, "colleges", collegeId, "essays");
    const unsubscribe = onSnapshot(essaysRef, (snapshot) => {
      const essayData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEssays(essayData);
    });

    return () => unsubscribe();
  }, [user, collegeId]);

  // Get essay prompts for this college
  const getCollegePrompts = () => {
    if (!college) return [];
    
    const appType = college.appType || college.activityTemplateType || 'other';
    return essayPrompts[appType] || essayPrompts.other;
  };

  const handleSaveEssay = async (essayData) => {
    try {
      const essayId = editingEssay?.id || `essay_${Date.now()}`;
      const essayRef = doc(db, "users", user.uid, "colleges", collegeId, "essays", essayId);
      
      await setDoc(essayRef, {
        ...essayData,
        updatedAt: new Date().toISOString()
      });

      setSuccess("Essay saved successfully!");
      setShowEssayModal(false);
      setEditingEssay(null);
      setSelectedPrompts([]);
    } catch (err) {
      console.error("Error saving essay:", err);
      setError("Failed to save essay");
    }
  };

  const handleDeleteEssay = async (essayId) => {
    if (!confirm("Are you sure you want to delete this essay?")) return;

    try {
      const essayRef = doc(db, "users", user.uid, "colleges", collegeId, "essays", essayId);
      await deleteDoc(essayRef);
      setSuccess("Essay deleted successfully!");
    } catch (err) {
      console.error("Error deleting essay:", err);
      setError("Failed to delete essay");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-4xl font-black">Loading...</div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-4 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black mb-4">College Not Found</h2>
            <Link href="/colleges">
              <button className="bg-yellow-300 border-2 border-black px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                ← Back to Colleges
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const prompts = getCollegePrompts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/colleges">
            <button className="mb-4 bg-white border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
              ← Back to Colleges
            </button>
          </Link>

          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-4xl font-black mb-2">{college.collegeName}</h1>
            <div className="flex flex-wrap gap-4 mt-4">
              {college.deadlineType && (
                <div className="bg-purple-300 border-2 border-black px-4 py-2 font-bold">
                  📅 {college.deadlineType}
                </div>
              )}
              {college.deadline && (
                <div className="bg-pink-300 border-2 border-black px-4 py-2 font-bold">
                  ⏰ Due: {new Date(college.deadline).toLocaleDateString()}
                </div>
              )}
              {college.appType && (
                <div className="bg-blue-300 border-2 border-black px-4 py-2 font-bold">
                  📝 {college.appType}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-400 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold text-lg">❌ {error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-400 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold text-lg">✅ {success}</p>
          </div>
        )}

        {/* Essays Section */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black uppercase">✍️ Essays</h2>
            <button
              onClick={() => {
                setEditingEssay(null);
                setSelectedPrompts([]);
                setShowEssayModal(true);
              }}
              className="bg-yellow-300 border-2 border-black px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              ➕ Add Essay
            </button>
          </div>

          {/* Essay List */}
          {essays.length === 0 ? (
            <div className="text-center py-12 bg-gray-100 border-2 border-black">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl font-bold mb-4">No essays yet!</p>
              <p className="text-gray-600">Click "Add Essay" to start writing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {essays.map((essay) => (
                <div
                  key={essay.id}
                  className="bg-gradient-to-r from-yellow-100 to-pink-100 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black mb-2">{essay.title}</h3>
                      {essay.promptText && (
                        <p className="text-sm font-semibold text-gray-700 mb-2 italic">
                          Prompt: {essay.promptText.substring(0, 100)}...
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {essay.wordLimit && (
                          <span className="bg-white border-2 border-black px-3 py-1 text-sm font-bold">
                            {essay.content?.split(/\s+/).filter(w => w.length > 0).length || 0}/{essay.wordLimit} words
                          </span>
                        )}
                        {essay.category && (
                          <span className="bg-purple-200 border-2 border-black px-3 py-1 text-sm font-bold">
                            {essay.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEssay(essay);
                          setShowEssayModal(true);
                        }}
                        className="bg-blue-300 border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteEssay(essay.id)}
                        className="bg-red-400 border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {essay.content && (
                    <div className="bg-white border-2 border-black p-4 font-mono text-sm">
                      {essay.content.substring(0, 200)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Essay Modal */}
        {showEssayModal && (
          <EssayModal
            essay={editingEssay}
            prompts={prompts}
            onSave={handleSaveEssay}
            onClose={() => {
              setShowEssayModal(false);
              setEditingEssay(null);
              setSelectedPrompts([]);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Essay Modal Component
function EssayModal({ essay, prompts, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: essay?.title || "",
    promptText: essay?.promptText || "",
    content: essay?.content || "",
    category: essay?.category || "",
    wordLimit: essay?.wordLimit || "",
    selectedPromptId: essay?.selectedPromptId || ""
  });

  const handlePromptSelect = (prompt) => {
    setFormData({
      ...formData,
      promptText: prompt.prompt,
      wordLimit: prompt.wordLimit || "",
      category: prompt.category || "",
      selectedPromptId: prompt.id || ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const wordCount = formData.content.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="sticky top-0 bg-white border-b-4 border-black p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase">
              {essay ? "Edit Essay" : "New Essay"}
            </h2>
            <button
              onClick={onClose}
              className="bg-red-400 border-2 border-black px-4 py-2 font-bold text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Prompt Selection */}
          {prompts && prompts.length > 0 && (
            <div className="mb-6">
              <label className="block text-xl font-black mb-3">
                📋 Select a Prompt (Optional)
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-black p-4 bg-gray-50">
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePromptSelect(prompt)}
                    className={`w-full text-left p-4 border-2 border-black font-bold transition-all ${
                      formData.selectedPromptId === (prompt.id || index)
                        ? "bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    }`}
                  >
                    <div className="text-sm text-gray-600 mb-1">
                      {prompt.category || `Prompt ${index + 1}`}
                    </div>
                    <div className="text-sm">
                      {prompt.prompt.substring(0, 150)}...
                    </div>
                    {prompt.wordLimit && (
                      <div className="text-xs mt-2 text-gray-700">
                        Word limit: {prompt.wordLimit}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Essay Title */}
          <div className="mb-6">
            <label className="block text-xl font-black mb-3">
              📝 Essay Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="e.g., Why Stanford? or Personal Statement"
              required
            />
          </div>

          {/* Prompt Text */}
          <div className="mb-6">
            <label className="block text-xl font-black mb-3">
              💬 Essay Prompt
            </label>
            <textarea
              value={formData.promptText}
              onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
              className="w-full px-4 py-3 border-4 border-black font-mono text-sm h-32 focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="Enter the essay prompt or question..."
            />
          </div>

          {/* Category & Word Limit */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xl font-black mb-3">
                🏷️ Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
                placeholder="e.g., Supplemental"
              />
            </div>
            <div>
              <label className="block text-xl font-black mb-3">
                📏 Word Limit
              </label>
              <input
                type="number"
                value={formData.wordLimit}
                onChange={(e) => setFormData({ ...formData, wordLimit: e.target.value })}
                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
                placeholder="e.g., 650"
              />
            </div>
          </div>

          {/* Essay Content */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xl font-black">
                ✍️ Essay Content *
              </label>
              <div className="text-lg font-bold">
                {wordCount} {formData.wordLimit && `/ ${formData.wordLimit}`} words
                {formData.wordLimit && wordCount > parseInt(formData.wordLimit) && (
                  <span className="text-red-600 ml-2">⚠️ Over limit!</span>
                )}
              </div>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border-4 border-black font-mono text-sm h-96 focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="Start writing your essay here..."
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-400 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              💾 Save Essay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}