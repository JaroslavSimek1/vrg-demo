import { Coordinate } from 'ol/coordinate';
import { getDistance} from 'ol/sphere';

export const calculateDistance = (coords: Coordinate[]): number => {
  const [start, end] = coords;
  const distance = getDistance(start, end);
  return distance;
};

export const calculateAzimuth = (coords: Coordinate[]): number => {
  const [start, end] = coords;
  const angleRad = Math.atan2(end[1] - start[1], end[0] - start[0]);
  return (angleRad * 180) / Math.PI; 
};

export const calculateAngle = (coords: Coordinate[]): number => {
  const [p1, p2, p3] = coords;
  const angle1 = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  const angle2 = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]);
  return ((angle2 - angle1) * 180) / Math.PI;
};
