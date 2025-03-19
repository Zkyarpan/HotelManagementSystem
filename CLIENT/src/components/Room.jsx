import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "./utils/api";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    minPrice: "",
    maxPrice: "",
    capacity: "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);

        const response = await api.get("/api/rooms");

        // Make sure we have an array
        if (Array.isArray(response.data)) {
          setRooms(response.data);
        } else {
          console.error("API returned non-array data:", response.data);
          setRooms([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to fetch rooms. Please try again later.");
        setRooms([]); // Set empty array on error
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const applyFilters = () => {
    // Always return an array
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      return [];
    }

    return rooms.filter((room) => {
      // Filter by room type
      if (filters.type && room.type !== filters.type) {
        return false;
      }

      // Get price from appropriate field
      const price = room.pricePerNight || room.price || 0;

      // Filter by price range
      if (filters.minPrice && price < parseInt(filters.minPrice)) {
        return false;
      }

      if (filters.maxPrice && price > parseInt(filters.maxPrice)) {
        return false;
      }

      // Filter by capacity
      if (filters.capacity && room.capacity < parseInt(filters.capacity)) {
        return false;
      }

      // Only show available rooms
      if (
        room.isAvailable === false ||
        (room.status && room.status !== "Ready")
      ) {
        return false;
      }

      return true;
    });
  };

  // Safely get filtered rooms
  const filteredRooms = applyFilters();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Rooms</h1>

      {/* Filters Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Twin">Twin</option>
              <option value="Suite">Suite</option>
              <option value="Deluxe">Deluxe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
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
      </div>

      {/* Rooms Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading rooms...</p>
        </div>
      ) : error ? (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <p>{error}</p>
        </div>
      ) : (
        <>
          <p className="mb-4">Showing {filteredRooms.length} rooms</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <div
                  key={room._id}
                  className="border rounded-lg overflow-hidden shadow-lg"
                >
                  <div className="h-48 bg-gray-300 relative">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={room.roomNumber}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-500">
                          No image available
                        </span>
                      </div>
                    )}
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full">
                      ${room.pricePerNight || room.price || 0}/night
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">
                      Room {room.roomNumber || room.name || ""}
                    </h3>
                    <p className="text-gray-600 mb-2">Type: {room.type}</p>
                    <p className="text-gray-600 mb-2">
                      Capacity: {room.capacity}{" "}
                      {room.capacity === 1 ? "person" : "people"}
                    </p>
                    <p className="text-gray-600 mb-4">{room.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.amenities &&
                        Array.isArray(room.amenities) &&
                        room.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                    </div>

                    <Link to={`/booking/${room._id}`} className="block w-full">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  No rooms found matching your criteria.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      type: "",
                      minPrice: "",
                      maxPrice: "",
                      capacity: "",
                    })
                  }
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Rooms;
