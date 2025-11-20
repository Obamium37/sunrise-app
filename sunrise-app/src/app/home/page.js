// "use client";

// import { useAuth } from "../../context/AuthContext";
// import { useState, useEffect } from "react";
// import { collection, onSnapshot } from "firebase/firestore";
// import { db } from "../../lib/firebase";
// import Link from "next/link";
// import { Button } from "@/components/retroui/Button";
// import { Card } from "@/components/retroui/Card";
// import { Badge } from "@/components/retroui/Badge";
// import EnhancedCalendar from "@/components/EnhancedCalendar";

// export default function HomePage() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     totalColleges: 0,
//     totalActivities: 0,
//     upcomingDeadlines: 0
//   });

//   // Load statistics
//   useEffect(() => {
//     if (!user) return;

//     // Load colleges count
//     const collegesRef = collection(db, "users", user.uid, "colleges");
//     const unsubColleges = onSnapshot(collegesRef, (snapshot) => {
//       const colleges = snapshot.docs.map(doc => doc.data());
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       const upcoming = colleges.filter(college => {
//         if (!college.deadline) return false;
//         const deadline = new Date(college.deadline);
//         deadline.setHours(0, 0, 0, 0);
//         return deadline >= today;
//       });

//       setStats(prev => ({
//         ...prev,
//         totalColleges: snapshot.size,
//         upcomingDeadlines: upcoming.length
//       }));
//     });

//     // Load activities count
//     const activityListsRef = collection(db, "users", user.uid, "activityLists");
//     const unsubActivities = onSnapshot(activityListsRef, (snapshot) => {
//       let totalActivities = 0;
      
//       snapshot.docs.forEach(doc => {
//         const activitiesRef = collection(db, "users", user.uid, "activityLists", doc.id, "activities");
//         onSnapshot(activitiesRef, (activitiesSnapshot) => {
//           totalActivities += activitiesSnapshot.size;
//           setStats(prev => ({ ...prev, totalActivities }));
//         });
//       });
//     });

//     return () => {
//       unsubColleges();
//       unsubActivities();
//     };
//   }, [user]);

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-2xl font-bold">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 p-6 md:p-12">
//       <div className="max-w-[1600px] mx-auto space-y-10">
//         {/* Welcome Section */}
//         <div className="space-y-4">
//           <h1 className="text-5xl md:text-6xl font-black">
//             Welcome back{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! 👋
//           </h1>
//           <p className="text-xl text-muted-foreground">
//             Track your college applications and stay on top of deadlines
//           </p>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {/* Colleges Card */}
//           <Link href="/colleges" className="group">
//             <Card className="h-full p-6 transition-all hover:translate-y-[-4px]">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-4xl">🎓</div>
//                 <Badge>View</Badge>
//               </div>
//               <div className="text-6xl font-black mb-2">
//                 {stats.totalColleges}
//               </div>
//               <div className="text-xl font-bold text-muted-foreground">
//                 Colleges
//               </div>
//             </Card>
//           </Link>

//           {/* Activities Card */}
//           <Link href="/activitylists" className="group">
//             <Card className="h-full p-6 transition-all hover:translate-y-[-4px]">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-4xl">📋</div>
//                 <Badge variant="secondary">View</Badge>
//               </div>
//               <div className="text-6xl font-black mb-2">
//                 {stats.totalActivities}
//               </div>
//               <div className="text-xl font-bold text-muted-foreground">
//                 Activities
//               </div>
//             </Card>
//           </Link>

//           {/* Deadlines Card */}
//           <Card className="h-full p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="text-4xl">⏰</div>
//               <Badge variant="destructive">Urgent</Badge>
//             </div>
//             <div className="text-6xl font-black mb-2">
//               {stats.upcomingDeadlines}
//             </div>
//             <div className="text-xl font-bold text-muted-foreground">
//               Upcoming
//             </div>
//           </Card>
//         </div>

//         {/* Calendar Section */}
//         <div>
//           <EnhancedCalendar user={user} />
//         </div>

//         {/* Quick Actions */}
//         <Card className="p-8">
//           <div className="mb-6">
//             <h2 className="text-3xl font-black mb-2">⚡ Quick Actions</h2>
//             <p className="text-muted-foreground">Get started with these common tasks</p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <Link href="/colleges">
//               <Button className="w-full" size="lg">
//                 <span className="text-2xl mr-2">➕</span>
//                 Add College
//               </Button>
//             </Link>
            
//             <Link href="/activitylists">
//               <Button className="w-full" size="lg" variant="secondary">
//                 <span className="text-2xl mr-2">✏️</span>
//                 Manage Activities
//               </Button>
//             </Link>
            
//             <Link href="/colleges">
//               <Button className="w-full" size="lg" variant="outline">
//                 <span className="text-2xl mr-2">📅</span>
//                 View Deadlines
//               </Button>
//             </Link>
//           </div>
//         </Card>

//         {/* Motivational Card */}
//         <Card className="p-6 bg-gradient-to-r from-purple-100 to-pink-100">
//           <div className="flex items-center gap-4">
//             <div className="text-5xl">💪</div>
//             <div>
//               <h3 className="text-2xl font-black mb-2">You're doing great!</h3>
//               <p className="text-lg font-semibold">
//                 Keep working on those applications. Your dream school is waiting! 🎯
//               </p>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }


"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";
import EnhancedCalendar from "@/components/EnhancedCalendar";

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalActivities: 0,
    upcomingDeadlines: 0
  });

  // Load statistics
  useEffect(() => {
    if (!user) return;

    // Load colleges count
    const collegesRef = collection(db, "users", user.uid, "colleges");
    const unsubColleges = onSnapshot(collegesRef, (snapshot) => {
      const colleges = snapshot.docs.map(doc => doc.data());
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = colleges.filter(college => {
        if (!college.deadline) return false;
        const deadline = new Date(college.deadline);
        deadline.setHours(0, 0, 0, 0);
        return deadline >= today;
      });

      setStats(prev => ({
        ...prev,
        totalColleges: snapshot.size,
        upcomingDeadlines: upcoming.length
      }));
    });

    // Load activities count
    const activityListsRef = collection(db, "users", user.uid, "activityLists");
    const unsubActivities = onSnapshot(activityListsRef, (snapshot) => {
      let totalActivities = 0;
      
      snapshot.docs.forEach(doc => {
        const activitiesRef = collection(db, "users", user.uid, "activityLists", doc.id, "activities");
        onSnapshot(activitiesRef, (activitiesSnapshot) => {
          totalActivities += activitiesSnapshot.size;
          setStats(prev => ({ ...prev, totalActivities }));
        });
      });
    });

    return () => {
      unsubColleges();
      unsubActivities();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 p-6 md:p-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Welcome Section - RetroUI Style */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-black border-4 border-black inline-block px-6 py-4 bg-yellow-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            Welcome back{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-xl md:text-2xl font-bold text-black mt-6 bg-white border-4 border-black px-6 py-3 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Track your college applications and stay on top of deadlines
          </p>
        </div>

        {/* Stats Grid - RetroUI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Colleges Card */}
          <Link href="/colleges" className="group">
            <div className="bg-gradient-to-br from-pink-400 to-pink-500 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="text-6xl">🎓</div>
                <div className="bg-white border-2 border-black px-3 py-1 font-mono text-sm font-bold">
                  CLICK →
                </div>
              </div>
              <div className="text-6xl font-black text-white mb-2 font-mono">
                {stats.totalColleges}
              </div>
              <div className="text-2xl font-bold text-black uppercase tracking-wider">
                Colleges
              </div>
            </div>
          </Link>

          {/* Activities Card */}
          <Link href="/activitylists" className="group">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="text-6xl">📋</div>
                <div className="bg-white border-2 border-black px-3 py-1 font-mono text-sm font-bold">
                  CLICK →
                </div>
              </div>
              <div className="text-6xl font-black text-white mb-2 font-mono">
                {stats.totalActivities}
              </div>
              <div className="text-2xl font-bold text-black uppercase tracking-wider">
                Activities
              </div>
            </div>
          </Link>

          {/* Deadlines Card */}
          <div className="bg-gradient-to-br from-green-400 to-green-500 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-6xl">⏰</div>
              <div className="bg-yellow-300 border-2 border-black px-3 py-1 font-mono text-sm font-bold animate-pulse">
                URGENT!
              </div>
            </div>
            <div className="text-6xl font-black text-white mb-2 font-mono">
              {stats.upcomingDeadlines}
            </div>
            <div className="text-2xl font-bold text-black uppercase tracking-wider">
              Upcoming
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="mb-10">
          <EnhancedCalendar user={user} />
        </div>

        {/* Quick Actions - RetroUI Buttons */}
        <div className="bg-white border-4 border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-4xl font-black mb-6 text-black uppercase tracking-wider border-b-4 border-black pb-4">
            ⚡ Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add College Button */}
            <Link href="/colleges">
              <button className="w-full bg-yellow-300 border-4 border-black px-6 py-4 font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-between group">
                <span className="flex items-center gap-3">
                  <span className="text-3xl">➕</span>
                  <span>Add College</span>
                </span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>

            {/* Manage Activities Button */}
            <Link href="/activitylists">
              <button className="w-full bg-pink-300 border-4 border-black px-6 py-4 font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-between group">
                <span className="flex items-center gap-3">
                  <span className="text-3xl">✏️</span>
                  <span>Activities</span>
                </span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>

            {/* View Deadlines Button */}
            <Link href="/colleges">
              <button className="w-full bg-blue-300 border-4 border-black px-6 py-4 font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-between group">
                <span className="flex items-center gap-3">
                  <span className="text-3xl">📅</span>
                  <span>Deadlines</span>
                </span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Fun Motivational Box */}
        <div className="mt-10 bg-gradient-to-r from-purple-400 to-pink-400 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <div className="text-5xl">💪</div>
            <div>
              <div className="text-2xl font-black text-black mb-1">
                You're doing great!
              </div>
              <div className="text-lg font-bold text-black">
                Keep working on those applications. Your dream school is waiting! 🎯
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}