import React, { useEffect } from "react";
import { useVerifyRouteQuery } from "../../../services/LoginRegisterApi";
import { useNavigate, useParams } from "react-router-dom";

function RetailerDashboard() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { data, isLoading, error } = useVerifyRouteQuery(userId);

  // Redirect if unauthorized
  useEffect(() => {
    if (!isLoading && (error || !data?.status)) {
      navigate("/unified-health-tech/register");
    }
  }, [error, data, isLoading, navigate]);

  if (isLoading) return <div>Loading...</div>;
  
  
  return (
    <div className="">
      <h1>Dashboard</h1>
      <p>Welcome, {data?.user?.userId || userId}</p>
    </div>
  );
}

export default RetailerDashboard;
