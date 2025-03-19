import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Admin Components
import AdminDashboard from "./components/admin/Dashboard";
import RoomManagement from "./components/admin/RoomManagement";
import BookingManagement from "./components/admin/BookingManagement";

// User Components
import UserDashboard from "./components/Dashboard"; // User dashboard
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Rooms from "./components/Room"; // Note: Corrected from Room to Rooms
import Booking from "./components/Booking";
import Bookings from "./components/Bookings";
import BookingDetails from "./components/BookingDetails";
import { Toaster } from "sonner";

// Route Protection
import {
  ProtectedRoute,
  AdminRoute,
} from "./components/routing/ProtectedRoute";
import RoomForm from "./components/admin/RoomForm";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Toaster
            position="top-right"
            richColors
            expand={false}
            offset="16px"
            duration={3000}
          />
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/booking/:roomId" element={<Booking />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route
                  path="/booking-details/:id"
                  element={<BookingDetails />}
                />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/rooms" element={<RoomManagement />} />
                <Route path="/admin/bookings" element={<BookingManagement />} />
                <Route path="/admin/rooms/new" element={<RoomForm />} />
                <Route path="/admin/rooms/edit/:id" element={<RoomForm />} />
              </Route>

              {/* Fallback Routes */}
              <Route
                path="/unauthorized"
                element={
                  <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                      <h1 className="text-xl font-bold">Unauthorized Access</h1>
                      <p>You don't have permission to access this page.</p>
                    </div>
                  </div>
                }
              />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
