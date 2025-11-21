"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    graduationYear: "",
    gpa: "",
    targetMajor: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    setError("");
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && !formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (step === 2 && !formData.graduationYear) {
      setError("Please select your graduation year");
      return;
    }
    
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      // Save user profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        graduationYear: formData.graduationYear,
        gpa: formData.gpa || null,
        targetMajor: formData.targetMajor || null,
        email: user.email,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      // Redirect to home
      router.push("/home");
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-4xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black uppercase border-4 border-black bg-gradient-to-r from-yellow-300 to-pink-300 px-6 py-4 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-4">
            🎓 Welcome to Sunrise!
          </h1>
          <p className="text-xl font-bold mt-4">Let's get your profile set up!</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-lg">Step {step} of {totalSteps}</span>
            <span className="font-bold text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="bg-gray-200 border-2 border-black h-6">
            <div 
              className="bg-green-400 h-full border-r-2 border-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-400 border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold text-lg">❌ {error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">👋</div>
                  <h2 className="text-3xl font-black mb-2">What's your name?</h2>
                  <p className="text-gray-600 font-bold">We'd love to know what to call you!</p>
                </div>

                <div>
                  <label className="block text-xl font-black mb-3 uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleChange("name")}
                    required
                    autoFocus
                    className="w-full px-6 py-4 border-4 border-black font-bold text-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Graduation Year */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🎓</div>
                  <h2 className="text-3xl font-black mb-2">When do you graduate?</h2>
                  <p className="text-gray-600 font-bold">This helps us tailor deadlines for you!</p>
                </div>

                <div>
                  <label className="block text-xl font-black mb-3 uppercase">
                    Expected Graduation Year *
                  </label>
                  <select
                    value={formData.graduationYear}
                    onChange={handleChange("graduationYear")}
                    required
                    className="w-full px-6 py-4 border-4 border-black font-bold text-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"
                  >
                    <option value="">-- Select Year --</option>
                    {graduationYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Optional Info */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">📊</div>
                  <h2 className="text-3xl font-black mb-2">A few more details</h2>
                  <p className="text-gray-600 font-bold">Optional, but helps us personalize your experience!</p>
                </div>

                <div>
                  <label className="block text-xl font-black mb-3 uppercase">
                    Current GPA (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    value={formData.gpa}
                    onChange={handleChange("gpa")}
                    className="w-full px-6 py-4 border-4 border-black font-bold text-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"
                    placeholder="e.g., 3.85"
                  />
                </div>

                <div>
                  <label className="block text-xl font-black mb-3 uppercase">
                    Intended Major (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.targetMajor}
                    onChange={handleChange("targetMajor")}
                    className="w-full px-6 py-4 border-4 border-black font-bold text-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t-4 border-black">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-300 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase"
                >
                  ← Back
                </button>
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-blue-400 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-400 border-4 border-black px-6 py-4 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                >
                  {loading ? "Saving..." : "Complete Setup! 🚀"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Fun fact at bottom */}
        <div className="mt-6 text-center">
          <div className="bg-yellow-200 border-4 border-black px-6 py-3 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold">
              💡 <strong>Info:</strong> You can always update this information later in settings!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}