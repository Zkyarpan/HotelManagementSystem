import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookingService } from "../components/utils/api";
import { toast } from "sonner";
import {
  getFullImageUrl,
  handleImageError,
  getStatusClass,
} from "../components/utils/utils";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);

        console.log("Fetching booking details for ID:", id);
        const data = await bookingService.getBookingById(id);
        console.log("Booking details response:", data);

        setBooking(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError("Failed to fetch booking details. Please try again later.");
        toast.error("Failed to fetch booking details");
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error("Date formatting error:", err);
      return dateString;
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
    } catch (err) {
      console.error("Error calculating nights:", err);
      return 0;
    }
  };

  const cancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const response = await bookingService.cancelBooking(id);
      console.log("Cancel booking response:", response);

      // Update the local state
      setBooking({
        ...booking,
        status: "cancelled",
      });

      toast.success("Booking cancelled successfully");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("Failed to cancel booking. Please try again.");
      toast.error("Failed to cancel booking");
    }
  };

  // Get room image with proper error handling
  const getRoomImage = (room) => {
    if (!room || !room.images || !room.images.length) {
      return null;
    }

    return getFullImageUrl(room.images[0]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
          role="alert"
        >
          <p>{error}</p>
          <button
            onClick={() => navigate("/bookings")}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
          role="alert"
        >
          <p>Booking not found.</p>
          <button
            onClick={() => navigate("/bookings")}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Booking Details</h1>
        <Link
          to="/bookings"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl"
        >
          Back to Bookings
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="bg-gray-100 p-4 border-b">
          <div className="flex flex-wrap justify-between items-center">
            <h2 className="text-xl font-bold">
              Booking #{booking._id ? booking._id.substring(0, 8) : "N/A"}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                booking.status
              )}`}
            >
              {booking.status
                ? booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)
                : "Unknown"}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Booking Information
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Check-in Date</p>
                  <p className="font-medium">
                    {formatDate(booking.checkInDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Check-out Date</p>
                  <p className="font-medium">
                    {formatDate(booking.checkOutDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">
                    {calculateNights(booking.checkInDate, booking.checkOutDate)}{" "}
                    nights
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-medium">
                    {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="text-xl font-bold">
                    $
                    {booking.totalPrice
                      ? booking.totalPrice.toFixed(2)
                      : "0.00"}
                  </p>
                </div>

                {booking.specialRequests && (
                  <div>
                    <p className="text-sm text-gray-500">Special Requests</p>
                    <p className="italic bg-gray-50 p-3 rounded">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Room Information</h3>

              {booking.room ? (
                <div className="space-y-3">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    {getRoomImage(booking.room) ? (
                      <img
                        src={getRoomImage(booking.room)}
                        alt={`Room ${booking.room.roomNumber}`}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          handleImageError(e, `Room ${booking.room.roomNumber}`)
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">
                          No image available
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Room Number</p>
                    <p className="font-medium">
                      {booking.room.roomNumber || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Room Type</p>
                    <p className="font-medium">
                      {booking.room.type || "Standard"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Floor</p>
                    <p className="font-medium">{booking.room.floor || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Price per Night</p>
                    <p className="font-medium">
                      ${booking.room.pricePerNight || 0}/night
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Amenities</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {booking.room.amenities &&
                      booking.room.amenities.length > 0 ? (
                        booking.room.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">
                          No amenities listed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Room information not available</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Booking Created</p>
              <p className="font-medium">
                {booking.createdAt
                  ? new Date(booking.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            <div>
              {booking.status !== "cancelled" &&
                booking.status !== "completed" && (
                  <button
                    onClick={cancelBooking}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded mr-2"
                  >
                    Cancel Booking
                  </button>
                )}
              <button
                onClick={() => window.print()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
              >
                Print Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
