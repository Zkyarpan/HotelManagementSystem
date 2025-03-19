import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Plus,
  Loader2,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import api from "../utils/api";
import { toast } from "sonner";
import { API_BASE_URL, getFullImageUrl, handleImageError } from "../utils/utils";

const RoomForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "Standard",
    capacity: 1,
    pricePerNight: 0,
    floor: 1,
    amenities: [],
    description: "",
    status: "Ready",
    isAvailable: true,
    images: [],
  });

  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  // Room type options
  const roomTypes = ["Single", "Double", "Twin", "Suite", "Deluxe", "Standard"];
  const statusOptions = ["Ready", "Occupied", "Cleaning", "Maintenance"];

  // Fetch room details if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchRoomDetails();
    }
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching details for room ${id}...`);

      // Use our API instance instead of axios directly
      const response = await api.get(`/api/rooms/${id}`);
      console.log("Room details API response:", response.data);

      // Format data for form
      const roomData = response.data;
      setFormData({
        roomNumber: roomData.roomNumber || "",
        type: roomData.type || "Standard",
        capacity: roomData.capacity || 1,
        pricePerNight: roomData.pricePerNight || roomData.price || 0,
        floor: roomData.floor || 1,
        amenities: Array.isArray(roomData.amenities) ? roomData.amenities : [],
        description: roomData.description || "",
        status: roomData.status || "Ready",
        isAvailable: roomData.isAvailable !== false,
        images: Array.isArray(roomData.images) ? roomData.images : [],
      });

      // Set image previews for existing images
      if (Array.isArray(roomData.images) && roomData.images.length > 0) {
        console.log(
          "Setting image previews for existing images:",
          roomData.images
        );
        const imageUrls = roomData.images.map((img) => ({
          url: getFullImageUrl(img),
          isExisting: true,
          path: img,
        }));
        setImagePreviewUrls(imageUrls);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching room:", err);
      toast.error("Failed to fetch room details. Please try again.", {
        id: "fetch-room-error",
      });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity("");
      toast.success("Amenity added successfully", { id: "amenity-added" });
    } else if (formData.amenities.includes(newAmenity.trim())) {
      toast.error("This amenity already exists", { id: "amenity-duplicate" });
    }
  };

  const removeAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
    toast.success("Amenity removed successfully", { id: "amenity-removed" });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Check file types
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("Only image files are allowed", { id: "invalid-file-type" });
    }

    // Create preview URLs for new images
    const newImageFiles = [...imageFiles, ...validFiles];
    setImageFiles(newImageFiles);

    // Generate preview URLs for new files
    const newImagePreviewUrls = [...imagePreviewUrls];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImagePreviewUrls.push({
          url: reader.result,
          isExisting: false,
          file: file,
        });
        setImagePreviewUrls([...newImagePreviewUrls]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImagePreviewUrls = [...imagePreviewUrls];
    const removedImage = newImagePreviewUrls[index];

    newImagePreviewUrls.splice(index, 1);
    setImagePreviewUrls(newImagePreviewUrls);

    // If it's an existing image, update formData.images
    if (removedImage.isExisting) {
      const imagePath = removedImage.path;
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== imagePath),
      }));
    } else {
      // If it's a new image, update imageFiles
      const newImageFiles = imageFiles.filter(
        (file) => file !== removedImage.file
      );
      setImageFiles(newImageFiles);
    }

    toast.success("Image removed successfully", { id: "image-removed" });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.roomNumber) {
      toast.error("Room number is required", { id: "room-number-required" });
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Create FormData object to handle file uploads
      const formDataObj = new FormData();

      // Add all regular form fields
      Object.keys(formData).forEach((key) => {
        if (key === "amenities" || key === "images") {
          // Skip arrays, we'll handle them separately
          return;
        }
        formDataObj.append(key, formData[key]);
      });

      // Add amenities as JSON string
      formDataObj.append("amenities", JSON.stringify(formData.amenities));

      // Add existing images
      formDataObj.append("existingImages", JSON.stringify(formData.images));

      // Add new image files
      imageFiles.forEach((file) => {
        formDataObj.append("images", file);
      });

      // Debug form data
      console.log("Submitting form with data:", {
        roomNumber: formData.roomNumber,
        type: formData.type,
        capacity: formData.capacity,
        pricePerNight: formData.pricePerNight,
        floor: formData.floor,
        amenities: formData.amenities,
        existingImages: formData.images,
        newImages: imageFiles.length,
      });

      if (isEditMode) {
        // Use our API instance
        const response = await api.put(`/api/rooms/${id}`, formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Room updated successfully:", response.data);
      } else {
        // Use our API instance
        const response = await api.post("/api/rooms", formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Room created successfully:", response.data);
      }

      // Display one success message and navigate
      const successMessage = `Room ${formData.roomNumber} has been ${
        isEditMode ? "updated" : "created"
      } successfully.`;

      // Redirect back to rooms list with a success state
      navigate("/admin/rooms", {
        state: {
          roomUpdated: true,
          message: successMessage,
          timestamp: new Date().getTime(), // Add timestamp to ensure state change is detected
        },
      });
    } catch (err) {
      console.error("Error saving room:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to save room. Please try again.";
      toast.error(errorMsg, { id: "save-room-error" });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading room details...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit Room" : "Add New Room"}
        </h1>
        <p className="text-gray-500">
          {isEditMode
            ? "Update the details of an existing room"
            : "Create a new room in the system"}
        </p>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Room Details</h2>
            <p className="text-gray-500 text-sm">
              Enter the basic information about the room
            </p>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Room Number */}
              <div className="space-y-2">
                <label
                  htmlFor="roomNumber"
                  className="block text-sm font-medium"
                >
                  Room Number *
                </label>
                <input
                  id="roomNumber"
                  name="roomNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-gray-500">
                  A unique identifier for the room
                </p>
              </div>

              {/* Room Type */}
              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium">
                  Room Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.type}
                  onChange={handleSelectChange}
                >
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label htmlFor="capacity" className="block text-sm font-medium">
                  Capacity
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.capacity}
                  onChange={handleNumberChange}
                />
                <p className="text-sm text-gray-500">
                  Maximum number of guests
                </p>
              </div>

              {/* Price per Night */}
              <div className="space-y-2">
                <label
                  htmlFor="pricePerNight"
                  className="block text-sm font-medium"
                >
                  Price per Night ($)
                </label>
                <input
                  id="pricePerNight"
                  name="pricePerNight"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.pricePerNight}
                  onChange={handlePriceChange}
                />
              </div>

              {/* Floor */}
              <div className="space-y-2">
                <label htmlFor="floor" className="block text-sm font-medium">
                  Floor
                </label>
                <input
                  id="floor"
                  name="floor"
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.floor}
                  onChange={handleNumberChange}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={handleSelectChange}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter room description..."
              />
              <p className="text-sm text-gray-500">
                Describe the room's features and amenities
              </p>
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => handleSwitchChange(e)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium">
                Available for booking
              </label>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Room Images</label>
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {imagePreviewUrls.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={image.url}
                          alt={`Room image ${index + 1}`}
                          className="object-cover w-full h-full"
                          onError={(e) =>
                            handleImageError(e, `Preview image ${index + 1}`)
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md">
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">
                    No images uploaded yet. Click the upload button to add room
                    images.
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Upload high-quality images of the room. Recommended size: 1200 x
                800 pixels.
              </p>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Amenities</label>
              <div className="flex gap-2">
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Add amenity (e.g., Wi-Fi, TV)"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAmenity();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="ml-1 rounded-full p-1 hover:bg-gray-200"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                List all amenities available in this room
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md"
              onClick={() => navigate("/admin/rooms")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Room"
              ) : (
                "Create Room"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;
