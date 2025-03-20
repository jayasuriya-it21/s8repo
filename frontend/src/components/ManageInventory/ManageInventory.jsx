import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageInventory.css";

const ManageInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [newItem, setNewItem] = useState({ productId: "", name: "", stockRemaining: 0, image: null });
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State for image popup

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setInventory(res.data);
        setFilteredInventory(res.data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = inventory.filter(
      (item) =>
        item.productId.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
    );
    setFilteredInventory(filtered);
  };

  const handleAddProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("productId", newItem.productId);
      formData.append("name", newItem.name);
      formData.append("stockRemaining", newItem.stockRemaining);
      if (newItem.image) formData.append("image", newItem.image);

      const res = await axios.post("http://localhost:5000/api/products", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedInventory = [...inventory, res.data];
      setInventory(updatedInventory);
      setFilteredInventory(updatedInventory);
      setNewItem({ productId: "", name: "", stockRemaining: 0, image: null });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEdit = (item) => {
    setNewItem({ ...item, image: null });
    setEditingItem(item._id);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("productId", newItem.productId);
      formData.append("name", newItem.name);
      formData.append("stockRemaining", newItem.stockRemaining);
      if (newItem.image) formData.append("image", newItem.image);

      const res = await axios.put(`http://localhost:5000/api/products/${editingItem}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedInventory = inventory.map((item) => (item._id === editingItem ? res.data : item));
      setInventory(updatedInventory);
      setFilteredInventory(updatedInventory);
      setEditingItem(null);
      setNewItem({ productId: "", name: "", stockRemaining: 0, image: null });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const updatedInventory = inventory.filter((item) => item._id !== id);
      setInventory(updatedInventory);
      setFilteredInventory(updatedInventory);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "image" ? files[0] : name === "stockRemaining" ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setNewItem({ productId: "", name: "", stockRemaining: 0, image: null });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleImageClick = (imageBase64) => {
    setSelectedImage(imageBase64);
  };

  const closeImagePopup = () => {
    setSelectedImage(null);
  };

  return (
    <div className="manage-inventory">
      <div className="container">
        <h3 className="inventory-title">Manage Inventory</h3>
        <div className="inventory-header">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by Product ID or Name"
            className="search-input"
          />
          <button onClick={openAddModal} className="add-btn">Add Product</button>
        </div>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Stock</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item._id}>
                <td>{item.productId}</td>
                <td>{item.name}</td>
                <td>{item.stockRemaining}</td>
                <td>
                  {item.image && (
                    <img
                      src={`data:image/jpeg;base64,${item.image}`}
                      alt={item.name}
                      width="50"
                      className="inventory-image"
                      onClick={() => handleImageClick(item.image)}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </td>
                <td>
                  <button onClick={() => handleEdit(item)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content card">
              <h4>{editingItem ? "Update Product" : "Add New Product"}</h4>
              <input
                name="productId"
                value={newItem.productId}
                onChange={handleChange}
                placeholder="Product ID"
                className="form-input"
              />
              <input
                name="name"
                value={newItem.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="form-input"
              />
              <input
                name="stockRemaining"
                type="number"
                value={newItem.stockRemaining}
                onChange={handleChange}
                placeholder="Stock"
                className="form-input"
              />
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="form-input file-input"
              />
              {editingItem && newItem.image === null && (
                <p className="image-note">Leave blank to keep existing image</p>
              )}
              <div className="modal-actions">
                <button onClick={editingItem ? handleUpdate : handleAddProduct} className="save-btn">
                  {editingItem ? "Update" : "Add"}
                </button>
                <button onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Image Popup Modal */}
        {selectedImage && (
          <div className="image-popup-overlay" onClick={closeImagePopup}>
            <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
              <img
                src={`data:image/jpeg;base64,${selectedImage}`}
                alt="Large view"
                className="large-image"
              />
              <button onClick={closeImagePopup} className="close-btn">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageInventory;