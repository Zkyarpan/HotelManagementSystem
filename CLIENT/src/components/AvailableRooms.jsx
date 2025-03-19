import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AvailableRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    capacity: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Construct query parameters based on filters
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.capacity) queryParams.append('capacity', filters.capacity);
      
      // Only show available rooms
      queryParams.append('isAvailable', true);
      
      const url = `http://localhost:5000/api/rooms?${queryParams.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        setRooms(response.data.data);
      } else {
        setRooms([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch rooms. Please try again later.');
      setLoading(false);
      console.error('Error fetching rooms:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      capacity: ''
    });
    
    // Use setTimeout to ensure state is updated before fetching
    setTimeout(() => {
      fetchRooms();
    }, 0);
  };

  const getRoomImage = (room) => {
    if (room.images && room.images.length > 0) {
      // If image path is relative, prepend API base URL
      const imagePath = room.images[0];
      return imagePath.startsWith('http') 
        ? imagePath 
        : `http://localhost:5000${imagePath}`;
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Rooms</h1>
      
      {/* Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Rooms</h2>
        
        <form onSubmit={applyFilters}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
                <option value="Deluxe">Deluxe</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min Price"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max Price"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <select
                name="capacity"
                value={filters.capacity}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Any Capacity</option>
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4+ People</option>
              </select>
            </div>
          </div>
          
          <div className="flex mt-4 space-x-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Apply Filters
            </button>
            
            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>
      
      {/* Display loading, error, or no results message */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading rooms...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No rooms found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Display rooms grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room._id} className="bg-white shadow-md rounded-lg overflow-hidden border">
              <div className="h-48 bg-gray-300 relative">
                {getRoomImage(room) ? (
                  <img
                    src={getRoomImage(room)}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">Room {room.roomNumber}</h2>
                <p className="text-gray-600 mb-2 line-clamp-2">{room.description || "No description available."}</p>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{room.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium">{room.floor}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg mt-2">
                    <span>Price:</span>
                    <span className="text-blue-600">${room.pricePerNight}/night</span>
                  </div>
                </div>
                
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link to={`/book/${room._id}`}>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Book Now
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableRooms;