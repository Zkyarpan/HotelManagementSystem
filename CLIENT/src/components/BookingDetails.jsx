import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

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
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/bookings/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBooking(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch booking details. Please try again later.");
        setLoading(false);
        console.error("Error fetching booking details:", err);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateNights = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const cancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:5000/api/bookings/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state
      setBooking({
        ...booking,
        status: "cancelled",
      });
    } catch (err) {
      setError("Failed to cancel booking. Please try again.");
      console.error("Error cancelling booking:", err);
    }
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
        <Link to="/bookings" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Bookings
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="bg-gray-100 p-4 border-b">
          <div className="flex flex-wrap justify-between items-center">
            <h2 className="text-xl font-bold">
              Booking #{booking._id.substring(0, 8)}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                booking.status
              )}`}
            >
              {booking.status?.charAt(0).toUpperCase() +
                booking.status?.slice(1) || "Unknown"}
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
                    ${booking.totalPrice.toFixed(2)}
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
                    {booking.room.images && booking.room.images.length > 0 ? (
                      <img
                        src={booking.room.images[0]}
                        alt={`Room ${booking.room.roomNumber}`}
                        className="w-full h-full object-cover"
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
                    <p className="font-medium">{booking.room.roomNumber}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Room Type</p>
                    <p className="font-medium">{booking.room.type}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Floor</p>
                    <p className="font-medium">{booking.room.floor}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Price per Night</p>
                    <p className="font-medium">
                      ${booking.room.pricePerNight}/night
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Amenities</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {booking.room.amenities &&
                        booking.room.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
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
                {new Date(booking.createdAt).toLocaleString()}
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
