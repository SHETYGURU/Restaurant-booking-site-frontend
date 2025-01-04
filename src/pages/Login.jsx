import React, { useState } from 'react'; 
import { useRouter } from 'next/router'; 
import './customStyles.css';
import Calendar from '@/pages/Calendar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [showDialog, setShowDialog] = useState(true);
  const router = useRouter(); 

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    if (email) {
      localStorage.setItem('email', email); e
      router.push('./Calendar'); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row justify-center items-center bg-white">
      <div className="hidden lg:block lg:w-2/5">
        <h1 className="absolute top-5 left-5 text-xl font-bold text-white z-20">Neina</h1>

        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          style={{ height: '100vh', width: '100%', position: 'relative' }}
        >
          <source src="/assets/login.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Right Section with Form */}
      <div className="w-full lg:w-2/3 p-8 flex items-center justify-center lg:pl-32 xl:pl-48">
        <div className="w-full max-w-sm">
          {/* Logo and Company Name for Mobile View */}
          <div className="block lg:hidden mb-4 text-center">
            <img src="/assets/logo.png" alt="Company Logo" className="mx-auto mb-2" style={{ width: '100px', height: '100px' }} />
            <h1 className="text-2xl font-bold">Neina</h1>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">
            Log in to Your Account
          </h2>

          {showDialog && (
            <div className="bg-blue-500 bg-opacity-10 border-l-4 border-blue-500 p-4 mb-6 rounded-lg animate-pulse">
              <p className="text-blue-700 text-center text-sm">
                Please enter a correct email, which helps us in fetching your details.
              </p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full common-input border border-gray-400 p-2 rounded-lg"
                placeholder="Enter your email"
              />
            </div>

            <button
              className="w-full common-button text-white bg-black py-2 px-3 rounded-lg hover:bg-gray-800"
              type="submit"
              disabled={!email} 
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
