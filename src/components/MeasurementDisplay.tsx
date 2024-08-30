import React from 'react';
import { MeasurementMode, MeasurementState } from '../types';
import { Box, Typography } from '@mui/material';

interface MeasurementDisplayProps {
  mode: MeasurementMode;
  measurements: MeasurementState;
  distanceUnit: string;
  angleUnit: string;
}

const convertDistance = (distance: number | null, unit: string) => {
  if (distance === null) return 'N/A';
  switch (unit) {
    case 'kilometers':
      return `${(distance / 1000).toFixed(2)} km`;
    case 'miles':
      return `${(distance / 1609.344).toFixed(2)} mi`;
    default:
      return `${distance.toFixed(0)} m`;
  }
};

const convertAngle = (angle: number | null, unit: string) => {
  if (angle === null) return 'N/A';
  switch (unit) {
    case 'radians':
      return `${(angle * (Math.PI / 180)).toFixed(4)} rad`;
    default:
      return `${angle.toFixed(2)}°`;
  }
};

const MeasurementDisplay: React.FC<MeasurementDisplayProps> = ({
  mode,
  measurements,
  distanceUnit,
  angleUnit,
}) => {
  const { distance, azimuth, angle } = measurements;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle1">Measurement Results</Typography>
      {mode === 'distance' ? (
        <>
          <Typography>
            Distance: {convertDistance(distance, distanceUnit)}
          </Typography>
          <Typography>
            Azimuth: {azimuth !== null ? `${azimuth.toFixed(2)}°` : 'N/A'}
          </Typography>
        </>
      ) : (
        <Typography>
          Angle: {convertAngle(angle, angleUnit)}
        </Typography>
      )}
    </Box>
  );
};

export default MeasurementDisplay;