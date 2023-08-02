import React from 'react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import { Box, Grid, Typography } from '@mui/material';

function Mapa({ lat, lng, direccion }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: `${import.meta.env.VITE_MAPS_API_KEY}`,
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
        zoom={17}
      >
        <MarkerF position={{ lat, lng }} title={direccion}>
          <Box sx={{ backgroundColor: 'white', padding: '0.5rem' }}>
            <Typography variant='h3'>{direccion}</Typography>
          </Box>
        </MarkerF>
      </GoogleMap>
    </Grid>
  );
}

export default Mapa;
