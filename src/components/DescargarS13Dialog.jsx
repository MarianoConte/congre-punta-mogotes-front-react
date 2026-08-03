import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import useMessages from '../hooks/useMessages';
import { getAnioDeServicio, rangoAnioServicio } from '../utils/ciclos';
import { generarDatosS13 } from '../utils/s13';

function aniosDisponibles(salidas) {
  const anios = new Set(
    (salidas ?? []).map((s) => getAnioDeServicio(s.attributes.Fecha))
  );
  // El año en curso siempre está, aunque todavía no tenga salidas.
  anios.add(getAnioDeServicio(dayjs()));
  return [...anios].sort((a, b) => b - a);
}

export default function DescargarS13Dialog({ open, onClose, formato, territorio }) {
  const { showSuccess, showError } = useMessages();
  const [anio, setAnio] = useState(null);
  const [descargando, setDescargando] = useState(false);

  const anios = useMemo(
    () => aniosDisponibles(territorio?.salidas),
    [territorio]
  );

  useEffect(() => {
    if (territorio) setAnio(aniosDisponibles(territorio.salidas)[0]);
  }, [territorio]);

  if (!territorio) return null;

  const esPdf = formato === 'pdf';
  const sinManzanas = !territorio.manzanas || territorio.manzanas.length === 0;
  const { desde, hasta } = rangoAnioServicio(anio ?? anios[0]);

  const handleDescargar = async () => {
    setDescargando(true);
    try {
      const datos = generarDatosS13({
        numero: territorio.numero,
        manzanas: territorio.manzanas,
        salidas: territorio.salidas,
        anioServicio: anio,
      });

      if (esPdf) {
        const { exportarS13Pdf } = await import('../utils/exportS13Pdf');
        await exportarS13Pdf(datos);
      } else {
        const { exportarS13Xlsx } = await import('../utils/exportS13Xlsx');
        await exportarS13Xlsx(datos);
      }

      showSuccess('Planilla generada');
      onClose();
    } catch (error) {
      console.error(error);
      showError('No se pudo generar la planilla');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <Dialog open={open} onClose={descargando ? undefined : onClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#426B69' }}>
        Descargar S-13 — Territorio {territorio.numero}
      </DialogTitle>

      <DialogContent>
        <Typography variant='body2' sx={{ mb: 2 }}>
          Registro de asignación de territorio en formato {esPdf ? 'PDF' : 'Excel'}.
        </Typography>

        <FormControl fullWidth size='small'>
          <InputLabel id='anio-servicio-label'>Año de servicio</InputLabel>
          <Select
            labelId='anio-servicio-label'
            label='Año de servicio'
            value={anio ?? ''}
            onChange={(e) => setAnio(e.target.value)}
          >
            {anios.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant='caption' sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          Del {desde.format('DD/MM/YYYY')} al {hasta.format('DD/MM/YYYY')}
        </Typography>

        {sinManzanas && (
          <Alert severity='warning' sx={{ mt: 2 }}>
            Este territorio no tiene manzanas configuradas, así que la planilla saldrá en
            blanco para completar a mano.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={descargando}
          variant='outlined'
          sx={{ borderColor: '#8BB174', color: '#8BB174' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleDescargar}
          disabled={descargando || !anio}
          variant='contained'
          startIcon={
            descargando ? (
              <CircularProgress size={18} color='inherit' />
            ) : esPdf ? (
              <PictureAsPdfIcon />
            ) : (
              <GridOnIcon />
            )
          }
          sx={{ backgroundColor: '#426B69', '&:hover': { backgroundColor: '#2F4C49' } }}
        >
          {esPdf ? 'Descargar PDF' : 'Descargar XLSX'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
