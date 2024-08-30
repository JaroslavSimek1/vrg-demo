export type MeasurementMode = 'distance' | 'angle';

export interface MeasurementState {
  distance: number | null;
  azimuth: number | null;
  angle: number | null;
}