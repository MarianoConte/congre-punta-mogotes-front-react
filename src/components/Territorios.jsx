import { Grid, LinearProgress, Typography } from '@mui/material';
import Territorio from './Territorio';
import useTerritorios from '../hooks/useTerritorios';

export default function Territorios() {
  const { data: territorios, isLoading } = useTerritorios();

  if (isLoading) return <LinearProgress color='inherit' />;

  return (
    <Grid
      sx={{
        backgroundColor: '#F2F2F2',
        width: '100%',
        height: '100vh',
        paddingY: '2rem',
        paddingX: '1rem',
      }}
    >
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: '#8BB174',
          height: '15vh',
          lineHeight: '15vh',
          textAlign: 'center',
        }}
      >
        <Typography
          variant='h1'
          sx={{
            fontSize: '2rem',
            color: 'white',
            verticalAlign: 'middle',
            display: 'inline-block',
          }}
        >
          {`Territorios de la Congregación ${
            import.meta.env.VITE_NOMBRE_DE_LA_CONGRE
          }`}
        </Typography>
      </Grid>

      <Grid item container xs={12} sx={{ paddingY: '2rem' }} spacing={2}>
        {territorios
          ?.sort((a, b) => a.attributes.Numero - b.attributes.Numero)
          .map((territorio) => (
            <Territorio key={territorio.id} {...territorio} />
          ))}
      </Grid>
    </Grid>
  );
}
