import { Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
export default function Edificio(edificio) {
  const navigate = useNavigate();

  return (
    <Grid
      item
      xs={12}
      md={4}
      sx={{
        textAlign: 'center',
      }}
      onClick={() => {
        navigate(`/edificio/${edificio.id}`);
      }}
    >
      <Typography
        variant='h3'
        sx={{
          fontSize: '1.8rem',
          color: 'white',
          paddingY: '0.9rem',
          paddingX: '0.9rem',
          backgroundColor: '#8BB174',
          '&:hover': {
            cursor: 'pointer',
            backgroundColor: '#729D58',
          },
        }}
      >
        {edificio?.attributes?.Direccion}
      </Typography>
    </Grid>
  );
}
