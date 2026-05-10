/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L, { LatLngLiteral } from "leaflet";

import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  value: LatLngLiteral;
  onChange: (position: LatLngLiteral) => void;
  zoom?: number;
  height?: string;
};

function ChangeView({ center }: { center: LatLngLiteral }) {
  const map = useMap();

  map.setView(center);

  return null;
}

function LocationMarker({
  value,
  onChange,
}: {
  value: LatLngLiteral;
  onChange: (position: LatLngLiteral) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng);
    },
  });

  return <Marker position={value} />;
}

export default function MapPicker({
  value,
  onChange,
  zoom = 13,
  height = "500px",
}: Props) {
  return (
    <MapContainer
      center={value}
      zoom={zoom}
      style={{
        height,
        width: "100%",
        borderRadius: "16px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ChangeView center={value} />

      <LocationMarker value={value} onChange={onChange} />
    </MapContainer>
  );
}
