// Replace or update these functions in your RoomManagement component

// Helper function to convert relative image paths to absolute URLs
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Check if it's already an absolute URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path, prepend the API base URL or current origin
    const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
    return `${baseUrl}${imagePath}`;
  };
  
  // Get the primary image or return null with proper URL handling
  const getRoomPrimaryImage = (room) => {
    if (room.images && Array.isArray(room.images) && room.images.length > 0) {
      return getFullImageUrl(room.images[0]);
    }
    return null;
  };
  
  // Add this debug function to help troubleshoot image loading issues
  const handleImageError = (e, roomNumber) => {
    console.error(`Failed to load image for Room ${roomNumber}:`, e.target.src);
    // You can set a fallback image if needed
    e.target.src = '/placeholder-room.jpg'; // Make sure this exists in your public folder
    e.target.onerror = null; // Prevent infinite error loops
  };