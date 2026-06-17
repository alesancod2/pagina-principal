'use client';

import React, { useCallback, useMemo } from 'react';

// ===================== TIPOS =====================

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  icon?: string;
}

export interface MapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  userPosition?: { lat: number; lng: number } | null;
  onMarkerClick?: (marker: MapMarker) => void;
  height?: string;
  width?: string;
  showUserMarker?: boolean;
  className?: string;
}

// ===================== COMPONENTE =====================

/**
 * Componente placeholder para integracao com Google Maps
 * Estrutura preparada para @react-google-maps/api
 *
 * Para ativar o mapa real, instalar:
 * npm install @react-google-maps/api
 *
 * E configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no .env
 */
export function MapView({
  center = { lat: -23.5505, lng: -46.6333 }, // Sao Paulo padrao
  zoom = 13,
  markers = [],
  userPosition = null,
  onMarkerClick,
  height = '400px',
  width = '100%',
  showUserMarker = true,
  className = '',
}: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const mapCenter = useMemo(() => {
    if (userPosition) return userPosition;
    return center;
  }, [userPosition, center]);

  const handleMarkerClick = useCallback(
    (marker: MapMarker) => {
      if (onMarkerClick) {
        onMarkerClick(marker);
      }
    },
    [onMarkerClick],
  );

  // Placeholder quando nao ha API key configurada
  if (!apiKey) {
    return (
      <div
        className={`map-view-placeholder ${className}`}
        style={{
          width,
          height,
          backgroundColor: '#e5e7eb',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #9ca3af',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            style={{ marginBottom: '12px' }}
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px' }}>
            Mapa indisponivel
          </p>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
            Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para visualizar o mapa
          </p>
        </div>

        {/* Mostrar marcadores como lista quando nao ha mapa */}
        {markers.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              maxHeight: '120px',
              overflowY: 'auto',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '8px',
              padding: '8px',
            }}
          >
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px' }}>
              {markers.length} parceiro(s) encontrado(s):
            </p>
            {markers.slice(0, 5).map((marker) => (
              <div
                key={marker.id}
                onClick={() => handleMarkerClick(marker)}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: '#374151',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  marginBottom: '2px',
                }}
              >
                📍 {marker.title}
              </div>
            ))}
            {markers.length > 5 && (
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                +{markers.length - 5} mais...
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Estrutura preparada para @react-google-maps/api
  // Quando a lib estiver instalada, descomente e use:
  //
  // import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
  //
  // return (
  //   <LoadScript googleMapsApiKey={apiKey}>
  //     <GoogleMap
  //       mapContainerStyle={{ width, height }}
  //       center={mapCenter}
  //       zoom={zoom}
  //     >
  //       {showUserMarker && userPosition && (
  //         <Marker
  //           position={userPosition}
  //           icon={{
  //             path: google.maps.SymbolPath.CIRCLE,
  //             scale: 8,
  //             fillColor: '#4285F4',
  //             fillOpacity: 1,
  //             strokeColor: '#ffffff',
  //             strokeWeight: 2,
  //           }}
  //         />
  //       )}
  //       {markers.map((marker) => (
  //         <Marker
  //           key={marker.id}
  //           position={{ lat: marker.lat, lng: marker.lng }}
  //           title={marker.title}
  //           onClick={() => handleMarkerClick(marker)}
  //         />
  //       ))}
  //     </GoogleMap>
  //   </LoadScript>
  // );

  return (
    <div
      className={`map-view ${className}`}
      style={{ width, height, backgroundColor: '#f3f4f6', borderRadius: '12px' }}
    >
      <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
        Google Maps carregando...
      </p>
    </div>
  );
}

export default MapView;
