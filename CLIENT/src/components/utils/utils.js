export const API_BASE_URL = "http://localhost:5000"; // Change to your actual backend URL

export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;

  // Check if the path already starts with /uploads
  if (imagePath.startsWith("/uploads")) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // If the path doesn't have a leading slash, add one
  if (!imagePath.startsWith("/")) {
    imagePath = `/${imagePath}`;
  }

  return `${API_BASE_URL}${imagePath}`;
};

export const handleImageError = (e, identifier = "") => {
  console.error(
    `Failed to load image${identifier ? ` for ${identifier}` : ""}:`,
    e.target.src
  );
  e.target.src =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%25%22%20height%3D%22100%25%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f1f5f9%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22system-ui%2C%20-apple-system%2C%20BlinkMacSystemFont%22%20font-size%3D%2212px%22%20fill%3D%22%2394a3b8%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";
  e.target.onerror = null; // Prevent infinite error loops
};

// Room image helper function that uses the above utilities
export const getRoomImage = (room) => {
  if (!room || !room.images || !room.images.length) {
    return null;
  }

  return getFullImageUrl(room.images[0]);
};

// Additional utility functions for the components
export const formatDate = (dateString) => {
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

export const calculateNights = (checkIn, checkOut) => {
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

export const getStatusClass = (status) => {
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
