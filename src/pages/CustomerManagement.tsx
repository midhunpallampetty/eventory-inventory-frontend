import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import Navbar from './Navbar';
interface Customer {
  _id: string;
  name: string;
  address: string;
  mobile: string;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<Customer>({ _id: '', name: '', address: '', mobile: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  const fetchCustomers = async () => {
    try {
      const { data } = await axiosInstance.get('/customers');
      setCustomers(data);
    } catch (error: any) {
      console.error('Error fetching customers:', error.message);
    }
  };

  const searchCustomers = async () => {
    try {
      const { data } = await axiosInstance.get('/customers/search', {
        params: { q: searchQuery },
      });
      setCustomers(data);
    } catch (error: any) {
      console.error('Error searching customers:', error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosInstance.put('/customers', form);
      } else {
        await axiosInstance.post('/customers', form);
      }
      fetchCustomers();
      closeModal();
      resetForm();
    } catch (error: any) {
      console.error('Error saving customer:', error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete('/customers', { data: { id } });
      fetchCustomers();
    } catch (error: any) {
      console.error('Error deleting customer:', error.message);
    }
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setForm(customer);
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({ _id: '', name: '', address: '', mobile: '' });
    setIsEditing(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() === '') {
      fetchCustomers(); // Fetch all customers if search query is cleared
    } else {
      searchCustomers(); // Perform search
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Navbar/>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Management</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={handleSearch}
                className="border rounded-md px-4 py-2 w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => openModal()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
              >
                Add New Customer
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {customers.map((customer: Customer) => (
                    <tr key={customer._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">{customer.name}</td>
                      <td className="px-4 py-3">{customer.address}</td>
                      <td className="px-4 py-3">{customer.mobile}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openModal(customer)}
                          className="text-blue-500 hover:text-blue-600 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {isEditing ? 'Edit Customer' : 'Add New Customer'}
              </h3>
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
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    Mobile
                  </label>
                  <input
                    type="text"
                    id="mobile"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
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
                    {isEditing ? 'Update' : 'Add'}
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
