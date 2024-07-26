import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const center = [17.385044, 78.486671];

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/locations");
        if (Array.isArray(response.data)) {
          setLocations(response.data);
          setPosition(response.data[0]);
        } else {
          console.error("Invalid data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      const interval = setInterval(() => {
        setPosition((prevPosition) => {
          const currentIndex = locations.findIndex(
            (loc) => loc === prevPosition
          );
          const nextIndex = (currentIndex + 1) % locations.length;
          return locations[nextIndex];
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [locations]);

  const vehicleIcon = new L.Icon({
    iconUrl: "/vehicle-icon.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const markerIcon = new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="flex items-center justify-center w-screen h-screen p-20">
      <div className="w-full h-full">
        <h1 className="mb-5 text-3xl font-bold text-center">
          Vehicle Tracker App
        </h1>
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {position && (
            <>
              <Marker
                position={[position.latitude, position.longitude]}
                icon={markerIcon}
              />
              <Polyline
                positions={locations.map((loc) => [
                  loc.latitude,
                  loc.longitude,
                ])}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
