import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { roomService, bookingService } from "../components/utils/api";
import { toast } from "sonner";
import {
  getRoomImage,
  handleImageError,
} from "../components/utils/utils";

const Booking = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await roomService.getRoomById(roomId);
        console.log("Room data:", response); // Log for debugging

        if (!response) {
          throw new Error("No room data received");
        }

        setRoom(response);
        setGuests(1); // Default to 1 guest
        setLoading(false);
      } catch (err) {
        console.error("Error fetching room:", err);
        setError("Failed to fetch room details. Please try again later.");
        toast.error("Failed to fetch room details");
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  // Calculate the difference in days between check-in and check-out
  const calculateNights = () => {
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate the total price
  const calculateTotalPrice = () => {
    if (!room) return 0;
    return room.pricePerNight * calculateNights();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomId || !checkInDate || !checkOutDate || !guests) {
      setError("Please provide all required booking information.");
      toast.error("Please provide all required booking information");
      return;
    }

    try {
      setIsSubmitting(true);

      // Format dates properly for the API
      const formattedCheckInDate = checkInDate.toISOString();
      const formattedCheckOutDate = checkOutDate.toISOString();

      const bookingData = {
        roomId,
        checkInDate: formattedCheckInDate,
        checkOutDate: formattedCheckOutDate,
        guests,
        specialRequests,
        totalPrice: calculateTotalPrice(),
      };

      console.log("Sending booking data:", bookingData); // Log for debugging

      const response = await bookingService.createBooking(bookingData);
      console.log("Booking response:", response); // Log for debugging

      toast.success("Booking successful!");
      setBookingSuccess(true);

      // Reset form
      setSpecialRequests("");

      // Auto redirect after success
      setTimeout(() => {
        navigate("/bookings");
      }, 3000);
    } catch (err) {
      console.error("Error creating booking:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to create booking. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading room details...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
          role="alert"
        >
          <p>{error}</p>
          <button
            onClick={() => navigate("/rooms")}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
          role="alert"
        >
          <p className="font-bold">Booking Successful!</p>
          <p>
            Your room has been booked successfully. Redirecting to your
            bookings...
          </p>
        </div>
      </div>
    );
  }

  const roomImageUrl = getRoomImage(room);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book Room</h1>

      {room && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Room Details */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="h-64 bg-gray-300 relative">
              {roomImageUrl ? (
                <img
                  src={roomImageUrl}
                  alt={`Room ${room.roomNumber}`}
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    handleImageError(e, `Room ${room.roomNumber}`)
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                Room {room.roomNumber}
              </h2>
              <p className="text-gray-600 mb-4">
                {room.description || "No description available"}
              </p>

              <div className="mb-4">
                <p className="font-semibold">Room Details:</p>
                <p>Type: {room.type || "Standard"}</p>
                <p>
                  Capacity: {room.capacity || 1}{" "}
                  {room.capacity === 1 ? "person" : "people"}
                </p>
                <p>Price: ${room.pricePerNight}/night</p>
                <p>Floor: {room.floor || "Not specified"}</p>
              </div>

              <div>
                <p className="font-semibold">Amenities:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {room.amenities && room.amenities.length > 0 ? (
                    room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No amenities listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>

            {error && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                role="alert"
              >
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date
                </label>
                <DatePicker
                  selected={checkInDate}
                  onChange={(date) => setCheckInDate(date)}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={new Date()}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date
                </label>
                <DatePicker
                  selected={checkOutDate}
                  onChange={(date) => setCheckOutDate(date)}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={new Date(checkInDate.getTime() + 86400000)} // +1 day from check-in
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {[...Array(room.capacity || 1)].map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1} {index === 0 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Any special requests or requirements..."
                ></textarea>
              </div>

              <div className="bg-gray-100 p-4 rounded-md mb-6">
                <h3 className="font-bold mb-2">Booking Summary</h3>
                <p>
                  {calculateNights()} nights × ${room.pricePerNight}/night
                </p>
                <p className="font-bold mt-2">
                  Total: ${calculateTotalPrice()}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
              >
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
