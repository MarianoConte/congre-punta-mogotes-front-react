import { Grid, LinearProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';
import useTerritorio from '../hooks/useTerritorio';
import useEdificios from '../hooks/useEdificios';
import Edificio from './Edificio';

export default function Territorio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: territorio, isLoading: isLoadingTerritorio } =
    useTerritorio(id);
  const { data: edificios, isLoading: isLoadingEdificios } = useEdificios(id);

  if (isLoadingTerritorio || isLoadingEdificios)
    return <LinearProgress color='inherit' />;

  return (
    <Grid
      container
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
          Territorio {territorio?.attributes?.Numero}
        </Typography>
      </Grid>

      <Grid sx={{ marginTop: '2rem' }} item xs={12} md={4}>
        <Typography
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
          onClick={() => {
            navigate('/');
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '1.8rem', verticalAlign: 'middle' }} />{' '}
          Volver a los territorios
        </Typography>
      </Grid>
      {territorio?.attributes?.Notas && (
        <Grid item xs={12} sx={{ marginTop: '2rem' }}>
          <Typography
            variant='h3'
            sx={{
              fontSize: '1.8rem',
            }}
          >
            Notas del territorio:
          </Typography>
          <Typography
            variant='body1'
            sx={{
              fontSize: '1.2rem',
              marginTop: '16px',
            }}
          >
            {territorio?.attributes?.Notas}
          </Typography>
        </Grid>
      )}
      <Grid
        item
        xs={12}
        sx={{
          marginTop: '2rem',
        }}
      >
        <Typography
          variant='h3'
          sx={{
            fontSize: '2rem',
            marginTop: '2rem',
          }}
        >
          Edificios:
        </Typography>
        <Grid item container xs={12} sx={{ paddingY: '2rem' }} spacing={2}>
          {edificios?.map((edificio) => (
            <Edificio key={edificio?.id} {...edificio} />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
