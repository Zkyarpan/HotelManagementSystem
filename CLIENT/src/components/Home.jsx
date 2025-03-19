import React from "react";
import {
  Hotel,
  Calendar,
  Users,
  BarChart3,
  Coffee,
  Wifi,
  Car,
  Bath,
  Check,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Booking Management",
      description: "Streamline reservations with our intuitive booking system.",
      image:
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=2070",
    },
    {
      icon: Users,
      title: "Guest Experience Optimization",
      description: "Personalize services with comprehensive guest profiles.",
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=2070",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Make data-driven decisions with powerful reporting tools.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070",
    },
    {
      icon: Hotel,
      title: "Property Management",
      description: "Comprehensive control of your entire hotel ecosystem.",
      image:
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const amenities = [
    {
      icon: Coffee,
      title: "Restaurant Management",
      description: "Effortlessly handle dining services and inventory.",
    },
    {
      icon: Wifi,
      title: "Connectivity Solutions",
      description: "Seamless internet access management for guests.",
    },
    {
      icon: Car,
      title: "Parking & Valet",
      description: "Efficient parking operations at your fingertips.",
    },
    {
      icon: Bath,
      title: "Housekeeping Optimization",
      description: "Streamline cleaning and maintenance workflows.",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex items-center">
          <div className="w-1/2 pr-12">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl mb-6">
              Elevate Your Hotel Management
            </h1>
            <p className="mt-4 text-xl text-blue-100 mb-10">
              Comprehensive solution to transform your hotel operations, enhance
              guest experiences, and drive operational efficiency with
              cutting-edge technology.
            </p>
            <div className="flex space-x-4">
              <a
                href="#features"
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Explore Features
              </a>
            </div>
          </div>

          <div className="w-1/2 grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center">
                    <feature.icon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Comprehensive Amenity Management
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Handle every aspect of your hotel with precision and ease
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-start bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
              >
                <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3 mr-4">
                  <amenity.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {amenity.title}
                  </h3>
                  <p className="text-gray-600">{amenity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
            Ready to Transform Your Hotel Management?
          </h2>
          <p className="mt-4 text-xl text-blue-100 mb-8">
            Start your journey towards operational excellence and enhanced guest
            experiences
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow-md">
              <Check className="h-5 w-5 mr-2" />
              Efficient Operations
            </div>
            <div className="flex items-center bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow-md">
              <Check className="h-5 w-5 mr-2" />
              Enhanced Guest Satisfaction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
