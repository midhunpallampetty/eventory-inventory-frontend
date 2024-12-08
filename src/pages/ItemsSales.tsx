import React, { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance"; // Adjust your axios import
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import Navbar from "./Navbar";

interface Item {
  _id: string;
  name: string;
  description: string;
  totalSold: number; // Total quantity sold
  revenue: number; // Total revenue
}

const ItemsReport: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchItemsReport = async () => {
      try {
        const { data } = await axiosInstance.get("/report");
        setItems(data);
      } catch (error: any) {
        console.error("Error fetching items report:", error.message);
      }
    };

    fetchItemsReport();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Navbar/>
      <h1 className="text-2xl font-bold">Items Report</h1>

      {/* Items Table */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th className="px-4 py-2">Item Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Total Sold</th>
              <th className="px-4 py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2">{item.totalSold}</td>
                <td className="px-4 py-2">${item.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalSold" fill="#3b82f6" name="Total Sold" />
            <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ItemsReport;
