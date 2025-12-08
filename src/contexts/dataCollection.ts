"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  staffWithId,
  serviceWithId,
  PatientFullTypeWithObjectId,
} from "./type";

export function useDashboardData() {
  const [staffs, setStaffs] = useState<staffWithId[]>([]);
  const [services, setServices] = useState<serviceWithId[]>([]);
  const [patients, setPatients] = useState<PatientFullTypeWithObjectId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1️⃣ Get user from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "null");

      // 2️⃣ Redirect if no user or invalid role
      if (!user || (user.role !== "admin" && user.role !== "operator")) {
        router.push("/");
        return;
      }

      // 3️⃣ Fetch dashboard data with user info header
      const res = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-user": JSON.stringify(user),
        },
      });

      // 4️⃣ Handle forbidden/unauthorized responses
      if (res.status === 401 || res.status === 403) {
        router.push("/");
        return;
      }

      const data = await res.json();
      setStaffs(data.staff || []);
      setServices(data.services || []);
      setPatients(data.patients || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { staffs, services, patients, fetchData, isLoading };
}
