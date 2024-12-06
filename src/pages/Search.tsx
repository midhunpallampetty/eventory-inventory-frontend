import { useState } from 'react';
import axiosInstance from '../config/axiosInstance';

export default function SearchInventory({ setInventory, fetchInventory }: { setInventory: Function; fetchInventory: Function }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      fetchInventory(); // Re-fetch all inventory items if the search query is empty
      return;
    }

    try {
      const { data } = await axiosInstance.get('/inventory/search', { params: { q: searchQuery } });
      setInventory(data);
    } catch (error: any) {
      console.error('Error searching inventory:', error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear search if the input becomes empty
    if (query.trim() === '') {
      fetchInventory();
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={searchQuery}
        onChange={handleChange}
        placeholder="Search inventory..."
        className="border p-2 rounded w-2/3"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white p-2 rounded ml-2"
      >
        Search
      </button>
    </div>
  );
}
