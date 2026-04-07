import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MyMap = ({ data, reroutePath }) => { 
  return (
    <div style={{ 
      height: "400px", 
      width: "90%", 
      margin: "20px auto", 
      border: "2px solid #30363d", 
      borderRadius: "10px", 
      overflow: "hidden",
      boxShadow: "0 4px 15px rgba(0,0,0,0.5)"
    }}>
      <MapContainer center={[24.0, 54.0]} zoom={4} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {data.map((item) => (
          <React.Fragment key={item.id}>
            
            <Marker position={[item.lat, item.lng]}>
              <Popup>
                <div style={{ color: "#0d1117" }}>
                  <strong>📦 {item.product}</strong><br/>
                  📍 Route: {item.route}<br/>
                  ⚠️ Status: <span style={{ color: item.status === "High Risk" ? "red" : "green" }}>{item.status}</span>
                </div>
              </Popup>
            </Marker>
            
            {item.status === "High Risk" && (
              <>
                <Polyline 
                  positions={[
                    [item.lat - 2, item.lng - 4], 
                    [item.lat - 1, item.lng - 2], 
                    [item.lat, item.lng]
                  ]} 
                  color="#ff4b2b" 
                  dashArray="5, 10" 
                  weight={2} 
                />
                
                <Circle 
                  center={[item.lat + 1, item.lng + 1]} 
                  radius={250000} 
                  pathOptions={{ 
                    fillColor: 'rgba(128, 128, 128, 0.5)', 
                    color: 'gray', 
                    weight: 1 
                  }} 
                >
                  <Popup>🚨 Threat Zone: Storm & Pirate Activity Reported</Popup>
                </Circle>
              </>
            )}
          </React.Fragment>
        ))}

        {reroutePath && reroutePath.length > 0 && (
          <Polyline 
            positions={reroutePath} 
            color="#0088FE" 
            weight={4} 
            opacity={0.8}
            dashArray="10, 10"
          >
            <Popup>🛡️ AI Strategy: Emergency Safe Corridor</Popup>
          </Polyline>
        )}
      </MapContainer>
    </div>
  );
}

export default MyMap;