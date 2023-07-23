import { Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

function Territorio(territorio) {
  const navigate = useNavigate();

  return (
    <Grid
      item
      key={territorio.id}
      xs={3}
      md={1}
      sx={{
        textAlign: 'center',
      }}
      onClick={() => {
        navigate(`/territorio/${territorio.id}`);
      }}
    >
      <Typography
        variant='h3'
        sx={{
          fontSize: '1.8rem',
          color: 'white',
          paddingY: '0.9rem',
          backgroundColor: '#8BB174',
          '&:hover': {
            cursor: 'pointer',
            backgroundColor: '#729D58',
          },
        }}
      >
        {territorio.attributes.Numero}
      </Typography>
    </Grid>
  );
}

export default Territorio;
