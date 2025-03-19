import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import api from "../utils/api";
import {
  API_BASE_URL,
  getFullImageUrl,
  handleImageError,
} from "../utils/utils";

const RoomManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [roomToUpdate, setRoomToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("Ready");
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Make fetchRooms a callback so we can call it from different places
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching rooms...");
      // Use the corrected admin endpoint path
      const response = await api.get("/api/rooms/admin/all");
      console.log("API response:", response.data);

      // Handle different API response formats
      let roomData;
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        // New API format with data wrapper
        roomData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array format
        roomData = response.data;
      } else if (
        response.data &&
        response.data.rooms &&
        Array.isArray(response.data.rooms)
      ) {
        // Format with rooms property
        roomData = response.data.rooms;
      } else {
        // Fallback to empty array if the response format is unexpected
        roomData = [];
        console.error("Unexpected API response format:", response.data);
      }

      setRooms(roomData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      toast.error("Failed to fetch rooms. Please try again.");
      setRooms([]);
      setLoading(false);
    }
  }, []);

  // Call fetchRooms on initial load
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Check for location state that indicates a room was just created or updated
  useEffect(() => {
    if (location.state?.roomUpdated) {
      console.log("Room updated state detected:", location.state);

      // Clear the state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });

      // Show success message only once
      const message = location.state.message || "Room successfully saved!";
      toast.success(message, {
        id: "room-update-toast", // Using an ID prevents duplicate toasts
      });

      // Refresh the room list
      fetchRooms();
    }
  }, [location, navigate, fetchRooms]);

  // Add class to body when modal is open to prevent scrolling
  useEffect(() => {
    if (deleteModalOpen || statusModalOpen || imagePreviewModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [deleteModalOpen, statusModalOpen, imagePreviewModal]);

  const confirmDelete = (room) => {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  };

  const deleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      await api.delete(`/api/rooms/${roomToDelete._id}`);
      setRooms(rooms.filter((room) => room._id !== roomToDelete._id));
      toast.success(`Room ${roomToDelete.roomNumber} deleted successfully`, {
        id: "room-delete-toast",
      });
      setDeleteModalOpen(false);
      setRoomToDelete(null);
    } catch (err) {
      console.error("Error deleting room:", err);
      toast.error("Failed to delete room. Please try again.");
    }
  };

  const openStatusModal = (room) => {
    setRoomToUpdate(room);
    setNewStatus(room.status || "Ready");
    setStatusModalOpen(true);
  };

  const openImagePreview = (room) => {
    setSelectedRoom(room);
    setImagePreviewModal(true);
  };

  const updateRoomStatus = async () => {
    if (!roomToUpdate) return;

    try {
      const roomId = roomToUpdate._id || roomToUpdate.id;

      if (!roomId) {
        toast.error("Invalid room ID");
        return;
      }

      // Use a more specific endpoint for status updates
      await api.patch(`/api/rooms/${roomId}/status`, {
        status: newStatus,
      });

      // Update local state
      setRooms(
        rooms.map((room) =>
          room._id === roomId || room.id === roomId
            ? { ...room, status: newStatus }
            : room
        )
      );

      toast.success(
        `Room ${roomToUpdate.roomNumber} status updated to ${newStatus}`,
        { id: "status-update-toast" }
      );
      setStatusModalOpen(false);
      setRoomToUpdate(null);
    } catch (err) {
      console.error("Error updating room status:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update room status";

      toast.error(errorMessage);
    }
  };

  // Handle navigation to edit page properly
  const handleEditRoom = (roomId) => {
    if (!roomId) {
      toast.error("Invalid room ID");
      return;
    }
    navigate(`/admin/rooms/edit/${roomId}`);
  };

  // Handle manual refresh button click
  const handleRefresh = () => {
    fetchRooms();
    toast.success("Room list refreshed", { id: "refresh-toast" });
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesStatus = !filterStatus || room.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      (room.roomNumber && room.roomNumber.toString().includes(searchQuery)) ||
      (room.type &&
        room.type.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-800";
      case "Occupied":
        return "bg-blue-100 text-blue-800";
      case "Cleaning":
        return "bg-yellow-100 text-yellow-800";
      case "Maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get the primary image or return null
  const getRoomPrimaryImage = (room) => {
    if (room.images && Array.isArray(room.images) && room.images.length > 0) {
      return getFullImageUrl(room.images[0]);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        <span className="ml-2">Loading rooms...</span>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Room Management</h1>
            <p className="text-gray-500">Create, edit and manage hotel rooms</p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-md flex items-center hover:bg-gray-50"
              onClick={handleRefresh}
              title="Refresh room list"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
              onClick={() => navigate("/admin/rooms/new")}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Room
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by room number or type
              </label>
              <input
                type="text"
                placeholder="Search rooms..."
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
                <option value="Ready">Ready</option>
                <option value="Occupied">Occupied</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-4 mt-4">
            <div className="text-sm text-gray-500">
              {filteredRooms.length}{" "}
              {filteredRooms.length === 1 ? "room" : "rooms"} found
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

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
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
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                    >
                      No rooms found
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room._id || room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {room.roomNumber || "N/A"}
                          </span>
                          <span className="text-gray-500">
                            (Floor {room.floor || "1"})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoomPrimaryImage(room) ? (
                          <div
                            className="relative w-12 h-12 cursor-pointer"
                            onClick={() => openImagePreview(room)}
                          >
                            <img
                              src={getRoomPrimaryImage(room)}
                              alt={`Room ${room.roomNumber}`}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) =>
                                handleImageError(e, `Room ${room.roomNumber}`)
                              }
                            />
                            {room.images && room.images.length > 1 && (
                              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {room.images.length}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {room.type || "Standard"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {room.capacity || 1}{" "}
                        {room.capacity === 1 ? "person" : "people"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${room.pricePerNight || room.price || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                            room.status
                          )}`}
                        >
                          {room.status || "Ready"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-1 border border-gray-300 rounded-md"
                            onClick={() => openStatusModal(room)}
                            title="Change Status"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            className="p-1 border border-gray-300 rounded-md"
                            onClick={() => handleEditRoom(room._id || room.id)}
                            title="Edit Room"
                          >
                            <Pencil className="h-4 w-4 text-indigo-600" />
                          </button>
                          <button
                            className="p-1 border border-gray-300 rounded-md"
                            onClick={() => confirmDelete(room)}
                            title="Delete Room"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete Room {roomToDelete?.roomNumber}?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  onClick={deleteRoom}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setStatusModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Update Room Status</h3>
              <p className="text-gray-600 mb-4">
                Change the status of Room {roomToUpdate?.roomNumber}
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
                  <option value="Ready">Ready</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setStatusModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={updateRoomStatus}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreviewModal && selectedRoom && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setImagePreviewModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Room {selectedRoom.roomNumber} Images
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setImagePreviewModal(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {selectedRoom.images && selectedRoom.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRoom.images.map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-lg">
                      <img
                        src={getFullImageUrl(image)}
                        alt={`Room ${selectedRoom.roomNumber} - Image ${
                          index + 1
                        }`}
                        className="w-full h-auto object-cover"
                        onError={(e) =>
                          handleImageError(
                            e,
                            `Room ${selectedRoom.roomNumber} - Image ${
                              index + 1
                            }`
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <ImageIcon className="h-16 w-16 mb-4" />
                  <p>No images available for this room</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default RoomManagement;