import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  Edit2,
  Plus,
  Trash2,
  Save,
  BarChart3,
  PieChart,
  Target,
  BookOpen,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";

function App() {
  let initialTimeSlots = localStorage.getItem("time-tracker-initial-slots");
  if (initialTimeSlots) {
    console.log(initialTimeSlots);
    initialTimeSlots = JSON.parse(initialTimeSlots);
  } else {
    const initialTimeSlots = [
      {
        id: 1,
        time: "5:30am-8am",
        hours: "00:00:00",
        possibleHours: "02:30:00",
        note: "",
      },
      {
        id: 2,
        time: "9am-1pm",
        hours: "00:00:00",
        possibleHours: "04:00:00",
        note: "",
      },
      {
        id: 3,
        time: "2pm-4pm",
        hours: "00:00:00",
        possibleHours: "02:00:00",
        note: "",
      },
      {
        id: 4,
        time: "4pm-8pm",
        hours: "00:00:00",
        possibleHours: "04:00:00",
        note: "",
      },
      {
        id: 5,
        time: "8pm-9pm",
        hours: "00:00:00",
        possibleHours: "01:00:00",
        note: "",
      },
    ];

    localStorage.setItem(
      "time-tracker-initial-slots",
      JSON.stringify(initialTimeSlots)
    );
  }

  const LOCAL_STORAGE_KEY = "time-tracker-app";

  const [data, setData] = useState(initialTimeSlots);
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("daily"); // daily, weekly, comparison, statistics
  const [savedDates, setSavedDates] = useState(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : {};
  });
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: "",
    endTime: "",
    possibleHours: "01:00:00",
  });

  useEffect(() => {
    if (Object.keys(savedDates).length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedDates));
    }
  }, [savedDates]);

  useEffect(() => {
    // If there is any data for today's date, then fetch it
    if (savedDates[formatDate(selectedDate)]) {
      setData(savedDates[formatDate(selectedDate)]);
    } else {
      setData(initialTimeSlots);
    }
    return;
  }, [selectedDate]);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const changeInitialTimeSlot = () => {
    initialTimeSlots = [];
    data.forEach((slot) => {
      initialTimeSlots.push({
        id: slot.id,
        time: slot.time,
        hours: "00:00:00",
        possibleHours: slot.possibleHours,
        note: "",
      });
    });

    localStorage.setItem(
      "time-tracker-initial-slots",
      JSON.stringify(initialTimeSlots)
    );
  };

  const formatDateKey = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleHoursChange = (index, value) => {
    const newData = [...data];
    newData[index].hours = value;
    setData(newData);
  };

  const handleNoteChange = (index, value) => {
    const newData = [...data];
    newData[index].note = value;
    setData(newData);
  };

  const handleEditSlot = (index) => {
    setEditingSlot(index);
  };

  const handleSaveSlot = (index) => {
    setEditingSlot(null);
    // Save to backend here
  };

  const handleDeleteSlot = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const handleAddSlot = () => {
    if (newSlot.startTime && newSlot.endTime) {
      const newSlotData = {
        id: Date.now(),
        time: `${newSlot.startTime}-${newSlot.endTime}`,
        hours: "00:00:00",
        possibleHours: newSlot.possibleHours,
        note: "",
      };
      setData([...data, newSlotData]);
      setNewSlot({ startTime: "", endTime: "", possibleHours: "01:00:00" });
      setShowAddSlot(false);
    }
  };

  const calculateTotalHours = (dataSet = data) => {
    return dataSet.reduce((total, row) => {
      const [hours, minutes, seconds] = row.hours.split(":").map(Number);
      return total + hours * 3600 + minutes * 60 + seconds;
    }, 0);
  };

  const calculateEfficiency = (dataSet = data) => {
    const totalStudied = calculateTotalHours(dataSet);
    const totalPossible = dataSet.reduce((total, row) => {
      const [hours, minutes, seconds] = row.possibleHours
        .split(":")
        .map(Number);
      return total + hours * 3600 + minutes * 60 + seconds;
    }, 0);
    return totalPossible > 0
      ? ((totalStudied / totalPossible) * 100).toFixed(1)
      : 0;
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getWeeklyStats = () => {
    const weekDays = [];
    const startDate = new Date(selectedDate);

    // Always show the data from 1 week past
    startDate.setDate(startDate.getDate() - 7);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = formatDate(date);

      const dayData = savedDates[dateKey] || [];
      //   console.log(dateKey, dayData);
      weekDays.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: formatDate(date),
        hours: calculateTotalHours(dayData) / 3600,
        efficiency: calculateEfficiency(dayData),
      });
    }
    return weekDays;
  };

  const getBestTimeSlot = () => {
    const slotStats = {};
    Object.values(savedDates).forEach((dayData) => {
      dayData.forEach((slot) => {
        if (!slotStats[slot.time]) {
          slotStats[slot.time] = { total: 0, count: 0 };
        }
        const [h, m, s] = slot.hours.split(":").map(Number);
        slotStats[slot.time].total += h + m / 60 + s / 3600;
        slotStats[slot.time].count++;
      });
    });

    let bestSlot = { time: "N/A", avg: 0 };
    Object.entries(slotStats).forEach(([time, stats]) => {
      const avg = stats.total / stats.count;
      if (avg > bestSlot.avg) {
        bestSlot = { time, avg };
      }
    });

    return bestSlot;
  };

  const saveTime = () => {
    savedDates[date] = data;
  };

  const renderDailyView = () => (
    <div className="space-y-6 text-gray-200">
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl">
        <button
          onClick={() =>
            setSelectedDate(
              new Date(selectedDate.setDate(selectedDate.getDate() - 1))
            )
          }
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        </button>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <input
            type="date"
            value={formatDateKey(selectedDate)}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={() =>
            setSelectedDate(
              new Date(selectedDate.setDate(selectedDate.getDate() + 1))
            )
          }
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Time Slots Table */}
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Slots for {formatDate(selectedDate)}
          </h3>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-300">
                  Time Slot
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">
                  Study Time
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">
                  Target Time
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">
                  Notes
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                >
                  <td className="py-3 px-4">
                    {editingSlot === index ? (
                      <input
                        type="text"
                        value={row.time}
                        onChange={(e) => {
                          const newData = [...data];
                          newData[index].time = e.target.value;
                          setData(newData);
                        }}
                        className="px-2 py-1 border border-gray-700 bg-gray-800 text-gray-200 rounded"
                      />
                    ) : (
                      <span className="font-medium text-gray-200">
                        {row.time}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="time"
                      step="1"
                      value={row.hours}
                      onChange={(e) => handleHoursChange(index, e.target.value)}
                      className="px-3 py-1 border border-gray-700 bg-gray-800 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    {editingSlot === index ? (
                      <input
                        type="time"
                        step="1"
                        value={row.possibleHours}
                        onChange={(e) => {
                          const newData = [...data];
                          newData[index].possibleHours = e.target.value + ":00";
                          setData(newData);
                        }}
                        className="px-3 py-1 border border-gray-700 bg-gray-800 text-gray-200 rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400">{row.possibleHours}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={row.note}
                      onChange={(e) => handleNoteChange(index, e.target.value)}
                      placeholder="Add notes..."
                      className="w-full px-3 py-1 border border-gray-700 bg-gray-800 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {editingSlot === index ? (
                        <button
                          onClick={() => handleSaveSlot(index)}
                          className="p-1 text-green-400 hover:bg-green-900 rounded cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditSlot(index)}
                          className="p-1 text-blue-400 hover:bg-blue-900 rounded cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSlot(index)}
                        className="p-1 text-red-400 hover:bg-red-900 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add New Slot */}
          {showAddSlot ? (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 8pm"
                    value={newSlot.startTime}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, startTime: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-700 bg-gray-900 text-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 10pm"
                    value={newSlot.endTime}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, endTime: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-700 bg-gray-900 text-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Target Hours
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={newSlot.possibleHours}
                    onChange={(e) =>
                      setNewSlot({
                        ...newSlot,
                        possibleHours: e.target.value + ":00",
                      })
                    }
                    className="px-3 py-2 border border-gray-700 bg-gray-900 text-gray-200 rounded-lg"
                  />
                </div>
                <button
                  onClick={handleAddSlot}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                >
                  Add Slot
                </button>
                <button
                  onClick={() => setShowAddSlot(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <button
                onClick={() => setShowAddSlot(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Time Slot
              </button>

              <button
                onClick={() => changeInitialTimeSlot()}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Custom Time Slot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-700 to-emerald-800 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Total Study Time</p>
              <p className="text-3xl font-bold mt-1">
                {formatTime(calculateTotalHours())}
              </p>
            </div>
            <BookOpen className="w-10 h-10 text-green-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Efficiency</p>
              <p className="text-3xl font-bold mt-1">
                {calculateEfficiency()}%
              </p>
            </div>
            <Target className="w-10 h-10 text-blue-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-700 to-pink-800 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Time Wasted</p>
              <p className="text-3xl font-bold mt-1">
                {formatTime(
                  data.reduce((total, row) => {
                    const [ph, pm, ps] = row.possibleHours
                      .split(":")
                      .map(Number);
                    const [h, m, s] = row.hours.split(":").map(Number);
                    return (
                      total +
                      (ph * 3600 + pm * 60 + ps) -
                      (h * 3600 + m * 60 + s)
                    );
                  }, 0)
                )}
              </p>
            </div>
            <AlertCircle className="w-10 h-10 text-purple-300" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        className="w-full py-3 bg-gradient-to-r from-indigo-700 to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
        onClick={() => saveTime()}
      >
        <Save className="w-5 h-5" />
        Save Today's Progress
      </button>
    </div>
  );

  const renderWeeklyView = () => {
    const weekData = getWeeklyStats();
    const maxHours = Math.max(...weekData.map((d) => d.hours));

    return (
      <div className="space-y-6 text-gray-200">
        <div className="bg-gray-900 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Weekly Overview
          </h3>

          {/* Bar Chart */}
          <div className="space-y-4">
            {weekData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-400">
                  {day.day}
                </div>
                <div className="flex-1 bg-gray-800 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${
                        maxHours > 0 ? (day.hours / maxHours) * 100 : 0
                      }%`,
                    }}
                  >
                    <span className="text-white text-sm font-semibold">
                      {day.hours.toFixed(1)}h
                    </span>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-400">
                  {day.efficiency}%
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Stats */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-900 rounded-lg">
              <p className="text-sm text-gray-300">Avg Daily Hours</p>
              <p className="text-2xl font-bold text-blue-400">
                {(weekData.reduce((sum, d) => sum + d.hours, 0) / 7).toFixed(1)}
                h
              </p>
            </div>
            <div className="text-center p-4 bg-green-900 rounded-lg">
              <p className="text-sm text-gray-300">Best Day</p>
              <p className="text-2xl font-bold text-green-400">
                {
                  weekData.reduce(
                    (best, d) => (d.hours > best.hours ? d : best),
                    weekData[0]
                  ).day
                }
              </p>
            </div>
            <div className="text-center p-4 bg-purple-900 rounded-lg">
              <p className="text-sm text-gray-300">Week Efficiency</p>
              <p className="text-2xl font-bold text-purple-400">
                {(
                  weekData.reduce(
                    (sum, d) => sum + parseFloat(d.efficiency),
                    0
                  ) / 7
                ).toFixed(1)}
                %
              </p>
            </div>

            <div className="text-center p-4 bg-red-900 rounded-lg">
              <p className="text-sm text-gray-300">Week Hours</p>
              <p className="text-2xl font-bold text-red-400">
                {weekData
                  .reduce((sum, d) => sum + parseFloat(d.hours), 0)
                  .toFixed(1)}
                h
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatisticsView = () => {
    const bestSlot = getBestTimeSlot();
    const totalDays = Object.keys(savedDates).length;
    const totalHoursAllTime = Object.values(savedDates).reduce(
      (sum, dayData) => sum + calculateTotalHours(dayData) / 3600,
      0
    );

    return (
      <div className="space-y-6 text-gray-200">
        <div className="gap-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Stats */}
            <div className="bg-gray-900 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-indigo-400" />
                Overall Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Total Days Tracked</span>
                  <span className="font-semibold text-pink-400">
                    {totalDays} days
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Total Hours Studied</span>
                  <span className="font-semibold text-blue-400">
                    {totalHoursAllTime.toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Average Weekly Hours</span>
                  <span className="font-semibold text-red-400">
                    {totalDays > 0
                      ? ((totalHoursAllTime * 7) / totalDays).toFixed(1)
                      : 0}
                    h
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">Average Daily Hours</span>
                  <span className="font-semibold text-green-400">
                    {totalDays > 0
                      ? (totalHoursAllTime / totalDays).toFixed(1)
                      : 0}
                    h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-6 text-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-100 mb-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
            Study Time Tracker Pro
          </h1>

          {/* View Mode Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { id: "daily", label: "Daily", icon: Calendar },
              { id: "weekly", label: "Weekly", icon: BarChart3 },
              { id: "statistics", label: "Statistics", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === tab.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-300">
          {viewMode === "daily" && renderDailyView()}
          {viewMode === "weekly" && renderWeeklyView()}
          {viewMode === "statistics" && renderStatisticsView()}
        </div>
      </div>
    </div>
  );
}

export default App;
