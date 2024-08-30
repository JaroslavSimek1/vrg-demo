import React, { useState, useEffect } from 'react';
import { MeasurementMode } from '../types';
import { Coordinate } from 'ol/coordinate';
import { TextField, Button, Box, Typography } from '@mui/material';

interface CoordinateFormProps {
  mode: MeasurementMode;
  coordinates: Coordinate[];
  onCoordinatesChange: (coords: Coordinate[]) => void;
}

const CoordinateForm: React.FC<CoordinateFormProps> = ({ mode, coordinates, onCoordinatesChange }) => {
  const [formCoordinates, setFormCoordinates] = useState<Coordinate[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const pointCount = mode === 'distance' ? 2 : 3;
    const newCoordinates = [...coordinates];
    while (newCoordinates.length < pointCount) {
      newCoordinates.push([0, 0]);
    }
    setFormCoordinates(newCoordinates.slice(0, pointCount));
    setErrors(new Array(pointCount).fill(''));
  }, [mode, coordinates]);

  const validateCoordinate = (value: number, axis: 'x' | 'y'): boolean => {
    if (axis === 'x') {
      return value >= -180 && value <= 180;
    } else {
      return value >= -90 && value <= 90;
    }
  };

  const handleCoordinateChange = (index: number, axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value);
    const newCoordinates = [...formCoordinates];
    newCoordinates[index] = [...newCoordinates[index]];
    newCoordinates[index][axis === 'x' ? 0 : 1] = isNaN(numValue) ? 0 : numValue;
    setFormCoordinates(newCoordinates);

    const newErrors = [...errors];
    if (!validateCoordinate(numValue, axis)) {
      newErrors[index] = `Invalid ${axis.toUpperCase()} coordinate`;
    } else {
      newErrors[index] = '';
    }
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.every(error => !error)) {
      onCoordinatesChange(formCoordinates);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="subtitle1">Set Coordinates</Typography>
      {formCoordinates.map((coord, index) => (
        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <TextField
            label={`Point ${index + 1} X (Longitude)`}
            type="number"
            value={coord[0]}
            onChange={(e) => handleCoordinateChange(index, 'x', e.target.value)}
            error={!!errors[index]}
          />
          <TextField
            label={`Point ${index + 1} Y (Latitude)`}
            type="number"
            value={coord[1]}
            onChange={(e) => handleCoordinateChange(index, 'y', e.target.value)}
            error={!!errors[index]}
          />
          {errors[index] && (
            <Typography color="error" variant="caption">
              {errors[index]}
            </Typography>
          )}
        </Box>
      ))}
      <Button type="submit" variant="contained" disabled={errors.some(error => !!error)}>
        Set Coordinates
      </Button>
    </Box>
  );
};

export default CoordinateForm;