"use client"

import React, { useState, useEffect } from 'react'
import axiosInstance from '../config/axiosInstance'
import { CSVLink } from 'react-csv'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import Navbar from './Navbar'
// types/Sale.ts
export interface Item {
  name: string
  description: string
  price: number
}

export interface Customer {
  name: string
  address: string
}

export interface Sale {
  _id: string
  itemId: Item
  customerId?: Customer
  quantity: number
  date: string
  saleType: 'Cash' | 'Card' | 'Online'
  customerName: string
}

const SalesReport = () => {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [filter, setFilter] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [chartData, setChartData] = useState<any[]>([])
  const [chartPeriod, setChartPeriod] = useState('day')

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data } = await axiosInstance.get('/sales')
        setSales(data)
        setFilteredSales(data)
        updateChartData(data, chartPeriod)
      } catch (error: any) {
        console.error('Error fetching sales:', error.message)
      }
    }

    fetchSales()
  }, [])

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase()
    setFilter(value)
    const filtered = sales.filter(
      (sale: Sale) =>
        sale.customerName.toLowerCase().includes(value) ||
        sale.itemId?.name.toLowerCase().includes(value) ||
        sale.saleType.toLowerCase().includes(value)
    )
    setFilteredSales(filtered)
    updateChartData(filtered, chartPeriod)
  }

  const handleSort = (field: string) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortOrder(order)

    const sortedSales = [...filteredSales].sort((a: any, b: any) => {
      if (a[field] < b[field]) return order === 'asc' ? -1 : 1
      if (a[field] > b[field]) return order === 'asc' ? 1 : -1
      return 0
    })

    setFilteredSales(sortedSales)
    updateChartData(sortedSales, chartPeriod)
  }

  const updateChartData = (salesData: Sale[], period: string) => {
    const groupedData: { [key: string]: number } = {}

    salesData.forEach((sale) => {
      const date = new Date(sale.date)
      let key: string

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'year':
          key = `${date.getFullYear()}`
          break
        default:
          key = date.toISOString().split('T')[0]
      }

      groupedData[key] = (groupedData[key] || 0) + sale.quantity
    })

    const chartData = Object.entries(groupedData).map(([date, totalSales]) => ({
      date,
      totalSales,
    }))

    setChartData(chartData.sort((a, b) => a.date.localeCompare(b.date)))
  }

  const handleChartPeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setChartPeriod(value)
    updateChartData(filteredSales, value)
  }

  return (
    <div className="container mx-auto p-4">
      <Navbar/>
      <h1 className="text-2xl font-bold mb-4">Sales Report</h1>
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          value={filter}
          onChange={handleFilter}
          placeholder="Search by customer, item, or type"
          className="p-2 border rounded-md w-1/2"
        />
        <CSVLink
          data={filteredSales}
          filename={`sales_report_${new Date().toISOString()}.csv`}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Export CSV
        </CSVLink>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Sales Chart</h2>
        <p className="text-gray-600 mb-4">Total sales over time</p>
        <div className="mb-4">
          <select
            onChange={handleChartPeriodChange}
            value={chartPeriod}
            className="border rounded-md p-2"
          >
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalSales" stroke="#3b82f6" strokeWidth={3}  name="Total Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('itemId.name')}>
                Item
              </th>
              <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('customerName')}>
                Customer
              </th>
              <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('quantity')}>
                Quantity
              </th>
              <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('saleType')}>
                Sale Type
              </th>
              <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('date')}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale: Sale, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{sale.itemId?.name || 'Unknown'}</td>
                <td className="border border-gray-300 p-2">{sale.customerName || 'Anonymous'}</td>
                <td className="border border-gray-300 p-2">{sale.quantity}</td>
                <td className="border border-gray-300 p-2">{sale.saleType}</td>
                <td className="border border-gray-300 p-2">{new Date(sale.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalesReport

