import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiSearch, FiChevronDown, FiFileText, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const sortOptions = [
  { label: "Newest First",    value: "appealCreatedAt:desc" },
  { label: "Oldest First",    value: "appealCreatedAt:asc" },
  { label: "Subject A→Z",     value: "subjectName:asc" },
  { label: "Subject Z→A",     value: "subjectName:desc" },
  { label: "Course A→Z",      value: "courseTitle:asc" },
  { label: "Course Z→A",      value: "courseTitle:desc" }
];

const getStatusIcon = (status) => {
  switch (status) {
    case "open":
      return <FiClock className="w-4 h-4 text-blue-500" />;
    case "resolved":
      return <FiCheckCircle className="w-4 h-4 text-green-500" />;
    case "rejected":
      return <FiXCircle className="w-4 h-4 text-red-500" />;
    default:
      return <FiFileText className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "resolved":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getGradeColor = (score) => {
  if (score == null) return "text-gray-500";
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-yellow-600";
  return "text-red-600";
};

export default function AppealList() {
  const navigate = useNavigate();

  // Lấy studentId từ localStorage hoặc mặc định
  const DEFAULT_STUDENT_ID = "60a000000000000000000002";
  const [studentId, setStudentId] = useState(DEFAULT_STUDENT_ID);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u._id) setStudentId(u._id);
      }
    } catch (e) {
      console.warn("Error parsing user from localStorage:", e);
    }
  }, []);

  // State
  const [appeals, setAppeals] = useState([]);   // Gốc
  const [filtered, setFiltered] = useState([]); // Sau filter+sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("appealCreatedAt");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch appeals của student
  const fetchAppeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get(`/api/student/appeals?studentId=${studentId}`);
      if (resp.data.success) {
        setAppeals(resp.data.data);
        setFiltered(resp.data.data);
      }
    } catch (err) {
      console.error("Error fetching appeals:", err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  // 2. Filter + Sort
  useEffect(() => {
    let temp = [...appeals];

    // 2.1. Filter theo searchQuery: tìm trong subjectName || courseTitle
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      temp = temp.filter(
        (a) =>
          regex.test(a.subjectName) || regex.test(a.courseTitle)
      );
    }

    // 2.2. Sort
    temp.sort((a, b) => {
      let fieldA, fieldB;

      switch (sortBy) {
        case "appealCreatedAt":
          fieldA = new Date(a.appealCreatedAt).getTime();
          fieldB = new Date(b.appealCreatedAt).getTime();
          break;
        case "subjectName":
          fieldA = a.subjectName?.toLowerCase() || "";
          fieldB = b.subjectName?.toLowerCase() || "";
          break;
        case "courseTitle":
          fieldA = a.courseTitle?.toLowerCase() || "";
          fieldB = b.courseTitle?.toLowerCase() || "";
          break;
        default:
          fieldA = new Date(a.appealCreatedAt).getTime();
          fieldB = new Date(b.appealCreatedAt).getTime();
      }

      if (fieldA < fieldB) return order === "asc" ? -1 : 1;
      if (fieldA > fieldB) return order === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(temp);
  }, [appeals, searchQuery, sortBy, order]);

  // 3. Handle sort change
  const handleSortChange = (value) => {
    const [field, ord] = value.split(":");
    setSortBy(field);
    setOrder(ord);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-6 py-3 mb-8 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft size={20} />
          <span className="ml-2 font-medium">Back to Dashboard</span>
        </motion.button>

        {/* Header */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center">
            <div className="bg-white/20 rounded-full p-3 mr-4">
              <FiFileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                My Appeals
              </h1>
              <p className="text-blue-100 text-lg">
                Track and manage your grade appeals
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search + Sort */}
        <motion.div
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 space-y-4 lg:space-y-0 lg:space-x-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search Input */}
          <div className="relative flex-1 w-full lg:max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by subject or course name..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full lg:w-72">
            <select
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg transition-all duration-300"
              value={`${sortBy}:${order}`}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400" />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <FiFileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Appeals</p>
                <p className="text-2xl font-bold text-gray-900">{appeals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appeals.filter(a => a.appealStatus === "open").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appeals.filter(a => a.appealStatus === "resolved").length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appeal List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-4 text-gray-600 text-lg">Loading appeals...</span>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-xl">No appeals found.</p>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filtered.map((a, index) => (
              <motion.div
                key={a.appealId}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-gray-900 mr-3">
                        {a.subjectName}
                      </h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(a.appealStatus)}`}>
                        {getStatusIcon(a.appealStatus)}
                        <span className="ml-1 capitalize">{a.appealStatus}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-lg mb-2">
                      <span className="font-medium">Course:</span> {a.courseTitle}
                    </p>
                  </div>
                  <div className="flex flex-col lg:items-end space-y-2">
                    <span className="text-sm text-gray-500">
                      {new Date(a.appealCreatedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Grade:</span>
                      {a.gradeScore != null ? (
                        <span className={`text-xl font-bold ${getGradeColor(a.gradeScore)}`}>
                          {a.gradeScore}/10
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not graded</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">Latest Comment:</span>{" "}
                    {a.appealComments.length
                      ? a.appealComments[a.appealComments.length - 1].text
                      : "No comments available"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}