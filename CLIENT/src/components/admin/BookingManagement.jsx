import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, RefreshCw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { getStatusClass } from "../utils/utils";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("confirmed");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Attempting to fetch admin bookings...");

      // Instead of using `/api/bookings/all` which causes MongoDB ObjectId conversion error,
      // use a query parameter approach
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Try to get all bookings with a query parameter
      const response = await axios.get("http://localhost:5000/api/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          admin: true, // Add a query parameter to identify admin request
        },
      });

      console.log("Admin bookings response:", response);

      // Handle different response formats
      const data = response.data;
      const bookingsArray = Array.isArray(data)
        ? data
        : data.data && Array.isArray(data.data)
        ? data.data
        : [];

      setBookings(bookingsArray);
      setLoading(false);

      if (bookingsArray.length === 0) {
        console.log("No bookings found in the response");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(
        `Failed to fetch bookings: ${
          err.response?.data?.message || err.message
        }`
      );
      setBookings([]);
      setLoading(false);
      toast.error("Failed to load bookings data");
    }
  };

  const openStatusModal = (booking) => {
    setBookingToUpdate(booking);
    setNewStatus(booking.status || "confirmed");
    setStatusModalOpen(true);
  };

  const updateBookingStatus = async () => {
    if (!bookingToUpdate) return;

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingToUpdate._id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update state
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingToUpdate._id
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      setStatusModalOpen(false);
      setBookingToUpdate(null);
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError("Failed to update booking status. Please try again.");
      toast.error("Failed to update booking status");
    }
  };

  // Filter bookings by status and search query
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = !filterStatus || booking.status === filterStatus;

    const matchesSearch =
      !searchQuery ||
      (booking.user?.name &&
        booking.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.user?.email &&
        booking.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking._id && booking._id.includes(searchQuery));

    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const options = { year: "numeric", month: "short", day: "numeric" };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error("Date formatting error:", err);
      return dateString;
    }
  };

  const handleRefresh = () => {
    setFilterStatus("");
    setSearchQuery("");
    fetchBookings();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-gray-500">Manage hotel bookings</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-2 rounded-md"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          <span className="ml-2">Loading bookings...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Filters and search */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div>
              <h2 className="text-lg font-semibold mb-1">Filters</h2>
              <p className="text-gray-500 text-sm mb-4">
                Filter and search bookings
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by guest name, email or booking ID
                </label>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-4 mt-4">
              <div className="text-sm text-gray-500">
                {filteredBookings.length}{" "}
                {filteredBookings.length === 1 ? "booking" : "bookings"} found
              </div>
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setFilterStatus("");
                  setSearchQuery("");
                }}
              >
                Reset filters
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                      >
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking._id
                            ? `${booking._id.substring(0, 8)}...`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user?.name || "Guest"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.user?.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Room {booking.room?.roomNumber || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.room?.type || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(booking.checkInDate)} -{" "}
                            {formatDate(booking.checkOutDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.guests || 1}{" "}
                            {booking.guests === 1 ? "guest" : "guests"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${booking.totalPrice?.toFixed(2) || "0.00"}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              className="p-1 border border-gray-300 rounded-md hover:bg-gray-100"
                              onClick={() => openStatusModal(booking)}
                              title="Change Status"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </button>
                            <Link
                              to={`/booking-details/${booking._id}`}
                              className="p-1 border border-gray-300 rounded-md hover:bg-gray-100"
                              title="View Details"
                            >
                              <span className="text-xs px-2 py-0.5 text-blue-600">
                                View
                              </span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">
              Update Booking Status
            </h3>
            <p className="text-gray-600 mb-4">
              Change the status of the booking for{" "}
              {bookingToUpdate?.user?.name || "Guest"}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                onClick={() => setStatusModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={updateBookingStatus}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
