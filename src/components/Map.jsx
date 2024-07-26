import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import constants from "../constants/Constants";

const center = [17.385044, 78.486671];

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [previousPosition, setPreviousPosition] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/locations");
        if (Array.isArray(response.data)) {
          setLocations(response.data);
          setCurrentPosition(response.data[0]);
        } else {
          console.error("Invalid data format : ", response.data);
        }
      } catch (error) {
        console.error("Error fetching locations : ", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (isPlaying && locations.length > 0) {
      const interval = setInterval(() => {
        setPreviousPosition(currentPosition);
        setCurrentPosition((prevPosition) => {
          const currentIndex = locations.findIndex(
            (loc) => loc === prevPosition
          );
          const nextIndex = (currentIndex + 1) % locations.length;
          return locations[nextIndex];
        });
      }, 2500 / speed);

      setIntervalId(interval);
      return () => clearInterval(interval);
    } else if (!isPlaying) {
      clearInterval(intervalId);
    }
  }, [isPlaying, speed, locations, currentPosition]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const increaseSpeed = () => {
    setSpeed((prevSpeed) => (prevSpeed < 5 ? prevSpeed + 1 : 1));
  };

  const vehicleIcon = new L.Icon({
    iconUrl: "/vehicle-icon.png",
    iconSize: [38, 38],
    iconAnchor: [18, 18],
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
            url={constants.maptiler.url}
            attribution={constants.maptiler.attribution}
          />
          {currentPosition && (
            <>
              <LeafletTrackingMarker
                icon={vehicleIcon}
                position={[currentPosition.latitude, currentPosition.longitude]}
                previousPosition={
                  previousPosition
                    ? [previousPosition.latitude, previousPosition.longitude]
                    : [currentPosition.latitude, currentPosition.longitude]
                }
                duration={1000}
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
        <div className="flex justify-center mt-4">
          <button
            onClick={togglePlayPause}
            className="px-4 py-2 mr-2 text-white bg-blue-500 rounded-md"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={increaseSpeed}
            className="px-4 py-2 text-white bg-green-500 rounded-md"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
};

export default Map;
