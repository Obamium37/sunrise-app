"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import NewCollegeModal from "@/components/NewCollegeModal";
import { Button } from "@/components/retroui/Button";

export default function CollegesPageRetro() {
  const { user } = useAuth();
  const router = useRouter();

  const [addCollegeFormVisible, setAddCollegeFormVisible] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    const q = query(collection(db, "users", user.uid, "colleges"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setColleges(arr);
    });
    return () => unsub();
  }, [user]);

  const handleAddCollege = async (collegeData) => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!collegeData.name || !collegeData.deadline) {
      setErrorMsg("College name and deadline are required.");
      return false;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "colleges"), {
        collegeName: collegeData.name,
        deadline: collegeData.deadline,
        deadlineType: collegeData.deadlineType,
        appType: collegeData.appType,
        activityTemplateType: collegeData.appType,
        collegeId: collegeData.collegeId,
        addedAt: new Date().toISOString(),
      });

      setSuccessMsg("College added successfully!");
      return true;
    } catch (err) {
      console.error("Add college error:", err);
      setErrorMsg("Failed to add college: " + err.message);
      return false;
    }
  };

  const handleDeleteCollege = async (collegeId, collegeName) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${collegeName}" from your list?\n\nNote: This will also remove associated activity lists if no other colleges use that application type.`
    );
    
    if (!confirmDelete) return;

    setDeletingId(collegeId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await deleteDoc(doc(db, "users", user.uid, "colleges", collegeId));
      setSuccessMsg(`"${collegeName}" has been removed from your list.`);
    } catch (err) {
      console.error("Delete college error:", err);
      setErrorMsg("Failed to delete college: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-4xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6 md:p-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-5xl md:text-6xl font-black uppercase border-4 border-black bg-yellow-300 px-6 py-4 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              🎓 Your Colleges
            </h1>
            
            <button
              onClick={() => setAddCollegeFormVisible(true)}
              className="bg-green-400 border-4 border-black px-6 py-4 font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase"
            >
              ➕ Add College
            </button>
          </div>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-6 bg-red-400 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold text-lg">❌ {errorMsg}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 bg-green-400 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold text-lg">✅ {successMsg}</p>
          </div>
        )}

        {/* Modal */}
        {addCollegeFormVisible && (
          <NewCollegeModal
            setIsOpen={setAddCollegeFormVisible}
            onSubmit={handleAddCollege}
          />
        )}

        {/* Empty State */}
        {colleges.length === 0 ? (
          <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-8xl mb-6">🎓</div>
            <h2 className="text-3xl font-black mb-4 uppercase">No Colleges Yet!</h2>
            <p className="text-xl font-bold mb-6">
              Click "Add College" to start building your college list.
            </p>
            <button
              onClick={() => setAddCollegeFormVisible(true)}
              className="bg-yellow-300 border-4 border-black px-8 py-4 font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase"
            >
              ➕ Add Your First College
            </button>
          </div>
        ) : (
          /* Colleges Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <div
                key={college.id}
                className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                {/* College Header */}
                <div className="mb-4">
                  <Link 
                    href={`/colleges/${college.id}`}
                    className="group"
                  >
                    <h3 className="text-2xl font-black mb-2 group-hover:text-blue-600 transition-colors">
                      {college.data.collegeName}
                    </h3>
                  </Link>
                  
                  {college.data.deadlineType && (
                    <div className="inline-block bg-purple-300 border-2 border-black px-3 py-1 font-bold text-sm uppercase mb-2">
                      {college.data.deadlineType}
                    </div>
                  )}
                </div>

                {/* Deadline */}
                <div className="mb-4 bg-gradient-to-r from-pink-200 to-yellow-200 border-2 border-black p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    <div>
                      <div className="text-xs font-bold uppercase text-gray-700">Deadline</div>
                      <div className="text-lg font-black">
                        {new Date(college.data.deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Type */}
                {college.data.appType && (
                  <div className="mb-4">
                    <div className="text-xs font-bold uppercase text-gray-700 mb-1">Application Type</div>
                    <div className="bg-blue-200 border-2 border-black px-3 py-2 font-bold text-sm">
                      {college.data.appType}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/colleges/${college.id}`}
                    className="flex-1 bg-blue-300 border-2 border-black px-4 py-2 font-bold text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  >
                    View →
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteCollege(college.id, college.data.collegeName)}
                    disabled={deletingId === college.id}
                    className="bg-red-400 border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === college.id ? "..." : "🗑️"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {colleges.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-300 to-blue-300 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-5xl">📊</span>
                <div>
                  <div className="text-sm font-bold uppercase text-gray-700">Total Colleges</div>
                  <div className="text-4xl font-black">{colleges.length}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-bold uppercase text-gray-700 mb-2">Quick Stats</div>
                <div className="flex gap-4">
                  {colleges.filter(c => new Date(c.data.deadline) < new Date()).length > 0 && (
                    <div className="bg-white border-2 border-black px-3 py-2">
                      <div className="text-2xl font-black text-red-600">
                        {colleges.filter(c => new Date(c.data.deadline) < new Date()).length}
                      </div>
                      <div className="text-xs font-bold">Past Due</div>
                    </div>
                  )}
                  <div className="bg-white border-2 border-black px-3 py-2">
                    <div className="text-2xl font-black text-green-600">
                      {colleges.filter(c => new Date(c.data.deadline) >= new Date()).length}
                    </div>
                    <div className="text-xs font-bold">Upcoming</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}