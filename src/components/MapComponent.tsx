import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { LineString } from 'ol/geom';
import { fromLonLat, transform } from 'ol/proj';
import { Draw, Modify } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { calculateAzimuth, calculateDistance, calculateAngle } from '../utils/measurements';
import { MeasurementMode, MeasurementState } from '../types';
import MeasurementControls from './MeasurementControls';
import MeasurementDisplay from './MeasurementDisplay';
import CoordinateForm from './CoordinateForm';

const MapComponent: React.FC = () => {  
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const sourceRef = useRef<VectorSource | null>(null);
  const drawRef = useRef<Draw | null>(null);

  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>('distance');
  const [distanceUnit, setDistanceUnit] = useState<string>('kilometers');
  const [angleUnit, setAngleUnit] = useState<string>('degrees');
  const [measurements, setMeasurements] = useState<MeasurementState>({
    distance: null,
    azimuth: null,
    angle: null,
  });
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);

  const updateMeasurements = useCallback((coords: Coordinate[]) => {
    if (measurementMode === 'distance' && coords.length === 2) {
      const distance = calculateDistance(coords);
      const azimuth = calculateAzimuth(coords);
      setMeasurements({
        distance,
        azimuth,
        angle: null,
      });
    } else if (measurementMode === 'angle' && coords.length === 3) {
      const angle = calculateAngle(coords);
      setMeasurements({
        distance: null,
        azimuth: null,
        angle,
      });
    }
  }, [measurementMode]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current && mapElement.current) {
      const vectorSource = new VectorSource();
      sourceRef.current = vectorSource;

      mapRef.current = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({ source: new OSM() }),
          new VectorLayer({ source: vectorSource }),
        ],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2,
        }),
      });
    }
  }, []);

  const setupInteractions = useCallback(() => {
    if (!mapRef.current || !sourceRef.current) return;

    const maxPoints = measurementMode === 'distance' ? 2 : 3;

    const draw = new Draw({
      source: sourceRef.current,
      type: 'LineString',
      maxPoints,
    });

    draw.on('drawstart', () => {
      sourceRef.current?.clear();
      setMeasurements({ distance: null, azimuth: null, angle: null });
      setCoordinates([]);
    });

    draw.on('drawend', (event) => {
      const geom = event.feature.getGeometry() as LineString;
      const coords = geom.getCoordinates().map(coord => transform(coord, 'EPSG:3857', 'EPSG:4326'));
      setCoordinates(coords);
      updateMeasurements(coords);
      mapRef.current?.removeInteraction(draw);
    });

    const modify = new Modify({ source: sourceRef.current });

    modify.on('modifyend', () => {
      const features = sourceRef.current?.getFeatures();
      if (features && features.length > 0) {
        const geom = features[0].getGeometry() as LineString;
        const coords = geom.getCoordinates().map(coord => transform(coord, 'EPSG:3857', 'EPSG:4326'));
        setCoordinates(coords);
        updateMeasurements(coords);
      }
    });

    mapRef.current.addInteraction(draw);
    mapRef.current.addInteraction(modify);

    drawRef.current = draw;

    return () => {
      mapRef.current?.removeInteraction(draw);
      mapRef.current?.removeInteraction(modify);
    };
  }, [measurementMode, updateMeasurements]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    return setupInteractions();
  }, [setupInteractions]);


  useEffect(() => {
    if (!mapRef.current || !sourceRef.current) return;

    const handleMapClick = (event: any) => {
      const clickedCoord = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');

      setCoordinates((prevCoords) => {

        const newCoords = [...prevCoords, clickedCoord];
        updateMeasurements(newCoords);
        return newCoords;
      });
    };

    mapRef.current.on('click', handleMapClick);

    return () => {
      mapRef.current?.un('click', handleMapClick);
    };
  }, [measurementMode, updateMeasurements]);

  const handleClearMeasurement = useCallback(() => {
    sourceRef.current?.clear();
    setMeasurements({ distance: null, azimuth: null, angle: null });
    setCoordinates([]);

    if (mapRef.current && drawRef.current) {
      mapRef.current.addInteraction(drawRef.current);
    }
  }, []);

  const handleMeasurementModeChange = useCallback((newMode: MeasurementMode) => {
    setMeasurementMode(newMode);
    handleClearMeasurement();
  }, [handleClearMeasurement]);

  const handleDistanceUnitChange = useCallback((newUnit: string) => {
    setDistanceUnit(newUnit);
  }, []);

  const handleAngleUnitChange = useCallback((newUnit: string) => {
    setAngleUnit(newUnit);
  }, []);

  const handleCoordinatesChange = useCallback((newCoordinates: Coordinate[]) => {
    setCoordinates(newCoordinates);
    sourceRef.current?.clear();
    const feature = new Feature(new LineString(newCoordinates.map(coord => fromLonLat(coord))));
    sourceRef.current?.addFeature(feature);
    updateMeasurements(newCoordinates);


    if (mapRef.current && newCoordinates.length > 0) {
      const extent = feature.getGeometry()?.getExtent();
      if (extent) {
        mapRef.current.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 18 });
      }
    }
  }, [updateMeasurements]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'row',
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden'
    }}>
      <Box sx={{ flex: 1, height: '100%' }} ref={mapElement}></Box>
      <Paper 
        elevation={3} 
        sx={{ 
          width: 300, 
          height: '100%',
          p: 2, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          Map Measurements
        </Typography>
        <MeasurementControls
          mode={measurementMode}
          onModeChange={handleMeasurementModeChange}
          onClear={handleClearMeasurement}
          onDistanceUnitChange={handleDistanceUnitChange}
          onAngleUnitChange={handleAngleUnitChange}
          distanceUnit={distanceUnit}
          angleUnit={angleUnit}
        />
        <CoordinateForm
          mode={measurementMode}
          coordinates={coordinates}
          onCoordinatesChange={handleCoordinatesChange}
        />
        <MeasurementDisplay
          mode={measurementMode}
          measurements={measurements}
          distanceUnit={distanceUnit}
          angleUnit={angleUnit}
        />
      </Paper>
    </Box>
  );
};

export default MapComponent;