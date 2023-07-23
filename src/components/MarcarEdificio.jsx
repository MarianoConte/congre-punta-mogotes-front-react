import {
  Button,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';

import { useNavigate, useParams } from 'react-router';
import useEdificio from '../hooks/useEdficio';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useDepartamentos from '../hooks/useDepartamentos';
import { useState } from 'react';
import useDepartamentosUpdate from '../hooks/useDepartamentosUpdate';

export default function MarcarEdificio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: edificio, isLoading } = useEdificio(id);
  const { data: departamentos, isLoading: isLoadingDepartamentos } =
    useDepartamentos(id);
  const updateDepartamentos = useDepartamentosUpdate(id);

  const [openDialog, setOpenDialog] = useState(false);
  const [departamentosSeleccionados, setDepartamentosSeleccionados] = useState(
    []
  );

  const handleSubmit = () => {
    updateDepartamentos.mutate(departamentosSeleccionados, {
      onSuccess: (data) => {
        setOpenDialog(false);
        setDepartamentosSeleccionados([]);
      },
    });
  };

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
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
        }}
      >
        <DialogTitle>
          {`Se actualizará la fecha de visita de los siguientes departamentos: (${departamentosSeleccionados.sort(
            (a, b) => a - b
          )}) 
          ¿Desea continuar?`}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Aceptar</Button>
        </DialogActions>
      </Dialog>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: '#8BB174',
          height: '15vh',
          lineHeight: '15vh',
          textAlign: 'center',
          paddingX: '1rem',
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
          {edificio?.attributes?.Direccion}
        </Typography>
      </Grid>
      <Grid sx={{ marginTop: '2rem' }} item xs={12} md={3}>
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
      {edificio?.attributes?.Notas && (
        <Grid item xs={12} sx={{ marginTop: '2rem' }}>
          <Typography
            variant='h3'
            sx={{
              fontSize: '1.8rem',
            }}
          >
            Notas del edificio:
          </Typography>
          <Typography
            variant='body1'
            sx={{
              fontSize: '1.2rem',
              marginTop: '16px',
            }}
          >
            {edificio?.attributes?.Notas}
          </Typography>
        </Grid>
      )}
      <Grid item xs={12} sx={{ marginTop: '2rem' }}>
        <Typography variant='h3' sx={{ fontSize: '1.8rem' }}>
          Seleccione los departamentos que ha tocado en este edificio:
        </Typography>
        <DataGrid
          rows={
            departamentos?.map((departamento) => ({
              id: departamento.id,
              Departamento: departamento.attributes.Departamento,
              UltimaVisita: departamento.attributes.UltimaVisita,
            })) || []
          }
          columns={[
            { field: 'Departamento', headerName: 'Dpto.', width: 150, flex: 1 },
            {
              field: 'UltimaVisita',
              headerName: 'Última visita',
              width: 150,
              flex: 1,
              valueFormatter: (params) => {
                console.log(params);
                return params.value
                  ? dayjs(params.value).format('DD/MM/YYYY HH:mm')
                  : 'No hay registro';
              },
            },
          ]}
          checkboxSelection
          rowSelectionModel={departamentosSeleccionados}
          onRowSelectionModelChange={(params) => {
            setDepartamentosSeleccionados(params);
          }}
          sx={{
            marginTop: '2rem',
          }}
        />

        {departamentosSeleccionados.length > 0 && (
          <Button
            variant='contained'
            type='submit'
            onClick={() => setOpenDialog(true)}
            fullWidth
            sx={{
              textAlign: 'center',
              marginTop: '2rem',
              fontSize: '1.8rem',
              color: 'white',
              paddingY: '0.9rem',
              paddingX: '0.9rem',
              backgroundColor: '#426B69',
              '&:hover': {
                cursor: 'pointer',
                backgroundColor: '#2F4C49',
              },
            }}
          >
            Guardar cambios
          </Button>
        )}
      </Grid>
    </Grid>
  );
}
