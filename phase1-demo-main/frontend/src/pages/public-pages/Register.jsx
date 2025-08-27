import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useRegisterApiMutation, useDuplicateUserIdCheckerApiMutation } from '../../services/LoginRegisterApi';
import { useNavigate } from 'react-router';

function Register() {
  const [registerApi, { isLoading }] = useRegisterApiMutation();
  const [duplicateUserIdCheckerApi] = useDuplicateUserIdCheckerApiMutation();
  const [errorResponse, setErrorResponse] = useState();
  const [userIdDuplicateResponse, setUserIdDuplicateResponse] = useState();
  const [userId, setUserId] = useState();
  const [selectedRole, setSelectedRole] = useState("distributor");
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({ mode: 'onChange' });

  useEffect(() => {
    if (!userId || userId.trim() === "" || userId.includes(' ')) {
      setUserIdDuplicateResponse("");
      return;
    }

    let debounceTimer = setTimeout(async () => {
      const response = await duplicateUserIdCheckerApi({ userId });
      if (response.error) {
        setUserIdDuplicateResponse(response.error.data.status);
      } else {
        setUserIdDuplicateResponse(response.data.status);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [userId]);

  const onSubmit = async (data) => {
    if (!selectedRole) {
      alert("Please select a role first.");
      return;
    }

    data.role = selectedRole;
    const response = await registerApi(data);
    if (response.error) {
      setErrorResponse(response.error.data.status);
    } else {
      alert("New user Created");
      navigate("/unified-health-tech/login");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-black px-4 sm:px-6 md:px-8">

      {/* Title */}
      <div className="text-center mb-4 text-white drop-shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-semibold">Unified Health Tech Solutions</h1>
        <p className="mt-1 text-sm sm:text-base opacity-90">Select your role and register</p>
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
        <div className="relative">
          <label className="block font-medium text-gray-700 mb-1">User ID</label>
          <input
            {...register('userId', {
              required: 'User ID is required',
              pattern: { value: /^[^\s]+$/, message: 'User ID must not contain spaces' }
            })}
            onChange={(e) => setUserId(e.target.value)}
            value={userId || ''}
            className="w-full border border-purple-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            placeholder="Enter your user ID"
          />
          {userIdDuplicateResponse && userIdDuplicateResponse.toLowerCase() === "ok" && (
            <span className="absolute right-3 top-8 text-green-500 text-lg">✔</span>
          )}
          {userIdDuplicateResponse && userIdDuplicateResponse.toLowerCase() !== "ok" && (
            <p className="text-xs sm:text-sm text-red-500">{userIdDuplicateResponse}</p>
          )}
          {errors.userId && <p className="text-xs sm:text-sm text-red-500">{errors.userId.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Email</label>
          <input
            type='email'
            {...register('emailId', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' }
            })}
            className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            placeholder="you@example.com"
          />
          {errors.emailId && <p className="text-xs sm:text-sm text-red-500">{errors.emailId.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              pattern: { value: /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, message: 'Password must contain at least one uppercase letter and one special character' },
              minLength: { value: 8, message: "Password should contain at least 8 characters" }
            })}
            className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs sm:text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: 'Confirm Password is required',
              validate: (value) => value === watch('password') || 'Passwords do not match'
            })}
            className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            placeholder="••••••••"
            onPaste={(e) => e.preventDefault()} // disable paste
          />
          {errors.confirmPassword && <p className="text-xs sm:text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-center">
          <button type="submit" disabled={isSubmitting || isLoading} className="Btn">
            {isSubmitting || isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>

        {errorResponse && <p className="text-xs sm:text-sm text-red-500 text-center">{errorResponse}</p>}

      </form>

      {/* Login Link */}
      <div className='login mt-8 text-center'>
        <p className="text-xs sm:text-sm text-white">
          Already have an account?{' '}
          <a href="/unified-health-tech/login" className="text-[#9485FF] hover:underline">Login</a>
        </p>
      </div>

    </div>
  );
}

export default Register;
