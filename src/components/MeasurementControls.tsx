import React from 'react';
import { MeasurementMode } from '../types';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Box 
} from '@mui/material';

interface MeasurementControlsProps {
  mode: MeasurementMode;
  onModeChange: (mode: MeasurementMode) => void;
  onClear: () => void;
  onDistanceUnitChange: (unit: string) => void;
  onAngleUnitChange: (unit: string) => void;
  distanceUnit: string;
  angleUnit: string;
}

const MeasurementControls: React.FC<MeasurementControlsProps> = ({
  mode,
  onModeChange,
  onClear,
  onDistanceUnitChange,
  onAngleUnitChange,
  distanceUnit,
  angleUnit,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel>Measurement Mode</InputLabel>
        <Select
          value={mode}
          label="Measurement Mode"
          onChange={(e) => onModeChange(e.target.value as MeasurementMode)}
        >
          <MenuItem value="distance">Distance</MenuItem>
          <MenuItem value="angle">Angle</MenuItem>
        </Select>
      </FormControl>
      
      {mode === 'distance' && (
        <FormControl fullWidth>
          <InputLabel>Distance Unit</InputLabel>
          <Select
            value={distanceUnit}
            label="Distance Unit"
            onChange={(e) => onDistanceUnitChange(e.target.value)}
          >
            <MenuItem value="meters">Meters</MenuItem>
            <MenuItem value="kilometers">Kilometers</MenuItem>
            <MenuItem value="miles">Miles</MenuItem>
          </Select>
        </FormControl>
      )}
      
      {mode === 'angle' && (
        <FormControl fullWidth>
          <InputLabel>Angle Unit</InputLabel>
          <Select
            value={angleUnit}
            label="Angle Unit"
            onChange={(e) => onAngleUnitChange(e.target.value)}
          >
            <MenuItem value="degrees">Degrees</MenuItem>
            <MenuItem value="radians">Radians</MenuItem>
          </Select>
        </FormControl>
      )}
      
      <Button variant="contained" onClick={onClear}>
        Clear Measurement
      </Button>
    </Box>
  );
};

export default MeasurementControls;