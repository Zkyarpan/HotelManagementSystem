import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { roomService, bookingService } from "../utils/api";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    monthlyRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching dashboard data...");

      // Fetch rooms with better error handling
      let rooms = [];
      try {
        console.log("Fetching rooms...");
        const roomsResponse = await roomService.getAllRooms();
        console.log("Rooms response:", roomsResponse);

        if (roomsResponse && roomsResponse.data) {
          rooms = roomsResponse.data;
        }
      } catch (roomError) {
        console.error("Error fetching rooms:", roomError);
        toast.error("Failed to fetch rooms data");
      }

      // Fetch bookings with better error handling
      let bookings = [];
      try {
        console.log("Fetching bookings...");

        // Use the query parameter approach we fixed in the previous conversation
        const bookingsResponse = await fetch(
          "http://localhost:5000/api/bookings?admin=true",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!bookingsResponse.ok) {
          throw new Error(`API error: ${bookingsResponse.status}`);
        }

        const bookingsData = await bookingsResponse.json();
        console.log("Bookings response:", bookingsData);

        if (Array.isArray(bookingsData)) {
          bookings = bookingsData;
        } else if (bookingsData && Array.isArray(bookingsData.data)) {
          bookings = bookingsData.data;
        }
      } catch (bookingError) {
        console.error("Error fetching bookings:", bookingError);
        toast.error("Failed to fetch bookings data");
      }

      // Process data for stats
      const availableRooms = rooms.filter((room) => room.isAvailable).length;

      // Get today's date in the correct format for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      // Count check-ins and check-outs for today
      const checkIns = bookings.filter((booking) => {
        if (!booking.checkInDate) return false;
        const bookingDate = new Date(booking.checkInDate)
          .toISOString()
          .split("T")[0];
        return bookingDate === todayStr;
      }).length;

      const checkOuts = bookings.filter((booking) => {
        if (!booking.checkOutDate) return false;
        const bookingDate = new Date(booking.checkOutDate)
          .toISOString()
          .split("T")[0];
        return bookingDate === todayStr;
      }).length;

      // Count pending bookings
      const pendingBookings = bookings.filter(
        (booking) => booking.status === "pending"
      ).length;

      // Calculate revenue from non-cancelled bookings
      const revenue = bookings
        .filter((booking) => booking.status !== "cancelled")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

      // Set stats
      setStats({
        totalRooms: rooms.length,
        availableRooms,
        totalBookings: bookings.length,
        pendingBookings,
        todayCheckIns: checkIns,
        todayCheckOuts: checkOuts,
        monthlyRevenue: revenue,
      });

      // Get recent bookings (latest 5)
      const sortedBookings = [...bookings].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      setRecentBookings(sortedBookings.slice(0, 5));

      setLoading(false);
      console.log("Dashboard data loaded successfully");
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error("Date formatting error:", err);
      return "N/A";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast.info("Refreshing dashboard data...");
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">
            Overview of your hotel management system.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Rooms</p>
              <h3 className="text-3xl font-bold">{stats.totalRooms}</h3>
            </div>
            <span className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </span>
          </div>
          <p className="text-green-600 text-sm mt-2">
            {stats.availableRooms} Available
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Available Rooms</p>
              <h3 className="text-3xl font-bold">{stats.availableRooms}</h3>
            </div>
            <span className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </span>
          </div>
          <p className="text-blue-600 text-sm mt-2">
            {stats.totalRooms
              ? ((stats.availableRooms / stats.totalRooms) * 100).toFixed(0)
              : 0}
            % Occupancy
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <h3 className="text-3xl font-bold">{stats.totalBookings}</h3>
            </div>
            <span className="bg-purple-100 h-10 w-10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </span>
          </div>
          <p className="text-yellow-600 text-sm mt-2">
            {stats.pendingBookings} Pending
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Activity</p>
              <h3 className="text-3xl font-bold">
                {stats.todayCheckIns + stats.todayCheckOuts}
              </h3>
            </div>
            <span className="bg-indigo-100 h-10 w-10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </span>
          </div>
          <div className="flex space-x-4 text-sm mt-2">
            <span className="text-green-600">
              {stats.todayCheckIns} Check-ins
            </span>
            <span className="text-blue-600">
              {stats.todayCheckOuts} Check-outs
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Monthly Revenue</p>
              <h3 className="text-3xl font-bold">
                ${stats.monthlyRevenue.toFixed(2)}
              </h3>
            </div>
            <span className="bg-yellow-100 h-10 w-10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-2">From confirmed bookings</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/rooms/new"
            className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <span className="bg-blue-100 p-2 rounded-md mr-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
            </span>
            <div>
              <h3 className="font-medium text-blue-800">Add New Room</h3>
              <p className="text-sm text-blue-600">Create a new room listing</p>
            </div>
          </Link>

          <Link
            to="/admin/rooms"
            className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
          >
            <span className="bg-green-100 p-2 rounded-md mr-3">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
            </span>
            <div>
              <h3 className="font-medium text-green-800">Manage Rooms</h3>
              <p className="text-sm text-green-600">
                Edit or update room details
              </p>
            </div>
          </Link>

          <Link
            to="/admin/bookings"
            className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors"
          >
            <span className="bg-purple-100 p-2 rounded-md mr-3">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                ></path>
              </svg>
            </span>
            <div>
              <h3 className="font-medium text-purple-800">Manage Bookings</h3>
              <p className="text-sm text-purple-600">
                View and update reservations
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Bookings</h2>
          <Link
            to="/admin/bookings"
            className="text-blue-600 hover:text-blue-800"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                  >
                    No recent bookings found
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking._id?.substring(0, 8) || "N/A"}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.user?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Room {booking.room?.roomNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.checkInDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status
                          ? booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)
                          : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.totalPrice?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
