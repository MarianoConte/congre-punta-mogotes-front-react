import { Grid, LinearProgress, Typography } from '@mui/material';
import Territorio from './Territorio';
import useTerritorios from '../hooks/useTerritorios';
import Navbar from './Navbar';

export default function Territorios() {
  const { data: territorios, isLoading } = useTerritorios();

  if (isLoading) return <LinearProgress color='inherit' />;

  return (
    <>
      <Navbar />
      <Grid
        sx={{
          backgroundColor: '#F2F2F2',
          width: '100%',
          minHeight: 'calc(100vh - 64px)',
          paddingY: '2rem',
          paddingX: '1rem',
        }}
      >
        <Grid item container xs={12} spacing={2}>
          {territorios
            ?.sort((a, b) => a.attributes.Numero - b.attributes.Numero)
            .map((territorio) => (
              <Territorio key={territorio.id} {...territorio} />
            ))}
        </Grid>
      </Grid>
    </>
  );
}
