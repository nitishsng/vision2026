"use client";

import React, { useState } from "react";
import { Plus, Receipt, Trash2, Search, TrendingDown, Calendar } from "lucide-react";
import { useDashboardData } from "@/src/contexts/dataCollection";
import { todayDate } from "@/src/contexts/type";
import { useAuth } from "@/src/contexts/AuthContext";
import { DateInput } from "../ui/DateInput";
import { Edit2, Save, X } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { isInRange } = require("@/src/utils/dateFilters.js");
import toast from "react-hot-toast";

export function ExpensesTab() {
  const { fetchData, expenses, isLoading } = useDashboardData();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    text: "",
    date: "",
  });

  const canModify = (user?.staffGrade ?? 0) >= 4;
  
  const [newExpense, setNewExpense] = useState({
    amount: "",
    text: "",
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.text) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayDate,
          amount: Number(newExpense.amount),
          text: newExpense.text,
          createdBy: { name: user?.name, id: user?.id },
          updatedBy: { name: user?.name, id: user?.id },
        }),
      });

      if (!res.ok) throw new Error("Failed to add expense");

      toast.success("Expense added successfully");
      setNewExpense({ amount: "", text: "" });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add expense");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateExpense = async (id: string) => {
    if (!editForm.amount || !editForm.text || !editForm.date) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/expense", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          amount: Number(editForm.amount),
          text: editForm.text,
          date: editForm.date,
          updatedBy: { name: user?.name, id: user?.id },
        }),
      });

      if (!res.ok) throw new Error("Failed to update expense");

      toast.success("Expense updated");
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update expense");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (expense: any) => {
    setEditingId(expense._id);
    setEditForm({
      amount: expense.amount.toString(),
      text: expense.text,
      date: expense.date,
    });
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const res = await fetch(`/api/expense?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete expense");

      toast.success("Expense deleted");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete expense");
    }
  };

  const filteredExpenses = expenses
    .filter(exp => {
      const matchesSearch = exp.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exp.amount.toString().includes(searchTerm);
      const matchesDate = isInRange(exp.date, startDate, endDate);
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      // If dates are the same, sort by ID (which includes timestamp in MongoDB)
      return (b._id || "").localeCompare(a._id || "");
    });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex flex-col md:flex-row md:items-center md:gap-[30px]">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-red-500" />
              Expenses
            </div>
            <span className="text-lg md:text-xl ml-[40px] md:ml-0 font-bold text-red-600 bg-red-50 px-4 rounded-lg border border-red-100 w-fit">
              ₹{totalExpenses.toLocaleString()}
            </span>
          </h1>
          <p className="text-gray-600 hidden md:block mt-1">Track clinic expenses and payments</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? "Cancel" : "Add Expense"}</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-sm md:max-w-md border border-red-100 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Add New Expense</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={todayDate}
                  readOnly
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-gray-500 cursor-not-allowed font-medium text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="What was it for?"
                  value={newExpense.text}
                  onChange={(e) => setNewExpense({ ...newExpense, text: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-base md:text-lg font-bold text-red-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg md:rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters Bar - Styled like the image */}
      <div className="bg-white rounded-lg p-3 md:p-5 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-end">
          {/* Search */}
          <div className="lg:col-span-5 w-full">
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">Search</label> */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Description or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Date Range and Clear */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-2 items-end w-full">
            <div>
              {/* <label className="block hide text-xs md:text-sm font-medium text-gray-700 mb-1">Start Date</label> */}
              <DateInput
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-[10px] md:text-sm"
              />
            </div>

            <div>
              {/* <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">End Date</label> */}
              <DateInput
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-[10px] md:text-sm"
              />
            </div>

            <button
              onClick={() => {
                setSearchTerm("");
                setStartDate("");
                setEndDate("");
              }}
              className="px-2 md:px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-[10px] md:text-sm font-medium border border-gray-200 h-[34px] md:h-[38px] flex items-center justify-center"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                {canModify && <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const isEditing = editingId === expense._id;
                  
                  return (
                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {isEditing ? (
                          <DateInput
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full text-xs"
                          />
                        ) : (
                          (() => {
                            const [y, m, d] = expense.date.split("-");
                            return `${d}/${m}/${y.slice(-2)}`;
                          })()
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.text}
                            onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          <div>
                            <div>{expense.text}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="w-24 px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          `₹${expense.amount.toLocaleString()}`
                        )}
                      </td>
                      {canModify && (
                        <td className="px-6 py-4 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdateExpense(expense._id!)}
                                  disabled={isSaving}
                                  className="text-teal-600 hover:text-teal-800 p-2 rounded-lg hover:bg-teal-50"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(expense)}
                                  className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense._id!)}
                                  className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No expenses found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
