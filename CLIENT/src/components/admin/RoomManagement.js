// client/src/components/admin/RoomManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    isAvailable: ''
  });
  
  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Set auth header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Fetch rooms data
      const response = await axios.get('/api/rooms/admin/all', config);
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Failed to load rooms');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRooms();
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };
  
  const handleStatusChange = async (roomId, newStatus) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Set auth header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Update room status
      await axios.put(`/api/rooms/${roomId}`, { status: newStatus }, config);
      
      // Refresh rooms list
      fetchRooms();
    } catch (error) {
      setError(error.message || 'Failed to update room status');
    }
  };
  
  const handleAvailabilityToggle = async (roomId, currentAvailability) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Set auth header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Update room availability
      await axios.put(`/api/rooms/${roomId}`, { isAvailable: !currentAvailability }, config);
      
      // Refresh rooms list
      fetchRooms();
    } catch (error) {
      setError(error.message || 'Failed to update room availability');
    }
  };
  
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Set auth header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Delete room
      await axios.delete(`/api/rooms/${roomId}`, config);
      
      // Refresh rooms list
      fetchRooms();
    } catch (error) {
      setError(error.message || 'Failed to delete room');
    }
  };
  
  // Filter rooms based on selected filters
  const filteredRooms = rooms.filter(room => {
    return (
      (filter.type === '' || room.type === filter.type) &&
      (filter.status === '' || room.status === filter.status) &&
      (filter.isAvailable === '' || room.isAvailable.toString() === filter.isAvailable)
    );
  });
  
  if (loading) {
    return <div className="loading">Loading rooms...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="room-management">
      <div className="header">
        <h1>Room Management</h1>
        <Link to="/admin/rooms/create" className="add-room-btn">Add New Room</Link>
      </div>
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="type">Room Type:</label>
          <select 
            id="type" 
            name="type" 
            value={filter.type} 
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Twin">Twin</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select 
            id="status" 
            name="status" 
            value={filter.status} 
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="Ready">Ready</option>
            <option value="Occupied">Occupied</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="isAvailable">Availability:</label>
          <select 
            id="isAvailable" 
            name="isAvailable" 
            value={filter.isAvailable} 
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="true">Available</option>
            <option value="false">Not Available</option>
          </select>
        </div>
      </div>
      
      <div className="rooms-table-container">
        <table className="rooms-table">
          <thead>
            <tr>
              <th>Room No.</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Price/Night</th>
              <th>Status</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <tr key={room._id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.type}</td>
                  <td>{room.capacity}</td>
                  <td>${room.pricePerNight}</td>
                  <td>
                    <select 
                      value={room.status}
                      onChange={(e) => handleStatusChange(room._id, e.target.value)}
                      className={`status-select ${room.status.toLowerCase()}`}
                    >
                      <option value="Ready">Ready</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className={`availability-toggle ${room.isAvailable ? 'available' : 'unavailable'}`}
                      onClick={() => handleAvailabilityToggle(room._id, room.isAvailable)}
                    >
                      {room.isAvailable ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="actions">
                    <Link to={`/admin/rooms/${room._id}`} className="action-btn view">
                      View
                    </Link>
                    <Link to={`/admin/rooms/${room._id}/edit`} className="action-btn edit">
                      Edit
                    </Link>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteRoom(room._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No rooms found matching the filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomManagement;