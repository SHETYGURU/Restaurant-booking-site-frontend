import Link from "next/link";
import { FaHome, FaUser, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const handleExit = () => {
    // Clear user session or token
    localStorage.clear(); // Example: Clear all localStorage
    console.log("User logged out. Redirecting to Login page...");
    // Redirect to login page
    window.location.href = "/Login";
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center">
          <img src="/assets/logo.png" alt="Logo" className="w-10 h-10 mr-2" /> {/* Logo */}
          <div className="text-lg font-bold">Neina</div>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-4">
          <Link href="/Calendar" className="flex items-center hover:text-yellow-500">
            <FaHome className="mr-2" /> Home
          </Link>
          <Link href="/Profile" className="flex items-center hover:text-yellow-500">
            <FaUser className="mr-2" /> Profile
          </Link>
          <button
            onClick={handleExit}
            className="flex items-center hover:text-yellow-500 focus:outline-none"
          >
            <FaSignOutAlt className="mr-2" /> Exit
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
