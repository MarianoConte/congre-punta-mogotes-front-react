import React from 'react';
import { GoogleMap, useLoadScript, KmlLayer } from '@react-google-maps/api';
import { Grid } from '@mui/material';

function Mapa({ lat, lng }) {
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
          marginTop: '1rem',
          marginBottom: '2rem',
        }}
        zoom={18}
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
