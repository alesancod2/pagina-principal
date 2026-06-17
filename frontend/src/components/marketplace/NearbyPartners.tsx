'use client';

import React, { useMemo } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useNearbyPartners } from '../../hooks/usePartners';
import {
  formatDistance,
  formatTime,
  estimateTime,
  getGoogleMapsDirectionsUrl,
} from '../../services/geolocation.service';

// ===================== TIPOS =====================

export interface NearbyPartnersProps {
  radius?: number;
  limit?: number;
  showMap?: boolean;
  className?: string;
}

// ===================== COMPONENTE =====================

/**
 * Componente que mostra parceiros proximos usando geolocalizacao
 * Combina useGeolocation + useNearbyPartners
 */
export function NearbyPartners({
  radius = 10,
  limit = 20,
  showMap = false,
  className = '',
}: NearbyPartnersProps) {
  const {
    position,
    loading: geoLoading,
    error: geoError,
    permissionStatus,
    refresh: refreshGeo,
  } = useGeolocation({ autoRefresh: false });

  const nearbyParams = useMemo(() => {
    if (!position) return undefined;
    return {
      lat: position.lat,
      lng: position.lng,
      radius,
      limit,
    };
  }, [position, radius, limit]);

  const {
    data: partnersData,
    isLoading: partnersLoading,
    error: partnersError,
    refetch: refetchPartners,
  } = useNearbyPartners(nearbyParams);

  const isLoading = geoLoading || partnersLoading;

  // Estado: Carregando geolocalizacao
  if (geoLoading) {
    return (
      <div className={`nearby-partners ${className}`} style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ marginBottom: '12px' }}>
          <div className="loading-spinner" style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }} />
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Obtendo sua localizacao...
        </p>
      </div>
    );
  }

  // Estado: Erro de geolocalizacao
  if (geoError) {
    return (
      <div className={`nearby-partners ${className}`} style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <p style={{ color: '#dc2626', fontSize: '14px', margin: '0 0 12px' }}>
            {geoError}
          </p>
          {permissionStatus === 'denied' && (
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 12px' }}>
              Para ver parceiros proximos, ative a localizacao nas configuracoes do navegador.
            </p>
          )}
          <button
            onClick={refreshGeo}
            style={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Estado: Carregando parceiros
  if (partnersLoading) {
    return (
      <div className={`nearby-partners ${className}`} style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Buscando parceiros proximos...
        </p>
      </div>
    );
  }

  // Estado: Erro ao buscar parceiros
  if (partnersError) {
    return (
      <div className={`nearby-partners ${className}`} style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <p style={{ color: '#d97706', fontSize: '14px', margin: '0 0 8px' }}>
            Erro ao buscar parceiros proximos.
          </p>
          <button
            onClick={() => refetchPartners()}
            style={{
              backgroundColor: '#f59e0b',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const partners = partnersData?.data || [];

  // Estado: Nenhum parceiro encontrado
  if (partners.length === 0) {
    return (
      <div className={`nearby-partners ${className}`} style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Nenhum parceiro encontrado em um raio de {radius} km.
        </p>
        <button
          onClick={refreshGeo}
          style={{
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            marginTop: '12px',
          }}
        >
          Atualizar localizacao
        </button>
      </div>
    );
  }

  // Estado: Lista de parceiros proximos
  return (
    <div className={`nearby-partners ${className}`}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '0 4px',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
          Parceiros proximos ({partners.length})
        </h3>
        <button
          onClick={refreshGeo}
          style={{
            backgroundColor: 'transparent',
            color: '#3b82f6',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Atualizar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {partners.map((partner: any) => {
          const distanceKm = partner.distance || 0;
          const timeMinutes = estimateTime(distanceKm);
          const routeUrl = position && partner.latitude && partner.longitude
            ? getGoogleMapsDirectionsUrl(
                { lat: position.lat, lng: position.lng },
                { lat: partner.latitude, lng: partner.longitude },
              )
            : null;

          return (
            <div
              key={partner.id}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#1f2937' }}>
                  {partner.tradeName || partner.companyName}
                </h4>
                <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#6b7280' }}>
                  {partner.category} - {partner.city}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 500 }}>
                    {formatDistance(distanceKm)}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    ~{formatTime(timeMinutes)}
                  </span>
                </div>
              </div>

              {routeUrl && (
                <a
                  href={routeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#10b981',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ver rota
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NearbyPartners;
