import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useLoginApiMutation } from '../../services/LoginRegisterApi';

function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: 'onChange' });
  const [loginApi, { isLoading }] = useLoginApiMutation();
  const [passwordErrorResponse, setPasswordErrorResponse] = useState();
  const [userErrorResponse, setUserErrorResponse] = useState();
  const [selectedRole, setSelectedRole] = useState("distributor");

  const onSubmit = async (data) => {
    data.role = selectedRole; // Pass role to backend

    const response = await loginApi(data);
    if (response.error && response.error.data.status === "User does not exist") {
      setPasswordErrorResponse("");
      setUserErrorResponse(response.error.data.status);
    } else if (response.error && response.error.data.status === "Invalid Password") {
      setUserErrorResponse("");
      setPasswordErrorResponse(response.error.data.status);
    } else if (response.error && response.error.data.status === "User does not exist with this role") {
      alert("User does not exist with this role");
    }
    else {
      const { userId, role } = response.data.status;
      if (role === "distributor") {
        navigate(`/unified-health-tech/distributor/dashboard/${userId}`);
      } else {
        navigate(`/unified-health-tech/retailer/dashboard/${userId}`);
      }
    }
  };

  return (
    <div className="min-h-screen w-full text-white flex flex-col justify-center items-center bg-black px-4 sm:px-6 md:px-8">

      {/* Title Section */}
      <div className="text-center mb-4 drop-shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-semibold">Unified Health Tech Solutions</h1>
        <p className="mt-1 text-sm sm:text-base opacity-90">Select your role and login</p>
      </div>
      {/* Role Selection with sliding indicator */}
      <div className="relative flex w-full max-w-sm sm:max-w-md bg-white rounded-t-lg overflow-hidden h-12">
        {/* Sliding indicator */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 bg-blue-600 transition-all duration-300 rounded-tl-lg`}
          style={{
            transform: selectedRole === "retailer" ? "translateX(100%)" : "translateX(0)",
            borderTopLeftRadius: selectedRole === "distributor" ? "0.5rem" : "0", // rounded-tl
            borderTopRightRadius: selectedRole === "retailer" ? "0.5rem" : "0", // rounded-tr
          }}
        ></div>

        <button
          type="button"
          onClick={() => setSelectedRole("distributor")}
          className={`relative w-1/2 z-10 font-semibold transition duration-300 cursor-pointer ${selectedRole === "distributor" ? "text-white" : "text-black"
            }`}
        >
          Distributor
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole("retailer")}
          className={`relative w-1/2 z-10 font-semibold transition duration-300 cursor-pointer ${selectedRole === "retailer" ? "text-white" : "text-black"
            }`}
        >
          Retailer
        </button>
      </div>


      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-xl rounded-b-lg p-5 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md space-y-5 text-black"
      >
        {/* User ID */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">User ID</label>
          <input
            type="text"
            {...register('userId', {
              required: 'User ID is required',
              pattern: { value: /^[^\s]+$/, message: 'User ID must not contain spaces' }
            })}
            className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            placeholder="Enter your user ID"
          />
          {errors.userId && <p className="text-xs sm:text-sm text-red-500">{errors.userId.message}</p>}
          {userErrorResponse && <p className="text-xs sm:text-sm text-red-500">{userErrorResponse}</p>}
        </div>


        {/* Password */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs sm:text-sm text-red-500">{errors.password.message}</p>}
          {passwordErrorResponse && <p className="text-xs sm:text-sm text-red-500">{passwordErrorResponse}</p>}
        </div>

        {/* Forgot Password */}
        <div className="flex w-full justify-end">
          <Link to={"forgot-password"} className='font-semibold text-sm text-gray-700 hover:underline'>Forgot password?</Link>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-center">
          <button type="submit" disabled={isSubmitting || isLoading} className='Btn'>
            {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>

      {/* Signup Link */}
      <div className="signup mt-8 text-center">
        <p className="text-xs sm:text-sm text-white">
          Don't have an account?{' '}
          <a href="/unified-health-tech/register" className="text-[#9485FF] hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
