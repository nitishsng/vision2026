"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  staffWithId,
  serviceWithId,
  PatientFullTypeWithObjectId,
  ExpenseWithId,
} from "./type";

export function useDashboardData() {
  const [staffs, setStaffs] = useState<staffWithId[]>([]);
  const [services, setServices] = useState<serviceWithId[]>([]);
  const [patients, setPatients] = useState<PatientFullTypeWithObjectId[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      // 1️⃣ Get user from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "null");

      // 2️⃣ STOP if no user or invalid role (prevents 403 on homepage)
      if (!user || (user.role !== "admin" && user.role !== "operator")) {
        return;
      }

      setIsLoading(true);

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
        return;
      }

      const data = await res.json();
      setStaffs(data.staff || []);
      setServices(data.services || []);
      setPatients(data.patients || []);
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { staffs, services, patients, expenses, fetchData, isLoading };
}
