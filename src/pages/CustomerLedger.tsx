import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axiosInstance from "../config/axiosInstance"; // Adjust your axios import
import { utils, writeFile } from "xlsx"; // For Excel export
import jsPDF from "jspdf"; // For PDF generation
import "jspdf-autotable";  // Import the autoTable plugin

interface Customer {
  _id: string;
  name: string;
  address: string;
}

interface Transaction {
  _id: string;
  itemId: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  customerName: string;
  saleType: string;
  date: string;
}

const CustomerLedgerPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get("/customers");
        setCustomers(response.data);
      } catch (err: any) {
        console.error("Error fetching customers:", err.message);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = event.target.value;
    setSelectedCustomerId(customerId);

    if (!customerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/customer/ledger", { customerId });
      const { customer, transactions, totalBalance } = response.data;

      setCustomerDetails(customer);
      setTransactions(transactions);
      setTotalBalance(totalBalance);
    } catch (err: any) {
      console.error("Error fetching ledger details:", err.message);
      setError("Failed to fetch ledger details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = transactions.map((transaction) => ({
      Date: new Date(transaction.date).toLocaleDateString(),
      Item: transaction.itemId.name,
      Quantity: transaction.quantity,
      Price: transaction.itemId.price.toFixed(2),
      "Sale Type": transaction.saleType,
    }));
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Transactions");
    writeFile(workbook, "CustomerLedger.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Customer Ledger", 14, 10);
    doc.text(`Customer: ${customerDetails?.name}`, 14, 20);
  
    // Add table using autoTable plugin
    doc.autoTable({
      startY: 30,
      head: [["Date", "Item", "Quantity", "Price", "Sale Type"]],
      body: transactions.map((transaction) => [
        new Date(transaction.date).toLocaleDateString(),
        transaction.itemId.name,
        transaction.quantity.toString(),
        `$${transaction.itemId.price.toFixed(2)}`,
        transaction.saleType,
      ]),
    });
    doc.save("CustomerLedger.pdf");
  };

  // Print transactions
  const printTransactions = () => {
    window.print();
  };

  // Open Email Modal
  const openEmailModal = () => {
    setEmailModalOpen(true);
  };

  // Close Email Modal
  const closeEmailModal = () => {
    setEmailModalOpen(false);
    setEmail(""); // Clear the email input
  };

  // Send the ledger email
 // Send the ledger email
const emailLedger = async () => {
    if (!email) {
      alert("Please provide an email address.");
      return;
    }
  
    // Prepare the data to be sent along with the email
    const ledgerData = {
      customerId: selectedCustomerId,
      email,
      ledgerDetails:transactions,  // Include transactions in the email data
    };
  
    try {
      await axiosInstance.post("/send-ledger-email", ledgerData); // Send data along with email
      alert("Ledger emailed successfully.");
      closeEmailModal();
    } catch (err) {
      alert("Failed to email ledger. Please try again.");
    }
  };
  

  return (
    <div className="p-6 space-y-6">
      <Navbar />
      <h1 className="text-2xl font-bold">Customer Ledger</h1>

      {/* Customer Selection Dropdown */}
      <div className="space-y-2">
        <label htmlFor="customer-select" className="block text-lg font-semibold">
          Select a Customer:
        </label>
        <select
          id="customer-select"
          value={selectedCustomerId}
          onChange={handleCustomerChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">-- Select Customer --</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500">{error}</div>}

      {/* Loading State */}
      {loading && <div>Loading...</div>}

      {/* Customer Details */}
      {customerDetails && (
        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold">Customer Details</h2>
          <p>Name: {customerDetails.name}</p>
          <p>Address: {customerDetails.address}</p>
        </div>
      )}

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <>
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Sale Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{transaction.itemId.name}</td>
                    <td className="px-4 py-2">{transaction.quantity}</td>
                    <td className="px-4 py-2">${transaction.itemId.price.toFixed(2)}</td>
                    <td className="px-4 py-2">{transaction.saleType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Options */}
          <div className="flex gap-4 mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={printTransactions}>
              Print
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={exportToExcel}>
              Export to Excel
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={exportToPDF}>
              Export to PDF
            </button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={openEmailModal}>
              Email Ledger
            </button>
          </div>
        </>
      )}

      {/* No Transactions Message */}
      {selectedCustomerId && transactions.length === 0 && !loading && (
        <div>No transactions available for this customer.</div>
      )}

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Enter Email Address</h2>
            <input
              type="email"
              className="w-full p-2 border rounded-md mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={closeEmailModal}
              >
                Cancel
              </button>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                onClick={emailLedger}
              >
                Send Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLedgerPage;
