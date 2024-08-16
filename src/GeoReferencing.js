import React, { useState } from 'react';
import * as math from 'mathjs';
import planImage from './plan.png'

const calculateAffineTransformation = (points, gpsCoords) => {
  const A = [];
  const B = [];

  for (let i = 0; i < 4; i++) {
    A.push([points[i].x, points[i].y, 1, 0, 0, 0]);
    A.push([0, 0, 0, points[i].x, points[i].y, 1]);
    B.push(gpsCoords[i].lat);
    B.push(gpsCoords[i].lon);
  }

  try {
    const A_matrix = math.matrix(A);
    const B_matrix = math.matrix(B);

    const A_pseudoInverse = math.pinv(A_matrix);
    const affineParams = math.multiply(A_pseudoInverse, B_matrix);

    return affineParams;
  } catch (error) {
    console.error("Fehler beim Berechnen der affinen Transformation:", error);
    return null;
  }
};

const transformPointToGPS = (x, y, affineParams) => {
  const lat = affineParams.get([0]) * x + affineParams.get([1]) * y + affineParams.get([2]);
  const lon = affineParams.get([3]) * x + affineParams.get([4]) * y + affineParams.get([5]);
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
      if (params) {
        setAffineParams(params);
        alert("Transformation erfolgreich berechnet!");
      } else {
        alert("Fehler bei der Berechnung der Transformation.");
      }
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
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={planImage}
          alt="Grundriss"
          onClick={handleImageClick}
          style={{ border: '1px solid black', cursor: 'pointer' }}
        />
        {points.map((point, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: point.y - 5,
              left: point.x - 5,
              width: 10,
              height: 10,
              backgroundColor: 'red',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
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
        style={{ border: '1px solid red', cursor: 'crosshair' }}
      />
    </div>
  );
};

export default GeoReferencing;
