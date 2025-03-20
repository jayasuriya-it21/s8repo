import { useEffect, useState } from "react";
import axios from "axios";
import "./AvailableMaterials.css";

function AvailableMaterials() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const res = await axios.get("http://localhost:5000/materials");
        setMaterials(res.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    }
    fetchMaterials();
  }, []);

  return (
    <div className="materials-container">
      <div className="container materials-card"> {/* Use global .container and custom .materials-card */}
        <h2 className="materials-title">Available Materials</h2>
        <ul className="materials-list">
          {materials.map((material) => (
            <li key={material._id} className="material-item">
              <span>{material.name}</span> {/* Separate name for styling */}
              <span>{material.quantity} pcs available</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AvailableMaterials;