import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import api from "./utils/api";

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
  });

  // Get auth context to access user data
  const { auth } = useContext(AuthContext);
  const user = auth?.user || {};

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user's bookings
        const bookingsResponse = await api.get("/api/bookings/my-bookings");

        // Fetch available rooms
        const roomsResponse = await api.get("/api/rooms");

        // Ensure we have arrays (defensive coding)
        const bookingsData = Array.isArray(bookingsResponse.data)
          ? bookingsResponse.data
          : [];
        const roomsData = Array.isArray(roomsResponse.data)
          ? roomsResponse.data
          : [];

        setBookings(bookingsData);
        setRooms(roomsData);

        // Calculate dashboard stats
        const today = new Date();
        const upcomingBookings = bookingsData.filter(
          (booking) =>
            new Date(booking.checkInDate) > today &&
            booking.status !== "cancelled"
        );

        const totalSpent = bookingsData.reduce(
          (sum, booking) =>
            booking.status !== "cancelled"
              ? sum + (booking.totalPrice || 0)
              : sum,
          0
        );

        setStats({
          totalBookings: bookingsData.length,
          upcomingBookings: upcomingBookings.length,
          totalSpent: totalSpent,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.name || "Guest"}
        </h1>
        <p className="text-gray-600">
          Here's an overview of your hotel activities
        </p>
      </div>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            Total Bookings
          </h2>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalBookings}
          </p>
          <Link
            to="/bookings"
            className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
          >
            View all bookings →
          </Link>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Upcoming Stays
          </h2>
          <p className="text-3xl font-bold text-green-600">
            {stats.upcomingBookings}
          </p>
          <Link
            to="/bookings"
            className="text-green-600 hover:text-green-800 text-sm mt-2 inline-block"
          >
            View upcoming stays →
          </Link>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-purple-800 mb-2">
            Total Spent
          </h2>
          <p className="text-3xl font-bold text-purple-600">
            ${stats.totalSpent.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/rooms">
            <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-colors">
              <span className="text-2xl">🏨</span>
              <h3 className="font-semibold mt-2">Browse Rooms</h3>
              <p className="text-sm text-blue-100 mt-1">
                Find and book available rooms
              </p>
            </div>
          </Link>

          <Link to="/bookings">
            <div className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 text-center transition-colors">
              <span className="text-2xl">📅</span>
              <h3 className="font-semibold mt-2">Manage Bookings</h3>
              <p className="text-sm text-green-100 mt-1">
                View or modify your bookings
              </p>
            </div>
          </Link>

          {user.role === "admin" && (
            <Link to="/admin/dashboard">
              <div className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 text-center transition-colors">
                <span className="text-2xl">⚙️</span>
                <h3 className="font-semibold mt-2">Admin Panel</h3>
                <p className="text-sm text-purple-100 mt-1">
                  Manage the hotel system
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Bookings</h2>
          <Link to="/bookings" className="text-blue-600 hover:text-blue-800">
            View all →
          </Link>
        </div>

        {Array.isArray(bookings) && bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.room?.roomNumber ||
                          booking.room?.name ||
                          "Room"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.room?.type || "Standard"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.checkInDate)} -{" "}
                        {formatDate(booking.checkOutDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.guests}{" "}
                        {booking.guests === 1 ? "guest" : "guests"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : booking.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status?.charAt(0).toUpperCase() +
                          booking.status?.slice(1) || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(booking.totalPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/booking-details/${booking._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500 mb-4">
              You don't have any bookings yet
            </p>
            <Link
              to="/rooms"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Browse Rooms
            </Link>
          </div>
        )}
      </div>

      {/* Available Rooms Preview */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Featured Rooms</h2>
          <Link to="/rooms" className="text-blue-600 hover:text-blue-800">
            View all →
          </Link>
        </div>

        {Array.isArray(rooms) && rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rooms
              .filter(
                (room) =>
                  room.isAvailable !== false &&
                  (!room.status || room.status === "Ready")
              )
              .slice(0, 3)
              .map((room) => (
                <div
                  key={room._id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={`Room ${room.roomNumber}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full text-sm">
                      ${room.pricePerNight || room.price || 0}/night
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">
                      Room {room.roomNumber || room.name || ""}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {room.type} - {room.capacity}{" "}
                      {room.capacity === 1 ? "person" : "people"}
                    </p>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>
                    <Link
                      to={`/booking/${room._id}`}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">No rooms available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
