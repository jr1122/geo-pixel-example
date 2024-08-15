import React, { useState } from 'react';
import planImage from './plan.png'


// Hilfsfunktion zur Berechnung der affinen Transformation
const calculateAffineTransformation = (points, gpsCoords) => {
  const Math = require('mathjs');

  const A = [];
  const B = [];

  for (let i = 0; i < 4; i++) {
    A.push([points[i].x, points[i].y, 1, 0, 0, 0]);
    A.push([0, 0, 0, points[i].x, points[i].y, 1]);
    B.push(gpsCoords[i].lat);
    B.push(gpsCoords[i].lon);
  }

  // Verwende das least squares method (Lösungen linearer Gleichungssysteme)
  const A_matrix = Math.matrix(A);
  const B_matrix = Math.matrix(B);
  const affineParams = Math.lusolve(A_matrix, B_matrix);

  return affineParams;
};

// Transformation von Pixeln zu GPS-Koordinaten
const transformPointToGPS = (x, y, affineParams) => {
  const lat = affineParams[0] * x + affineParams[1] * y + affineParams[2];
  const lon = affineParams[3] * x + affineParams[4] * y + affineParams[5];
  return { lat, lon };
};

const GeoReferencing = () => {
  const [points, setPoints] = useState([]);
  const [gpsCoords, setGpsCoords] = useState([]);
  const [affineParams, setAffineParams] = useState(null);

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (points.length < 4) {
      setPoints([...points, { x, y }]);
    }
  };

  const handleGpsInput = (index, lat, lon) => {
    const newCoords = [...gpsCoords];
    newCoords[index] = { lat: parseFloat(lat), lon: parseFloat(lon) };
    setGpsCoords(newCoords);
  };

  const handleCalculateTransformation = () => {
    if (points.length === 4 && gpsCoords.length === 4) {
      const params = calculateAffineTransformation(points, gpsCoords);
      setAffineParams(params);
    }
  };

  const handleTransformClick = (e) => {
    if (affineParams) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const gps = transformPointToGPS(x, y, affineParams);
      alert(`GPS Coordinates: Latitude: ${gps.lat}, Longitude: ${gps.lon}`);
    }
  };

  return (
    <div>
      <h1>Georeferenzierung des Grundrisses</h1>
      <p>Klicken Sie auf das Bild, um 4 Kontrollpunkte auszuwählen und geben Sie die entsprechenden GPS-Koordinaten ein.</p>
      <img
        src={planImage}
        alt="Grundriss"
        onClick={handleImageClick}
        style={{ border: '2px solid black', cursor: 'pointer' }}
      />
      <div>
        {points.map((point, index) => (
          <div key={index}>
            <h3>Kontrollpunkt {index + 1}</h3>
            <p>Pixel-Koordinaten: X: {point.x}, Y: {point.y}</p>
            <label>
              Latitude:
              <input
                type="number"
                step="any"
                onChange={(e) => handleGpsInput(index, e.target.value, gpsCoords[index]?.lon || 0)}
              />
            </label>
            <label>
              Longitude:
              <input
                type="number"
                step="any"
                onChange={(e) => handleGpsInput(index, gpsCoords[index]?.lat || 0, e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
      <button onClick={handleCalculateTransformation}>Transformation Berechnen</button>
      <p>Jetzt auf das Bild klicken, um die WGS84-Koordinaten zu erhalten.</p>
      <img
        src={planImage}
        alt="Grundriss"
        onClick={handleTransformClick}
        style={{ border: '2px solid red', cursor: 'crosshair' }}
      />
    </div>
  );
};

export default GeoReferencing;
