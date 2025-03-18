// client/src/components/admin/BookingManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: "",
    dateRange: {
      startDate: null,
      endDate: null,
    },
    roomId: "",
  });
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        // Set auth header
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch rooms for filter
        const roomsResponse = await axios.get("/api/rooms/admin/all", config);
        setRooms(roomsResponse.data);

        // Create query parameters for filtering
        let queryParams = "";

        if (filter.status) {
          queryParams += `status=${filter.status}&`;
        }

        if (filter.roomId) {
          queryParams += `roomId=${filter.roomId}&`;
        }

        if (filter.dateRange.startDate) {
          queryParams += `fromDate=${filter.dateRange.startDate.toISOString()}&`;
        }

        if (filter.dateRange.endDate) {
          queryParams += `toDate=${filter.dateRange.endDate.toISOString()}&`;
        }

        // Fetch bookings data
        const bookingsResponse = await axios.get(
          `/api/bookings/admin/all?${queryParams}`,
          config
        );

        setBookings(bookingsResponse.data);
        setLoading(false);
      } catch (error) {
        setError(error.message || "Failed to load bookings");
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value,
    });
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setFilter({
      ...filter,
      dateRange: {
        startDate: start,
        endDate: end,
      },
    });
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Set auth header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Update booking status
      await axios.patch(
        `/api/bookings/${bookingId}/status`,
        { bookingStatus: newStatus },
        config
      );

      // Update booking in state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, bookingStatus: newStatus }
            : booking
        )
      );
    } catch (error) {
      setError(error.message || "Failed to update booking status");
    }
  };

  const handlePaymentStatusChange = async (bookingId, newStatus) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Set auth header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Update payment status
      await axios.patch(
        `/api/bookings/${bookingId}/status`,
        { paymentStatus: newStatus },
        config
      );

      // Update booking in state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, paymentStatus: newStatus }
            : booking
        )
      );
    } catch (error) {
      setError(error.message || "Failed to update payment status");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this booking? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Set auth header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Delete booking
      await axios.delete(`/api/bookings/${bookingId}`, config);

      // Remove booking from state
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );
    } catch (error) {
      setError(error.message || "Failed to delete booking");
    }
  };

  if (loading && bookings.length === 0) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="booking-management">
      <div className="header">
        <h1>Booking Management</h1>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="status">Booking Status:</label>
          <select
            id="status"
            name="status"
            value={filter.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Checked-Out">Checked-Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="roomId">Room:</label>
          <select
            id="roomId"
            name="roomId"
            value={filter.roomId}
            onChange={handleFilterChange}
          >
            <option value="">All Rooms</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.roomNumber} - {room.type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group date-range">
          <label>Date Range:</label>
          <DatePicker
            selectsRange={true}
            startDate={filter.dateRange.startDate}
            endDate={filter.dateRange.endDate}
            onChange={handleDateRangeChange}
            placeholderText="Select date range"
            className="date-picker"
          />
        </div>

        <button
          className="clear-filters-btn"
          onClick={() =>
            setFilter({
              status: "",
              dateRange: {
                startDate: null,
                endDate: null,
              },
              roomId: "",
            })
          }
        >
          Clear Filters
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Amount</th>
              <th>Booking Status</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking._id.substring(0, 8)}...</td>
                  <td>{booking.guest?.fullName || "N/A"}</td>
                  <td>{booking.room?.roomNumber || "N/A"}</td>
                  <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                  <td>${booking.totalAmount}</td>
                  <td>
                    <select
                      value={booking.bookingStatus}
                      onChange={(e) =>
                        handleStatusChange(booking._id, e.target.value)
                      }
                      className={`status-select ${booking.bookingStatus
                        .toLowerCase()
                        .replace("-", "")}`}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked-In">Checked-In</option>
                      <option value="Checked-Out">Checked-Out</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={booking.paymentStatus}
                      onChange={(e) =>
                        handlePaymentStatusChange(booking._id, e.target.value)
                      }
                      className={`payment-status-select ${booking.paymentStatus.toLowerCase()}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </td>
                  <td className="actions">
                    <Link
                      to={`/admin/bookings/${booking._id}`}
                      className="action-btn view"
                    >
                      View
                    </Link>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteBooking(booking._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No bookings found matching the filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingManagement;
