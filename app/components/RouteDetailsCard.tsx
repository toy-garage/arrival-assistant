'use client';

import type { RouteDetails } from '../types';

interface RouteDetailsCardProps {
  routeDetails: RouteDetails;
}

export default function RouteDetailsCard({ routeDetails }: RouteDetailsCardProps) {
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'driving':
        return '🚗';
      case 'transit':
        return '🚇';
      case 'walking':
        return '🚶';
      default:
        return '📍';
    }
  };

  const getStepIcon = (type?: string) => {
    switch (type) {
      case 'subway':
        return '🚇';
      case 'bus':
        return '🚌';
      case 'walk':
        return '🚶';
      case 'car':
        return '🚗';
      default:
        return '➡️';
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}시간 ${mins}분`;
    }
    return `${minutes}분`;
  };

  return (
    <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getTransportIcon(routeDetails.transportMode)}</span>
          <div>
            <h4 className="font-semibold text-gray-900">{routeDetails.summary}</h4>
            <p className="text-sm text-gray-600">
              {formatDistance(routeDetails.distance)} · {formatDuration(routeDetails.duration)}
              {routeDetails.fare && routeDetails.fare > 0 && (
                <span className="ml-2 text-indigo-600 font-semibold">
                  {routeDetails.fare.toLocaleString()}원
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {routeDetails.steps && routeDetails.steps.length > 0 && (
        <div className="space-y-2 mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">상세 경로</p>
          {routeDetails.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 text-sm"
            >
              <span className="text-lg flex-shrink-0">{getStepIcon(step.transportType)}</span>
              <div className="flex-1">
                <p className="text-gray-800">
                  {step.lineName && step.transportType !== 'walk' && (
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-semibold mr-2"
                      style={{
                        backgroundColor: step.lineColor || (step.lineInfo?.color || '#6B7280'),
                        color: 'white',
                      }}
                    >
                      {step.lineName || step.lineInfo?.name}
                    </span>
                  )}
                  {step.instruction || (step.startStation && step.endStation
                    ? `${step.startStation} → ${step.endStation}${step.stationCount ? ` (${step.stationCount}정거장)` : ''}`
                    : '이동')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDistance(step.distance)} · {formatDuration(step.sectionTime || step.duration)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
