import React, { useEffect, useState } from "react";
import {
  Utensils,
  Lock,
  Phone,
  Mail,
  Clock,
  Download,
  AlertTriangle,
  Search,
  MapPin,
  Menu,
} from "lucide-react";
import ImageGallery from "../../components/shared/ImageGallery";
import MenuGrid from "../../components/shared/MenuGrid";
import Sidebar from "../../components/admin/Sidebar";



const LockableSection = ({ children, isLocked }) => (
  <div className="relative">
    <div
      className={
        isLocked
          ? "filter blur-[3px] pointer-events-none select-none opacity-60"
          : ""
      }>
      {children}
    </div>
    {isLocked && (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[2px] rounded-2xl border-2 border-dashed border-gray-200">
        <div className="bg-white p-4 rounded-full shadow-xl mb-3">
          <Lock className="text-orange-500" size={24} />
        </div>
        <p className="text-sm font-bold text-gray-700">Content Locked</p>
        <p className="text-xs text-gray-500">
          Available after onboarding completion
        </p>
      </div>
    )}
  </div>
);

const RestaurantDetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const data = {
    isOnboardingCompleted: false, // Set to true to unlock sections
    restaurantName: "The Gourmet Kitchen",
    description:
      "A cozy, family-owned restaurant offering authentic Italian cuisine made with locally-sourced ingredients. Perfect for a  romantic dinner or a family gathering.",
    tags: ["Fine Dining", "Authentic Italian", "Romantic", "Outdoor Seating"],
    images: [],
    status: "Approved",
    adminName: "Alex Hartman",
    address: "123 Culinary Lane, Foodie City, FS 10101",
    location: { lat: 40.7128, lng: -74.006 },
    cuisine: "Italian",
    phone: "(555) 123-4567",
    email: "contact@thegourmetkitchen.com",
    hours: "Mon-Fri: 5:00 PM - 10:00 PM",
    menu: [
      {
        id: 1,
        name: "Spaghetti Carbonara",
        price: "$22.00",
        desc: "Classic pasta with pancetta, egg, pecorino cheese.",
      },
      {
        id: 2,
        name: "Bruschetta al",
        price: "$12.00",
        desc: "Grilled bread with tomatoes, garlic, basil, and olive oil.",
      },
      {
        id: 3,
        name: "Lasagna Bolognese",
        price: "$20.00",
        desc: "Layers of pasta with rich meat sauce and béchamel.",
      },
      {
        id: 4,
        name: "Calamari Fritti",
        price: "$16.00",
        desc: "Crispy fried calamari served with a side of marinara sauce.",
      },
      {
        id: 5,
        name: "Risotto ai Funghi",
        price: "$24.00",
        desc: "Creamy risotto with wild mushrooms and parmesan.",
      },
      {
        id: 6,
        name: "Tiramisu",
        price: "$10.00",
        desc: "Coffee-flavored Italian dessert with ladyfingers.",
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-slate-800">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activePage="Restaurants"
      />

      {/* Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-[#ff5e00] text-white p-1 rounded-md flex items-center justify-center">
              <span className="font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Restauranto</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header Navigation */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-xs text-gray-400 space-x-2">
              <span className="hover:underline cursor-pointer">
                Back to Restaurants
              </span>
              <span>/</span>
              <span className="text-gray-600 font-medium">
                {data.restaurantName}
              </span>
            </div>
            <button className="bg-red-50 text-red-500 px-5 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition">
              Suspend
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {data.restaurantName}
            </h1>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {data.status}
            </span>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Main Column */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Basic Info (Always Unlocked) */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4">Basic Information</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  {data.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div className="flex items-center space-x-4">
                    <Utensils size={18} className="text-orange-500" />
                    <span className="text-sm">
                      Cuisine:{" "}
                      <b className="ml-1 text-gray-700">{data.cuisine}</b>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone size={18} className="text-orange-500" />
                    <span className="text-sm">
                      Phone:{" "}
                      <span className="ml-1 text-gray-700 font-medium">
                        {data.phone}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Mail size={18} className="text-orange-500" />
                    <span className="text-sm">
                      Email:{" "}
                      <span className="ml-1 text-gray-700 font-medium">
                        {data.email}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Clock size={18} className="text-orange-500" />
                    <div className="text-xs">
                      <p className="text-gray-700 font-medium">{data.hours}</p>
                      <p className="text-gray-400">Sat-Sun: 4:00 PM - 11:00 PM</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-8">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {/* Visuals (Locked Before Onboarding) */}
              <LockableSection isLocked={!data.isOnboardingCompleted}>
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold mb-6">Restaurant Visuals</h2>
                  <ImageGallery images={data.images} />
                </section>
              </LockableSection>

              {/* Menu (Locked Before Onboarding) */}
              <LockableSection isLocked={!data.isOnboardingCompleted}>
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex space-x-6 border-b border-gray-100 w-full md:w-auto">
                      {["Breakfast", "Lunch", "Dinner"].map((t) => (
                        <button
                          key={t}
                          className={`pb-2 text-sm font-bold ${t === "Dinner" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-400"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={14}
                      />
                      <input
                        type="text"
                        placeholder="Search menu..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <MenuGrid
                    items={data.menu}
                    emptyStateMessage="No menu items found"
                  />
                </section>
              </LockableSection>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Reports Banner */}
              <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex items-start space-x-4">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-orange-900">
                    2 Active User Reports
                  </h4>
                  <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                    Pending reports require your immediate attention.
                  </p>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                  Approval Status
                </h3>
                <div className="flex justify-between mb-8">
                  <span className="text-sm text-gray-500 font-medium">
                    Current Status
                  </span>
                  <span className="text-green-600 font-bold text-sm">
                    Approved
                  </span>
                </div>
                <div className="border-l-2 border-green-500 ml-1 pl-4 space-y-6">
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Approved by {data.adminName}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      June 15, 2023
                    </p>
                  </div>
                  <div className="opacity-40">
                    <p className="text-xs font-bold text-gray-800">
                      Application Submitted
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      June 12, 2023
                    </p>
                  </div>
                </div>
              </div>

              {/* Rates Card (Locked Before Onboarding) */}
              <LockableSection isLocked={!data.isOnboardingCompleted}>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                    Seating & Rates
                  </h3>
                  <div className="space-y-4">
                    {[
                      ["Total Seats", "48"],
                      ["Booking Rate", "$25 / person"],
                      ["Slot Duration", "90 Minutes"],
                      ["Gap Duration", "5 Minutes"],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-bold text-gray-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </LockableSection>

              {/* Legal (Always Unlocked) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                  Legal Documents
                </h3>
                <div className="space-y-3">
                  {["Business_License.pdf", "Health_Permit.pdf"].map((doc) => (
                    <div
                      key={doc}
                      className="group flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-orange-200 transition cursor-pointer">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Download size={16} className="text-orange-500" />
                        <span className="text-xs font-medium group-hover:text-orange-600 transition">
                          {doc}
                        </span>
                      </div>
                      <Download size={14} className="text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Location (Always Unlocked) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                  Location
                </h3>
                <div className="w-full h-44 bg-[#E5E7EB] rounded-2xl mb-4 relative overflow-hidden">
                  {/* Mock Map Background */}
                  <div
                    className="absolute inset-0 opacity-30 grayscale"
                    style={{
                      backgroundImage:
                        "radial-gradient(#000 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <MapPin className="text-red-500 fill-red-200" size={32} />
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {data.address}
                </p>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">
                  Lat: {data.location.lat}, Lng: {data.location.lng}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RestaurantDetails;
