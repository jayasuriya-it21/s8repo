import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RequestForm.css";

const RequestForm = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For image popup
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    purpose: "",
    isReturnable: false,
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = products.filter(
      (product) =>
        (product.name?.toLowerCase() || "").includes(query) ||
        (product.productId?.toLowerCase() || "").includes(query)
    );
    setFilteredProducts(filtered);
  };

  const openRequestModal = (product) => {
    setFormData({
      productId: product._id,
      quantity: "",
      purpose: "",
      isReturnable: false,
      fromDate: "",
      toDate: "",
    });
    setIsModalOpen(true);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeImagePopup = () => {
    setSelectedImage(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedProduct = products.find((p) => p._id === formData.productId);
    if (parseInt(formData.quantity) > selectedProduct.stockRemaining) {
      alert("Requested quantity exceeds available stock!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/requests",
        { ...formData, requestDate: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Request submitted successfully!");
      setFormData({
        productId: "",
        quantity: "",
        purpose: "",
        isReturnable: false,
        fromDate: "",
        toDate: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    }
  };

  return (
    <div className="request-form-container">
      <div className="products-header">
        <h2 className="products-title">Available Products</h2>
        <input
          type="text"
          placeholder="Search by Name or ID"
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>
      <div className="products-list">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Stock</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product.productId}</td>
                  <td>{product.name}</td>
                  <td>{product.stockRemaining}</td>
                  <td>
                    {product.image ? (
                      <img
                        src={`data:image/jpeg;base64,${product.image}`}
                        alt={product.name}
                        className="product-image"
                        onClick={() => handleImageClick(product.image)}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openRequestModal(product)}
                      className="request-btn"
                    >
                      Request
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-products">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Request Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Request Product</h3>
            <form onSubmit={handleSubmit} className="request-form">
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="form-input"
                disabled
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.stockRemaining} available)
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                required
                className="form-input"
                min="1"
              />
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Purpose of Request"
                required
                className="form-textarea"
              />
              <label>
                <input
                  type="checkbox"
                  name="isReturnable"
                  checked={formData.isReturnable}
                  onChange={handleChange}
                />
                Returnable Item
              </label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                required
                className="form-input"
              />
              {formData.isReturnable && (
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              )}
              <div className="modal-actions">
                <button type="submit" className="submit-btn">Submit Request</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Popup Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeImagePopup}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="Large Product View"
              className="large-product-image"
            />
            <button onClick={closeImagePopup} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestForm;