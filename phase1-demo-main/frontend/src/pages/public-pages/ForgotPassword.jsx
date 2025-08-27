import React from 'react';
import { useForm } from 'react-hook-form';
import { useSendOtpApiMutation } from '../../services/LoginRegisterApi';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: 'onChange' });
  const [sendOtp] = useSendOtpApiMutation();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // Call API to send OTP
      const res = await sendOtp({ emailId: data.emailId }).unwrap();
      console.log(res);
      
      // Show alert
      alert("OTP sent successfully to your email. Click OK to continue.");

      // Navigate to OTP verification page with email as query param
      navigate(`/unified-health-tech/login/verify-otp?email=${encodeURIComponent(data.emailId)}`);
    } catch (err) {
      console.error(err);
      alert(err?.data?.status || 'Failed to send OTP. Try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-black px-4">

      {/* form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl p-8 sm:p-10 md:p-12 lg:p-16 w-[90%] sm:w-[80%] md:w-[70%] lg:w-[50%] shadow-lg"
      >
        {/* Headings */}
        <div className="text-center mb-6 drop-shadow-2xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Unified Health Tech Solutions</h1>
        </div>
        <div className="heading text-center mb-6">
          <p className='text-lg sm:text-xl md:text-2xl font-semibold mb-2'>Forgot password?</p>
          <p className='text-xs sm:text-sm md:text-base text-gray-600'>
            Enter your email address and we&rsquo;ll send an OTP to reset password
          </p>
        </div>

        {/* Email */}
        <div className="email">
          <label className="block font-medium text-black mb-1 mt-6">Email</label>
          <input
            type="email"
            {...register('emailId', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address'
              }
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base md:text-base"
            placeholder="you@example.com"
          />
        </div>

        {/* Submit Button */}
                <div className="flex items-center justify-center mt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="Btn "
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
