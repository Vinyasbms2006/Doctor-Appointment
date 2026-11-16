import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Link } from 'react-router-dom'

const doctorIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const userIcon = L.divIcon({
  className: '',
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#5f6FFF;border:3px solid #fff;box-shadow:0 0 0 2px #5f6FFF"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const Recenter = ({ center, zoom }) => {
  const map = useMap()
  useEffect(() => { map.setView([center.lat, center.lng], zoom) }, [map, center.lat, center.lng, zoom])
  return null
}

const DoctorsMap = ({ center, radiusKm, doctors }) => {
  const zoom = radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : radiusKm <= 25 ? 11 : 10
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false} className='w-full h-[460px] rounded-xl border border-blue-200 z-0'>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <Recenter center={center} zoom={zoom} />
      <Marker position={[center.lat, center.lng]} icon={userIcon}><Popup>Your location</Popup></Marker>
      <Circle center={[center.lat, center.lng]} radius={radiusKm * 1000} pathOptions={{ color: '#5f6FFF', weight: 1, fillOpacity: 0.05 }} />
      {doctors.map(({ doctor, location, distance }) => (
        <Marker key={doctor._id} position={[location.lat, location.lng]} icon={doctorIcon}>
          <Popup>
            <p className='font-medium'>{doctor.name}</p>
            <p>{doctor.speciality}</p>
            <p>{distance.toFixed(1)} km away</p>
            <Link to={`/appointment/${doctor._id}`} className='text-primary underline'>Book appointment</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default DoctorsMap
