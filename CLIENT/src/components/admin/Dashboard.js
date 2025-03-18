// client/src/components/admin/Dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    recentBookings: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
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

        // Fetch rooms data
        const roomsResponse = await axios.get("/api/rooms/admin/all", config);

        // Fetch bookings data
        const bookingsResponse = await axios.get(
          "/api/bookings/admin/all",
          config
        );

        // Calculate statistics
        const rooms = roomsResponse.data;
        const bookings = bookingsResponse.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const availableRooms = rooms.filter(
          (room) => room.isAvailable && room.status === "Ready"
        ).length;

        const todayCheckIns = bookings.filter((booking) => {
          const checkInDate = new Date(booking.checkInDate);
          checkInDate.setHours(0, 0, 0, 0);
          return (
            checkInDate.getTime() === today.getTime() &&
            booking.bookingStatus === "Confirmed"
          );
        }).length;

        const todayCheckOuts = bookings.filter((booking) => {
          const checkOutDate = new Date(booking.checkOutDate);
          checkOutDate.setHours(0, 0, 0, 0);
          return (
            checkOutDate.getTime() === today.getTime() &&
            booking.bookingStatus === "Checked-In"
          );
        }).length;

        // Get recent bookings
        const recentBookings = bookings
          .sort((a, b) => new Date(b.created) - new Date(a.created))
          .slice(0, 5);

        setStats({
          totalRooms: rooms.length,
          availableRooms,
          totalBookings: bookings.length,
          todayCheckIns,
          todayCheckOuts,
          recentBookings,
        });

        setLoading(false);
      } catch (error) {
        setError(error.message || "Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Rooms</h3>
          <p className="stat-value">{stats.totalRooms}</p>
        </div>

        <div className="stat-card">
          <h3>Available Rooms</h3>
          <p className="stat-value">{stats.availableRooms}</p>
        </div>

        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-value">{stats.totalBookings}</p>
        </div>

        <div className="stat-card">
          <h3>Today's Check-ins</h3>
          <p className="stat-value">{stats.todayCheckIns}</p>
        </div>

        <div className="stat-card">
          <h3>Today's Check-outs</h3>
          <p className="stat-value">{stats.todayCheckOuts}</p>
        </div>
      </div>

      <div className="recent-bookings">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <Link to="/admin/bookings" className="view-all-link">
            View All
          </Link>
        </div>

        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentBookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking._id.substring(0, 8)}...</td>
                <td>{booking.guest?.fullName || "N/A"}</td>
                <td>{booking.room?.roomNumber || "N/A"}</td>
                <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`status-badge ${booking.bookingStatus.toLowerCase()}`}
                  >
                    {booking.bookingStatus}
                  </span>
                </td>
                <td>
                  <Link
                    to={`/admin/bookings/${booking._id}`}
                    className="action-btn view"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="quick-links">
        <h2>Quick Links</h2>
        <div className="links-container">
          <Link to="/admin/rooms" className="quick-link-card">
            <span className="icon">🏨</span>
            <span className="title">Manage Rooms</span>
          </Link>

          <Link to="/admin/bookings" className="quick-link-card">
            <span className="icon">📅</span>
            <span className="title">All Bookings</span>
          </Link>

          <Link to="/admin/guests" className="quick-link-card">
            <span className="icon">👥</span>
            <span className="title">Guest Records</span>
          </Link>

          <Link to="/admin/rooms/create" className="quick-link-card">
            <span className="icon">➕</span>
            <span className="title">Add New Room</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
