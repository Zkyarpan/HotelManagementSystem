import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../components/utils/api";
import { toast } from "sonner";
import {
  getRoomImage,
  handleImageError,
  getStatusClass,
} from "../components/utils/utils";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'upcoming', 'past'

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const data = await bookingService.getUserBookings();
      console.log("User bookings:", data); // Debug log

      // Handle different response formats
      const bookingsArray = Array.isArray(data)
        ? data
        : data.data && Array.isArray(data.data)
        ? data.data
        : [];

      setBookings(bookingsArray);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to fetch bookings. Please try again later.");
      toast.error("Failed to fetch bookings");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString; // Return the original string if parsing fails
    }
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;

    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const diffTime = Math.abs(checkOutDate - checkInDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      console.error("Error calculating nights:", e);
      return 0;
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);

      // Update the local state
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      toast.success("Booking cancelled successfully");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("Failed to cancel booking. Please try again.");
      toast.error("Failed to cancel booking");
    }
  };

  const filteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case "upcoming":
        return bookings.filter(
          (booking) => new Date(booking.checkInDate) >= today
        );
      case "past":
        return bookings.filter(
          (booking) => new Date(booking.checkOutDate) < today
        );
      default:
        return bookings;
    }
  };

  // Make sure bookings is an array before filtering
  const safeFilteredBookings = Array.isArray(bookings)
    ? filteredBookings()
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {/* Filter Tabs */}
      <div className="flex mb-6 border-b">
        <button
          className={`py-2 px-4 mr-4 ${
            filter === "all"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setFilter("all")}
        >
          All Bookings
        </button>
        <button
          className={`py-2 px-4 mr-4 ${
            filter === "upcoming"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`py-2 px-4 ${
            filter === "past"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setFilter("past")}
        >
          Past
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading your bookings...</p>
        </div>
      ) : error ? (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <p>{error}</p>
        </div>
      ) : safeFilteredBookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            You don't have any {filter !== "all" ? filter : ""} bookings yet.
          </p>
          <Link
            to="/rooms"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Browse Rooms
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {safeFilteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white shadow-md rounded-lg overflow-hidden border"
            >
              <div className="md:flex">
                <div className="md:flex-shrink-0 h-48 md:h-auto md:w-48 bg-gray-300">
                  {booking.room && getRoomImage(booking.room) ? (
                    <img
                      src={getRoomImage(booking.room)}
                      alt={`Room ${booking.room.roomNumber}`}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        handleImageError(e, `Booking ${booking._id}`)
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-grow">
                  <div className="flex flex-wrap justify-between items-start mb-2">
                    <h2 className="text-xl font-bold">
                      Room {booking.room?.roomNumber || "Unknown"}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status
                        ? booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)
                        : "Pending"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600">
                      {formatDate(booking.checkInDate)} &rarr;{" "}
                      {formatDate(booking.checkOutDate)}
                    </p>
                    <p className="text-gray-600">
                      {calculateNights(
                        booking.checkInDate,
                        booking.checkOutDate
                      )}{" "}
                      nights, {booking.guests}{" "}
                      {booking.guests === 1 ? "guest" : "guests"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Total Paid:</p>
                      <p className="text-lg font-bold">
                        $
                        {booking.totalPrice
                          ? booking.totalPrice.toFixed(2)
                          : "0.00"}
                      </p>
                    </div>

                    <div className="space-x-2">
                      {booking.status !== "cancelled" &&
                        booking.status !== "completed" && (
                          <button
                            onClick={() => cancelBooking(booking._id)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded"
                          >
                            Cancel
                          </button>
                        )}
                      <Link to={`/booking-details/${booking._id}`}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
