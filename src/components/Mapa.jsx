import React from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  KmlLayer,
} from '@react-google-maps/api';
import { Box, Grid, Typography } from '@mui/material';

function Mapa({ lat, lng, direccion }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: `${import.meta.env.VITE_MAPS_API_KEY}`,
    libraries: ['places'],
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Grid item container xs={12}>
      <GoogleMap
        center={{ lat, lng }}
        mapContainerStyle={{
          width: '100%',
          height: '300px',
          marginTop: '2rem',
          marginBottom: '2rem',
        }}
        zoom={20}
      >
        <KmlLayer
          url={
            'https://www.google.com/maps/d/u/2/kml?mid=1gPRIzjrb9FEW0tFRXL_pmgfBAcOC6-E' +
            '&ver=' +
            generateRandom()
          }
          options={{ preserveViewport: true }}
        />
      </GoogleMap>
    </Grid>
  );
}

function generateRandom() {
  return Math.random() * 10000000000000000;
}

export default Mapa;
