import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function EnhancedCalendarRetro({ user }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [deadlinesByDate, setDeadlinesByDate] = useState({});
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  // Load colleges and their deadlines
  useEffect(() => {
    if (!user) return;

    const collegesRef = collection(db, 'users', user.uid, 'colleges');
    const unsubscribe = onSnapshot(collegesRef, (snapshot) => {
      const collegeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setColleges(collegeData);
      processDeadlines(collegeData);
    });

    return () => unsubscribe();
  }, [user]);

  // Process deadlines
  const processDeadlines = (collegeData) => {
    const deadlinesMap = {};
    const upcoming = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    collegeData.forEach(college => {
      if (college.deadline) {
        const deadlineDate = new Date(college.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const dateKey = formatDateKey(deadlineDate);
        
        if (!deadlinesMap[dateKey]) {
          deadlinesMap[dateKey] = [];
        }
        
        deadlinesMap[dateKey].push({
          collegeName: college.collegeName,
          deadline: college.deadline,
          deadlineType: college.deadlineType,
          appType: college.appType,
          collegeId: college.id
        });

        if (deadlineDate >= today) {
          const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
          upcoming.push({
            collegeName: college.collegeName,
            deadline: college.deadline,
            deadlineType: college.deadlineType,
            appType: college.appType,
            collegeId: college.id,
            daysUntil,
            isPast: false
          });
        }
      }
    });

    upcoming.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    setDeadlinesByDate(deadlinesMap);
    setUpcomingDeadlines(upcoming);
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (year, month, day) => {
    if (!selectedDate) return false;
    return (
      year === selectedDate.getFullYear() &&
      month === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    );
  };

  const hasDeadline = (year, month, day) => {
    const dateKey = formatDateKey(new Date(year, month, day));
    return deadlinesByDate[dateKey] && deadlinesByDate[dateKey].length > 0;
  };

  const getDeadlinesForDate = (year, month, day) => {
    const dateKey = formatDateKey(new Date(year, month, day));
    return deadlinesByDate[dateKey] || [];
  };

  const handleDateClick = (year, month, day) => {
    setSelectedDate(new Date(year, month, day));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Week day headers
    weekDays.forEach((day, index) => {
      days.push(
        <div key={`header-${index}`} className="text-center font-black text-lg p-2 border-2 border-black bg-yellow-200">
          {day}
        </div>
      );
    });

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="border-2 border-black bg-gray-100" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(year, month, day);
      const isSelectedDay = isSelected(year, month, day);
      const hasDeadlines = hasDeadline(year, month, day);
      const deadlines = getDeadlinesForDate(year, month, day);
      const isPast = new Date(year, month, day) < new Date().setHours(0, 0, 0, 0);
      
      let bgColor = 'bg-white';
      if (isCurrentDay) bgColor = 'bg-yellow-300';
      if (hasDeadlines) bgColor = 'bg-pink-300';
      if (isSelectedDay) bgColor = 'bg-blue-300';
      
      days.push(
        <div
          key={`day-${day}`}
          className={`
            border-2 border-black p-2 cursor-pointer relative min-h-[60px]
            ${bgColor}
            ${isPast ? 'opacity-50' : ''}
            hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px)]
            transition-all
          `}
          onClick={() => handleDateClick(year, month, day)}
        >
          <span className="font-bold text-lg">{day}</span>
          {hasDeadlines && (
            <div className="absolute bottom-1 right-1 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white">
              {deadlines.length}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const formatDeadlineDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUrgencyColor = (daysUntil) => {
    if (daysUntil <= 7) return 'from-red-400 to-red-500';
    if (daysUntil <= 30) return 'from-orange-400 to-orange-500';
    return 'from-green-400 to-green-500';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar Section */}
      <div className="lg:col-span-2 bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="bg-yellow-300 border-2 border-black px-4 py-2 font-bold text-2xl hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            ◀
          </button>
          
          <h3 className="text-2xl md:text-3xl font-black uppercase">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={nextMonth}
            className="bg-yellow-300 border-2 border-black px-4 py-2 font-bold text-2xl hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            ▶
          </button>
        </div>

        <button
          onClick={goToToday}
          className="mb-4 bg-blue-300 border-2 border-black px-4 py-2 font-bold hover:bg-blue-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          📍 TODAY
        </button>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {renderCalendar()}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm font-bold">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-300 border-2 border-black"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-300 border-2 border-black"></div>
            <span>Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-300 border-2 border-black"></div>
            <span>Selected</span>
          </div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mt-4 bg-gray-100 border-2 border-black p-4">
            <h4 className="font-bold text-lg mb-2">
              {formatDeadlineDate(selectedDate)}
            </h4>
            {getDeadlinesForDate(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate()
            ).length > 0 ? (
              <div className="space-y-2">
                {getDeadlinesForDate(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate()
                ).map((deadline, idx) => (
                  <div key={idx} className="bg-white border-2 border-black p-2">
                    <div className="font-bold">{deadline.collegeName}</div>
                    {deadline.deadlineType && (
                      <div className="text-sm text-gray-700">{deadline.deadlineType}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">No deadlines on this date</p>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Deadlines Section */}
      <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[800px] overflow-y-auto">
        <h3 className="text-2xl md:text-3xl font-black mb-6 uppercase border-b-4 border-black pb-2">
          ⏰ Upcoming
        </h3>
        
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">😊</div>
            <p className="font-bold">No upcoming deadlines!</p>
            <p className="text-sm text-gray-600 mt-2">Add colleges to see deadlines</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingDeadlines.slice(0, 10).map((deadline, idx) => (
              <div
                key={idx}
                className={`
                  bg-gradient-to-r ${getUrgencyColor(deadline.daysUntil)}
                  border-4 border-black p-4 
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-white border-2 border-black px-3 py-2 text-center min-w-[60px]">
                    <div className="text-xs font-bold uppercase">
                      {new Date(deadline.deadline).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-2xl font-black">
                      {new Date(deadline.deadline).getDate()}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-black text-white mb-1">
                      {deadline.collegeName}
                    </div>
                    {deadline.deadlineType && (
                      <div className="text-sm font-bold text-black bg-white border-2 border-black px-2 py-1 inline-block mb-2">
                        {deadline.deadlineType}
                      </div>
                    )}
                    <div className="text-sm font-bold text-black">
                      {deadline.daysUntil === 0 ? (
                        <span className="bg-red-600 text-white px-2 py-1 border-2 border-black animate-pulse">
                          DUE TODAY!
                        </span>
                      ) : deadline.daysUntil === 1 ? (
                        <span className="bg-orange-500 text-white px-2 py-1 border-2 border-black">
                          Due tomorrow
                        </span>
                      ) : (
                        `${deadline.daysUntil} days away`
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {upcomingDeadlines.length > 10 && (
          <div className="text-center mt-4 font-bold text-sm">
            + {upcomingDeadlines.length - 10} more deadlines
          </div>
        )}
      </div>
    </div>
  );
}