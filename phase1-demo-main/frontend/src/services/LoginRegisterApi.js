import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const LoginRegisterApi = createApi({
  reducerPath: "LoginRegisterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    registerApi: builder.mutation({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        credentials: "include",
      }),
    }),
    duplicateUserIdCheckerApi: builder.mutation({
      query: (userId) => ({
        url: "/duplicateUserIdChecker",
        method: "POST",
        body: userId,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        credentials: "include",
      }),
    }),
    loginApi: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        credentials: "include",
      }),
    }),
    verifyRoute: builder.query({
      query: (userId) => ({
        url: `/dashboard/${userId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    sendOtpApi: builder.mutation({
      query: (emailId) => ({
        url: "/send-otp",
        method: "POST",
        body: { emailId },
      }),
    }),
    verifyOtpApi: builder.mutation({
      query: ({ emailId, otp }) => ({
        url: "/verify-otp",
        method: "POST",
        body: { emailId, otp },
      }),
    }),
    resendOtpApi: builder.mutation({
      query: (emailId) => ({
        url: "/resend-otp",
        method: "POST",
        body: { emailId },
      }),
    }),

    resetPasswordApi: builder.mutation({
      query: ({ emailId, newPassword }) => ({
        url: "/reset-password",
        method: "POST",
        body: { emailId, newPassword },
      }),
    }),
  }),
});

export const {
  useRegisterApiMutation,
  useDuplicateUserIdCheckerApiMutation,
  useLoginApiMutation,
  useVerifyRouteQuery,
  useSendOtpApiMutation,
  useVerifyOtpApiMutation,
  useResendOtpApiMutation,
  useResetPasswordApiMutation,
} = LoginRegisterApi;
