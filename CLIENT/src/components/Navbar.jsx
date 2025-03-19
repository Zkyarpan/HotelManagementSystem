import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

const Navbar = () => {
  // Get the context properly with defensive coding
  const context = useContext(AuthContext);
  // Using optional chaining and default values to prevent errors
  const { auth = { isAuthenticated: false, user: null }, logout = () => {} } =
    context || {};

  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user is admin
  const isAdmin = auth?.user?.role?.toLowerCase() === "admin";

  // Check if current page is an admin page
  const isAdminPage = location.pathname.startsWith("/admin");

  // Debug auth state
  useEffect(() => {
    console.log(
      "Auth state in Navbar:",
      auth,
      "Is Admin:",
      isAdmin,
      "Is Admin Page:",
      isAdminPage
    );
  }, [auth, isAdmin, location]);

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Helper function to determine if a link is active
  const isActive = (path) => {
    if (location.pathname === path) return true;
    if (path !== "/" && location.pathname.startsWith(path + "/")) return true;
    return false;
  };

  const getActiveClass = (path) => {
    return isActive(path)
      ? "border-blue-500 text-gray-900"
      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";
  };

  const getAdminActiveClass = (path) => {
    return isActive(path)
      ? "border-purple-500 text-purple-900"
      : "border-transparent text-purple-500 hover:border-purple-300 hover:text-purple-700";
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                HMS
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Show different navigation based on context */}
              {isAdminPage ? (
                /* Admin Navigation */
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`${getAdminActiveClass(
                      "/admin/dashboard"
                    )} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/rooms"
                    className={`${getAdminActiveClass(
                      "/admin/rooms"
                    )} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Manage Rooms
                  </Link>
                  <Link
                    to="/admin/bookings"
                    className={`${getAdminActiveClass(
                      "/admin/bookings"
                    )} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Manage Bookings
                  </Link>

                  {/* Link back to user area */}
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    ← User Dashboard
                  </Link>
                </>
              ) : (
                /* User Navigation */
                <>
                  <Link
                    to="/"
                    className={`${getActiveClass(
                      "/"
                    )} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Home
                  </Link>

                  {auth?.isAuthenticated && (
                    <>
                      <Link
                        to="/dashboard"
                        className={`${getActiveClass(
                          "/dashboard"
                        )} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/rooms"
                        className={`${getActiveClass(
                          "/rooms"
                        )} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        Rooms
                      </Link>
                      <Link
                        to="/bookings"
                        className={`${getActiveClass(
                          "/bookings"
                        )} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        Bookings
                      </Link>

                      {/* Admin link to switch context */}
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-purple-600 hover:border-purple-300 hover:text-purple-700"
                        >
                          Admin Area →
                        </Link>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {auth?.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 flex items-center">
                  Hi, {auth.user?.name || "User"}
                  {isAdmin && (
                    <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-3 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-5 py-3 border border-transparent font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isAdminPage ? (
              /* Admin Mobile Navigation */
              <>
                <Link
                  to="/admin/dashboard"
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/admin/dashboard")
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-transparent text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/rooms"
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/admin/rooms")
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-transparent text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Manage Rooms
                </Link>
                <Link
                  to="/admin/bookings"
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/admin/bookings")
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-transparent text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Manage Bookings
                </Link>
                <Link
                  to="/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  User Dashboard
                </Link>
              </>
            ) : (
              /* User Mobile Navigation */
              <>
                <Link
                  to="/"
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    isActive("/")
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>

                {auth?.isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`block pl-3 pr-4 py-2 border-l-4 ${
                        isActive("/dashboard")
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/rooms"
                      className={`block pl-3 pr-4 py-2 border-l-4 ${
                        isActive("/rooms")
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Rooms
                    </Link>
                    <Link
                      to="/bookings"
                      className={`block pl-3 pr-4 py-2 border-l-4 ${
                        isActive("/bookings")
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Bookings
                    </Link>

                    {/* Admin link for mobile */}
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Area
                      </Link>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            {auth?.isAuthenticated ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {auth.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center text-base font-medium text-gray-800">
                      {auth.user?.name || "User"}
                      {isAdmin && (
                        <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {auth.user?.email || ""}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-5 py-3 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1 px-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
