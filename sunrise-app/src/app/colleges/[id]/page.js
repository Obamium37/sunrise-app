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
import { formatAppType, formatDeadline } from "../../../lib/formatters";

export default function CollegeDetailPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Unwrap params using React.use() for Next.js 15+
  const unwrappedParams = use(params);
  const collegeId = unwrappedParams.id;
  
  const [college, setCollege] = useState(null);
  const [collegeDetails, setCollegeDetails] = useState(null); // Full college data from JSON
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEssayModal, setShowEssayModal] = useState(false);
  const [editingEssay, setEditingEssay] = useState(null);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [activeInfoTab, setActiveInfoTab] = useState("overview");

  // Load college data
  useEffect(() => {
    if (!user || !collegeId) return;

    const loadCollege = async () => {
      try {
        const collegeRef = doc(db, "users", user.uid, "colleges", collegeId);
        const collegeSnap = await getDoc(collegeRef);
        
        if (collegeSnap.exists()) {
          const collegeData = { id: collegeSnap.id, ...collegeSnap.data() };
          setCollege(collegeData);
          
          // Load full college details from collegeLoader if we have collegeId
          if (collegeData.collegeId) {
            try {
              const { getCollegeById } = await import("../../../lib/collegeLoader");
              const fullDetails = getCollegeById(collegeData.collegeId);
              setCollegeDetails(fullDetails);
            } catch (err) {
              console.error("Error loading college details:", err);
            }
          }
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
      
      setTimeout(() => setSuccess(""), 3000);
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
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting essay:", err);
      setError("Failed to delete essay");
    }
  };

  const handleOpenEssayModal = (essay = null) => {
    if (essay) {
      setEditingEssay(essay);
    } else {
      setEditingEssay(null);
    }
    setShowEssayModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-4xl font-black animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-2">Error</h2>
            <p className="font-bold">{error}</p>
            <Link href="/colleges">
              <button className="mt-4 bg-white border-2 border-black px-4 py-2 font-bold">
                ← Back to Colleges
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!college) return null;

  const appType = college.appType || college.activityTemplateType || 'other';
  const availablePrompts = essayPrompts[appType] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/colleges">
            <button className="bg-white border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all mb-4">
              ← Back to Colleges
            </button>
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase border-4 border-black bg-gradient-to-r from-yellow-300 to-pink-300 px-6 py-4 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            🎓 {college.name}
          </h1>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 bg-green-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold">✅ {success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold">❌ {error}</p>
          </div>
        )}

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-sm font-bold mb-1 uppercase">Application Type</div>
            <div className="text-xl font-black">📝 {formatAppType(college.appType)}</div>
          </div>
          
          <div className="bg-pink-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-sm font-bold mb-1 uppercase">Deadline</div>
            <div className="text-xl font-black">
              {college.deadline === "Rolling" ? "🔄" : "⏰"} {formatDeadline(college.deadline)}
            </div>
          </div>
          
          <div className="bg-purple-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-sm font-bold mb-1 uppercase">Deadline Type</div>
            <div className="text-xl font-black">📅 {college.deadlineType}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - College Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* College Information Section */}
            {collegeDetails && (
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 pb-4 border-b-4 border-black">
                  📚 College Information
                </h2>

                {/* Info Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {["overview", "academics", "admissions", "costs"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveInfoTab(tab)}
                      className={`px-4 py-2 font-bold border-2 border-black transition-all ${
                        activeInfoTab === tab
                          ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  {/* Overview Tab */}
                  {activeInfoTab === "overview" && (
                    <div className="space-y-4">
                      {collegeDetails.location && (
                        <InfoCard 
                          icon="📍" 
                          label="Location" 
                          value={collegeDetails.location}
                        />
                      )}
                      {collegeDetails.total_cost?.type && (
                        <InfoCard 
                          icon="🏛️" 
                          label="Type" 
                          value={collegeDetails.total_cost.type === "public" ? "Public University" : "Private University"}
                        />
                      )}
                      {collegeDetails.setting && (
                        <InfoCard 
                          icon="🌆" 
                          label="Setting" 
                          value={collegeDetails.setting}
                        />
                      )}
                      {collegeDetails.student_body?.total && (
                        <InfoCard 
                          icon="👥" 
                          label="Total Enrollment" 
                          value={collegeDetails.student_body.total.toLocaleString() + " students"}
                        />
                      )}
                      {collegeDetails.student_body?.undergraduate && (
                        <InfoCard 
                          icon="🎓" 
                          label="Undergraduate" 
                          value={collegeDetails.student_body.undergraduate.toLocaleString() + " students"}
                        />
                      )}
                      {collegeDetails.acceptance_rate && (
                        <InfoCard 
                          icon="📊" 
                          label="Acceptance Rate" 
                          value={(collegeDetails.acceptance_rate * 100).toFixed(1) + "%"}
                          highlight={collegeDetails.acceptance_rate < 0.1 ? "red" : collegeDetails.acceptance_rate < 0.3 ? "orange" : "green"}
                        />
                      )}
                      
                      {!collegeDetails.location && !collegeDetails.student_body && !collegeDetails.acceptance_rate && (
                        <div className="bg-gray-100 border-2 border-black p-8 text-center">
                          <div className="text-6xl mb-4">📚</div>
                          <p className="text-xl font-bold">Overview information not available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Academics Tab */}
                  {activeInfoTab === "academics" && (
                    <div className="space-y-4">
                      {collegeDetails.middle_50_percent && (
                        <>
                          <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-black p-4">
                            <h3 className="font-black text-lg mb-3 uppercase">📊 Middle 50% Statistics</h3>
                            
                            {collegeDetails.middle_50_percent.SAT_composite?.low && collegeDetails.middle_50_percent.SAT_composite?.high && (
                              <InfoCard 
                                icon="📝" 
                                label="SAT Composite" 
                                value={`${collegeDetails.middle_50_percent.SAT_composite.low} - ${collegeDetails.middle_50_percent.SAT_composite.high}`}
                              />
                            )}
                            
                            {collegeDetails.middle_50_percent.ACT_composite?.low && collegeDetails.middle_50_percent.ACT_composite?.high && (
                              <InfoCard 
                                icon="✏️" 
                                label="ACT Composite" 
                                value={`${collegeDetails.middle_50_percent.ACT_composite.low} - ${collegeDetails.middle_50_percent.ACT_composite.high}`}
                              />
                            )}
                            
                            {collegeDetails.middle_50_percent.GPA_unweighted?.low && collegeDetails.middle_50_percent.GPA_unweighted?.high && (
                              <InfoCard 
                                icon="📚" 
                                label="GPA (Unweighted)" 
                                value={`${collegeDetails.middle_50_percent.GPA_unweighted.low} - ${collegeDetails.middle_50_percent.GPA_unweighted.high}`}
                              />
                            )}
                            
                            {!collegeDetails.middle_50_percent.SAT_composite && !collegeDetails.middle_50_percent.ACT_composite && !collegeDetails.middle_50_percent.GPA_unweighted && (
                              <p className="text-center font-bold text-gray-600">Test score data not available</p>
                            )}
                          </div>
                        </>
                      )}
                      
                      {collegeDetails.popular_majors && collegeDetails.popular_majors.length > 0 && (
                        <div className="bg-yellow-100 border-2 border-black p-4">
                          <h3 className="font-black text-lg mb-3 uppercase">🎯 Popular Majors</h3>
                          <div className="flex flex-wrap gap-2">
                            {collegeDetails.popular_majors.slice(0, 10).map((major, idx) => (
                              <span key={idx} className="bg-white border-2 border-black px-3 py-1 font-bold text-sm">
                                {major}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {!collegeDetails.middle_50_percent && !collegeDetails.popular_majors && (
                        <div className="bg-gray-100 border-2 border-black p-8 text-center">
                          <div className="text-6xl mb-4">📊</div>
                          <p className="text-xl font-bold">Academic information not available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admissions Tab */}
                  {activeInfoTab === "admissions" && (
                    <div className="space-y-4">
                      {collegeDetails.application_info && (
                        <>
                          <InfoCard 
                            icon="📝" 
                            label="Application Platform" 
                            value={formatAppType(collegeDetails.application_info.app_type)}
                          />
                          
                          {collegeDetails.application_info.deadlines && (
                            <div className="bg-pink-100 border-2 border-black p-4">
                              <h3 className="font-black text-lg mb-3 uppercase">📅 All Deadlines</h3>
                              <div className="space-y-2">
                                {Object.entries(collegeDetails.application_info.deadlines).map(([type, date]) => {
                                  if (date === null || date === false) return null;
                                  
                                  const formattedType = type
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .trim();
                                  
                                  return (
                                    <div key={type} className="flex justify-between items-center bg-white border-2 border-black px-3 py-2">
                                      <span className="font-bold">{formattedType}</span>
                                      <span className="font-black">
                                        {date === true ? "Rolling" : formatDeadline(date)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {collegeDetails.application_info.requirements && (
                            <div className="bg-blue-100 border-2 border-black p-4">
                              <h3 className="font-black text-lg mb-3 uppercase">✅ Requirements</h3>
                              <div className="space-y-2">
                                {Object.entries(collegeDetails.application_info.requirements).map(([req, status]) => (
                                  <div key={req} className="flex items-center gap-2">
                                    <span className="text-xl">
                                      {status === "required" ? "✅" : status === "recommended" ? "💡" : status === "optional" ? "⭕" : "❌"}
                                    </span>
                                    <span className="font-bold capitalize">
                                      {req.replace(/_/g, " ")}
                                    </span>
                                    <span className="ml-auto text-sm font-black uppercase px-2 py-1 bg-white border border-black">
                                      {status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Costs Tab */}
                  {activeInfoTab === "costs" && (
                    <div className="space-y-4">
                      {collegeDetails.total_cost ? (
                        <>
                          {/* Show in-state cost if available */}
                          {collegeDetails.total_cost.in_state != null && (
                            <InfoCard 
                              icon="💰" 
                              label={collegeDetails.total_cost.type === "public" ? "In-State Cost of Attendance" : "Total Cost of Attendance"}
                              value={"$" + Number(collegeDetails.total_cost.in_state).toLocaleString() + " per year"}
                              highlight="blue"
                            />
                          )}
                          
                          {/* Show out-of-state cost if different from in-state and it's a public school */}
                          {collegeDetails.total_cost.out_of_state != null && 
                           collegeDetails.total_cost.type === "public" && 
                           collegeDetails.total_cost.out_of_state !== collegeDetails.total_cost.in_state && (
                            <InfoCard 
                              icon="💸" 
                              label="Out-of-State Cost of Attendance"
                              value={"$" + Number(collegeDetails.total_cost.out_of_state).toLocaleString() + " per year"}
                              highlight="orange"
                            />
                          )}
                          
                          {/* Show general amount if available (fallback) */}
                          {!collegeDetails.total_cost.in_state && collegeDetails.total_cost.amount != null && (
                            <InfoCard 
                              icon="💰" 
                              label="Total Cost of Attendance" 
                              value={"$" + Number(collegeDetails.total_cost.amount).toLocaleString() + " per year"}
                              highlight="blue"
                            />
                          )}
                          
                          {/* Cost breakdown if available */}
                          {collegeDetails.total_cost.breakdown && Object.keys(collegeDetails.total_cost.breakdown).length > 0 && (
                            <div className="bg-green-100 border-2 border-black p-4">
                              <h3 className="font-black text-lg mb-3 uppercase">💵 Cost Breakdown</h3>
                              <div className="space-y-2">
                                {Object.entries(collegeDetails.total_cost.breakdown).map(([item, cost]) => (
                                  cost != null ? (
                                    <div key={item} className="flex justify-between items-center bg-white border-2 border-black px-3 py-2">
                                      <span className="font-bold capitalize">{item.replace(/_/g, " ")}</span>
                                      <span className="font-black">${Number(cost).toLocaleString()}</span>
                                    </div>
                                  ) : null
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* School type info */}
                          {collegeDetails.total_cost.type && (
                            <div className="bg-purple-100 border-2 border-black p-4">
                              <InfoCard 
                                icon="🏛️" 
                                label="Institution Type" 
                                value={collegeDetails.total_cost.type === "public" ? "Public University" : "Private University"}
                              />
                            </div>
                          )}
                          
                          {/* Financial aid if available */}
                          {collegeDetails.financial_aid && (
                            <div className="bg-yellow-100 border-2 border-black p-4">
                              <h3 className="font-black text-lg mb-3 uppercase">🎁 Financial Aid</h3>
                              {collegeDetails.financial_aid.average_aid != null && (
                                <InfoCard 
                                  icon="💝" 
                                  label="Average Aid Package" 
                                  value={"$" + Number(collegeDetails.financial_aid.average_aid).toLocaleString()}
                                />
                              )}
                              {collegeDetails.financial_aid.percent_receiving != null && (
                                <InfoCard 
                                  icon="📊" 
                                  label="Students Receiving Aid" 
                                  value={(Number(collegeDetails.financial_aid.percent_receiving) * 100).toFixed(0) + "%"}
                                />
                              )}
                            </div>
                          )}
                          
                          {/* Show note about cost estimates */}
                          <div className="bg-blue-50 border-2 border-black p-4">
                            <p className="text-sm font-bold text-gray-700">
                              💡 <strong>Note:</strong> Cost estimates include tuition, fees, room, board, books, and other expenses. 
                              Actual costs may vary. Check the college website for the most current information.
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gray-100 border-2 border-black p-8 text-center">
                          <div className="text-6xl mb-4">💰</div>
                          <p className="text-xl font-bold">Cost information not available</p>
                          <p className="text-gray-600 mt-2">Check the college website for current costs.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Essays Section */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-black">
                <h2 className="text-3xl font-black uppercase">✍️ Essays</h2>
                <button
                  onClick={() => handleOpenEssayModal()}
                  className="bg-green-400 border-4 border-black px-6 py-3 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                >
                  ➕ Add Essay
                </button>
              </div>

              {essays.length === 0 ? (
                <div className="text-center py-12 bg-gray-100 border-2 border-black">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl font-bold">No essays yet!</p>
                  <p className="text-gray-600 mt-2">Click "Add Essay" to start writing.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {essays.map((essay, index) => (
                    <EssayCard
                      key={essay.id}
                      essay={essay}
                      index={index}
                      onEdit={() => handleOpenEssayModal(essay)}
                      onDelete={() => handleDeleteEssay(essay.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-yellow-200 to-orange-200 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-2xl font-black uppercase mb-4">⚡ Quick Stats</h3>
              <div className="space-y-3">
                <div className="bg-white border-2 border-black p-3">
                  <div className="text-sm font-bold">Essays Written</div>
                  <div className="text-3xl font-black">{essays.length}</div>
                </div>
                
                {collegeDetails?.acceptance_rate && (
                  <div className="bg-white border-2 border-black p-3">
                    <div className="text-sm font-bold">Acceptance Rate</div>
                    <div className="text-3xl font-black">
                      {(collegeDetails.acceptance_rate * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
                
                <div className="bg-white border-2 border-black p-3">
                  <div className="text-sm font-bold">Days Until Deadline</div>
                  <div className="text-3xl font-black">
                    {college.deadline === "Rolling" 
                      ? "∞" 
                      : Math.ceil((new Date(college.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                    }
                  </div>
                </div>
              </div>
            </div>

            {collegeDetails?.website && (
              <a 
                href={collegeDetails.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-blue-400 border-4 border-black p-4 font-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                🌐 Visit College Website →
              </a>
            )}
          </div>
        </div>

        {/* Essay Modal */}
        {showEssayModal && (
          <EssayModal
            essay={editingEssay}
            availablePrompts={availablePrompts}
            onClose={() => {
              setShowEssayModal(false);
              setEditingEssay(null);
            }}
            onSave={handleSaveEssay}
          />
        )}
      </div>
    </div>
  );
}

// Info Card Component
function InfoCard({ icon, label, value, highlight }) {
  const bgColor = highlight === "red" ? "bg-red-200" :
                  highlight === "orange" ? "bg-orange-200" :
                  highlight === "blue" ? "bg-blue-200" :
                  highlight === "green" ? "bg-green-200" :
                  "bg-white";
  
  return (
    <div className={`${bgColor} border-2 border-black p-3 flex items-center gap-3`}>
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-bold text-gray-600 uppercase">{label}</div>
        <div className="text-lg font-black">{value}</div>
      </div>
    </div>
  );
}

// Essay Card Component
function EssayCard({ essay, index, onEdit, onDelete }) {
  const wordCount = essay.content ? essay.content.trim().split(/\s+/).length : 0;
  const isOverLimit = essay.wordLimit && wordCount > essay.wordLimit;
  const isNearLimit = essay.wordLimit && wordCount > essay.wordLimit * 0.9;

  return (
    <div className="bg-gradient-to-r from-yellow-100 to-pink-100 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-black text-white px-4 py-2 font-black text-xl rounded">
          #{index + 1}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="bg-blue-400 border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-400 border-2 border-black px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <h3 className="text-2xl font-black mb-2">{essay.title}</h3>
      
      {essay.category && (
        <div className="inline-block bg-purple-300 border-2 border-black px-3 py-1 font-bold text-sm mb-3">
          {essay.category}
        </div>
      )}
      
      <p className="text-sm font-bold text-gray-600 mb-3 italic line-clamp-2">
        {essay.promptText}
      </p>
      
      <p className="text-base leading-relaxed mb-4 font-mono bg-white border-2 border-black p-3 line-clamp-4">
        {essay.content}
      </p>
      
      <div className={`text-sm font-black ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-600'}`}>
        Words: {wordCount} {essay.wordLimit ? `/ ${essay.wordLimit}` : ''}
        {isOverLimit && ' ⚠️ OVER LIMIT'}
        {isNearLimit && !isOverLimit && ' ⚠️ NEAR LIMIT'}
      </div>
    </div>
  );
}

// Essay Modal Component
function EssayModal({ essay, availablePrompts, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: essay?.title || '',
    category: essay?.category || '',
    promptText: essay?.promptText || '',
    content: essay?.content || '',
    wordLimit: essay?.wordLimit || 650,
  });

  const handlePromptSelect = (prompt) => {
    setFormData({
      ...formData,
      category: prompt.category,
      promptText: prompt.prompt,
      wordLimit: prompt.wordLimit,
    });
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(w => w).length;
  const isOverLimit = wordCount > formData.wordLimit;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="relative bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-300 to-pink-300 border-b-4 border-black p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase">
              {essay ? '✏️ Edit Essay' : '➕ Add Essay'}
            </h2>
            <button
              onClick={onClose}
              className="bg-red-400 border-2 border-black px-4 py-2 font-bold text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!essay && availablePrompts.length > 0 && (
            <div className="bg-blue-100 border-2 border-black p-4">
              <label className="block font-black text-lg mb-3">📝 Select a Prompt (Optional)</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availablePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptSelect(prompt)}
                    className="w-full text-left bg-white border-2 border-black p-3 font-bold hover:bg-yellow-100 transition-colors"
                  >
                    <div className="text-sm text-purple-700 mb-1">{prompt.category}</div>
                    <div className="text-sm line-clamp-2">{prompt.prompt}</div>
                    <div className="text-xs text-gray-600 mt-1">Limit: {prompt.wordLimit} words</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-black text-lg mb-2">✏️ Essay Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="Enter essay title..."
            />
          </div>

          <div>
            <label className="block font-black text-lg mb-2">📋 Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="e.g., Personal Statement"
            />
          </div>

          <div>
            <label className="block font-black text-lg mb-2">❓ Prompt</label>
            <textarea
              value={formData.promptText}
              onChange={(e) => setFormData({...formData, promptText: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="Enter the essay prompt..."
            />
          </div>

          <div>
            <label className="block font-black text-lg mb-2">📝 Essay Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
              rows={12}
              className="w-full px-4 py-3 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="Start writing your essay..."
            />
            <div className={`text-right font-black mt-2 ${isOverLimit ? 'text-red-600' : 'text-gray-600'}`}>
              {wordCount} / {formData.wordLimit} words
              {isOverLimit && ' ⚠️ OVER LIMIT'}
            </div>
          </div>

          <div>
            <label className="block font-black text-lg mb-2">🔢 Word Limit</label>
            <input
              type="number"
              value={formData.wordLimit}
              onChange={(e) => setFormData({...formData, wordLimit: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300"
              min="1"
            />
          </div>

          <div className="flex gap-4 pt-6 border-t-4 border-black">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-400 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              💾 {essay ? 'Update' : 'Add'} Essay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}