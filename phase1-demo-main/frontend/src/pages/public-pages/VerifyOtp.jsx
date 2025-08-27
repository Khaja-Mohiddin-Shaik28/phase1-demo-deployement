import React, { useState, useEffect } from 'react';
import { useVerifyOtpApiMutation, useResendOtpApiMutation } from '../../services/LoginRegisterApi';
import { useSearchParams, useNavigate } from 'react-router-dom';

function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyOtp] = useVerifyOtpApiMutation();
  const [resendOtp] = useResendOtpApiMutation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailId = searchParams.get('email') || '';

  const [cooldown, setCooldown] = useState(0); // seconds left
  const [blocked, setBlocked] = useState(false); // 24h block flag
  const [verifyingDisabled, setVerifyingDisabled] = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Input handlers
  const handleChange = (e, index) => {
    const val = e.target.value;
    if (/^\d?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      if (val && index < otp.length - 1) document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(''));
      document.getElementById("otp-5")?.focus();
    }
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      const res = await resendOtp({ emailId }).unwrap();
      if (res.blocked) {
        setBlocked(true);
        setVerifyingDisabled(true);
        alert("Too many attempts. Try again after 24 hours.");
      } else {
        alert("OTP resent!");
        setCooldown(60); // 1-minute cooldown
      }
    } catch (err) {
      alert(err?.data?.status || "Failed to resend OTP");
    }
  };

  // Verify OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    try {
      const res = await verifyOtp({ emailId, otp: otpValue }).unwrap();
      if (res.blocked) {
        setBlocked(true);
        setVerifyingDisabled(true);
        alert("Too many wrong attempts. Try again after 24 hours.");
      } else {
        alert("OTP verified successfully!");
        navigate(`/unified-health-tech/login/reset-password?email=${encodeURIComponent(emailId)}`);
      }
    } catch (err) {
      if (err?.data?.blocked) {
        setBlocked(true);
        setVerifyingDisabled(true);
        alert("Too many wrong attempts. Try again after 24 hours.");
      } else {
        alert(err?.data?.status || "OTP verification failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-white rounded-2xl p-8 sm:p-10 md:p-12 lg:p-16 w-[90%] sm:w-[80%] md:w-[70%] lg:w-[50%] shadow-lg text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Unified Health Tech Solutions</h1>
        <p className="text-gray-600 mb-3 sm:mb-6 text-sm sm:text-base">Enter OTP</p>
        <p className="text-gray-500 text-xs sm:text-sm mb-8">We have sent an OTP to your email id</p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between mb-6" onPaste={handlePaste}>
            {otp.map((val, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9485FF] text-base sm:text-lg md:text-xl"
                disabled={blocked}
              />
            ))}
          </div>

          {/* Verify Button */}
                  <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={verifyingDisabled || blocked}
            className={"Btn"}
          >
            Verify OTP
          </button>
          </div>
        </form>

        {/* Resend OTP */}
        <p className="text-gray-500 mt-4 text-xs sm:text-sm md:text-base">
          Didn't receive code?{" "}
          <span
            className={`${
              cooldown > 0 || blocked
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#9485FF] cursor-pointer hover:underline"
            }`}
            onClick={cooldown > 0 || blocked ? undefined : handleResend}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;
