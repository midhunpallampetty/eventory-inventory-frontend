import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import SearchInventory from './Search'; // Adjust the import path
import Navbar from './Navbar';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
interface Item {
  name: string;
  description: string;
  quantity: string;
  price: string;
  _id: string;
}

interface Sale {
  itemId: string;
  quantity: number;
  customerName?: string;
  date: string;
  saleType: 'Cash' | 'Customer';
}
interface Customer {
  _id: string;
  name: string;
  address: string;
  mobile: string;
}

export default function InventoryManagement() {
  
  const [inventory, setInventory] = useState<Item[]>([]);
  const [form, setForm] = useState<Item>({ _id: '', name: '', description: '', quantity: '', price: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [saleForm, setSaleForm] = useState<Sale>({
    itemId: '',
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    saleType: 'Cash',
    customerName: '',
  });
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axiosInstance.get('/customers');
        setCustomers(data);
      } catch (error: any) {
        console.error('Error fetching customers:', error.message);
      }
    };
  
    fetchCustomers();
  }, []);
  const fetchInventory = async () => {
    try {
      const { data } = await axiosInstance.get('/inventory');
      setInventory(data);
    } catch (error: any) {
      console.error('Error fetching inventory:', error.message);
    }
  };
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Inventory List', 14, 10);
    const tableData = inventory.map(({ name, description, quantity, price }) => [
      name,
      description,
      quantity,
      price,
    ]);
    doc.autoTable({
      head: [['Name', 'Description', 'Quantity', 'Price']],
      body: tableData,
    });
    doc.save('Inventory.pdf');
  };

  const sendEmail = async () => {
    try {
      const response = await axiosInstance.post('/send-email', { data: inventory });
      alert('Email sent successfully!');
    } catch (error: any) {
      console.error('Error sending email:', error.message);
      alert('Failed to send email.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosInstance.put('/inventory', form);
      } else {
        await axiosInstance.post('/inventory', form);
      }
      fetchInventory();
      closeModal();
      resetForm();
    } catch (error: any) {
      console.error('Error saving inventory item:', error.message);
    }
  };
  const handlePrint = () => {
    window.print();
  };
  
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(inventory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, 'Inventory.xlsx');
  };  
  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/sales', saleForm);
      fetchInventory(); // Update inventory after sale
      closeSalesModal();
    } catch (error: any) {
      console.error('Error recording sale:', error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete('/inventory', { data: { id } });
      fetchInventory();
    } catch (error: any) {
      console.error('Error deleting inventory item:', error.message);
    }
  };

  const openModal = (item?: Item) => {
    if (item) {
      setForm(item);
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const openSalesModal = (itemId: string) => {
    setSaleForm((prev) => ({ ...prev, itemId }));
    setSalesModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const closeSalesModal = () => {
    setSalesModalOpen(false);
    setSaleForm({ itemId: '', quantity: 0, date: new Date().toISOString().split('T')[0], saleType: 'Cash', customerName: '' });
  };

  const resetForm = () => {
    setForm({ _id: '', name: '', description: '', quantity: '', price: '' });
    setIsEditing(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Navbar/>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Inventory Management</h1>
        <SearchInventory setInventory={setInventory} fetchInventory={fetchInventory} />

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Inventory Items</h2>
              <button
                onClick={() => openModal()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
              >
                Add New Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" id='inventory-table'>
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {inventory.map((item: Item) => (
                    <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">${parseFloat(item.price).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => openModal(item)} className="text-blue-500 hover:text-blue-600 mr-2">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-600 mr-2">
                          Delete
                        </button>
                        <button onClick={() => openSalesModal(item._id)} className="text-green-500 hover:text-green-600">
                          Record Sale
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex space-x-4 my-4">
  <button
    onClick={handlePrint}
    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
  >
    Print
  </button>
  <button
    onClick={exportToExcel}
    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
  >
    Export to Excel
  </button>
  <button
    onClick={exportToPDF}
    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
  >
    Export to PDF
  </button>
  <button
    onClick={sendEmail}
    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
  >
    Email
  </button>
</div>

            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{isEditing ? 'Edit Item' : 'Add New Item'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 transition duration-150 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                  >
                    {isEditing ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sales Modal */}
        {salesModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Record Sale</h3>
              <form onSubmit={handleRecordSale}>
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity Sold
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="saleType" className="block text-sm font-medium text-gray-700">
                    Sale Type
                  </label>
                  <select
                    id="saleType"
                    value={saleForm.saleType}
                    onChange={(e) => setSaleForm({ ...saleForm, saleType: e.target.value as 'Cash' | 'Customer' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                    Customer Name (Optional)
                  </label>
                  <input
                    list="customerNameOptions"
                    id="customerName"
                    value={saleForm.customerName}
                    onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
                    placeholder="Select or type a customer name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <datalist id="customerNameOptions">
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer.name} />
                    ))}
                  </datalist>
                </div>

                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={saleForm.date}
                    onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeSalesModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 transition duration-150 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                  >
                    Record Sale
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
