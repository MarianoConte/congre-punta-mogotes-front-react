import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import useTerritorios from '../hooks/useTerritorios';
import useTerritorio from '../hooks/useTerritorio';
import useCreateSalida from '../hooks/useCreateSalida';
import useCreateNoVisitar from '../hooks/useCreateNoVisitar';
import useMessages from '../hooks/useMessages';
import Navbar from './Navbar';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL.replace('/api', '');

export default function InformarSalida() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showError } = useMessages();

  const { data: territorios, isLoading: isLoadingTerritorios } = useTerritorios();
  const createSalida = useCreateSalida();
  const createNoVisitar = useCreateNoVisitar();

  const [territorioId, setTerritorioId] = useState('');
  const [fecha, setFecha] = useState(dayjs());
  const [conductor, setConductor] = useState(user?.nombreCompleto ?? user?.username ?? '');
  const [manzanasSeleccionadas, setManzanasSeleccionadas] = useState([]);
  const [noVisitarInput, setNoVisitarInput] = useState('');
  const [noVisitarAgregados, setNoVisitarAgregados] = useState([]);

  const { data: territorioDetalle, isLoading: isLoadingDetalle } =
    useTerritorio(territorioId || null);

  const manzanas = territorioDetalle?.attributes?.Manzanas ?? [];
  const fotoUrl = territorioDetalle?.attributes?.Foto?.data?.attributes?.url;

  const handleTerritorioChange = (e) => {
    setTerritorioId(e.target.value);
    setManzanasSeleccionadas([]);
  };

  const handleManzanaToggle = (manzana) => {
    setManzanasSeleccionadas((prev) =>
      prev.includes(manzana) ? prev.filter((m) => m !== manzana) : [...prev, manzana]
    );
  };

  const handleAgregarNoVisitar = () => {
    const val = noVisitarInput.trim();
    if (!val) return;
    if (!territorioId) {
      showError('Seleccione un territorio primero');
      return;
    }
    setNoVisitarAgregados((prev) => [...prev, val]);
    setNoVisitarInput('');
  };

  const handleQuitarNoVisitar = (index) => {
    setNoVisitarAgregados((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!territorioId) return showError('Seleccione un territorio');
    if (!conductor.trim()) return showError('Ingrese el nombre del conductor');
    if (manzanasSeleccionadas.length === 0)
      return showError('Seleccione al menos una manzana');

    createSalida.mutate(
      {
        Fecha: fecha.toISOString(),
        Conductor: conductor.trim(),
        Manzanas: manzanasSeleccionadas,
        NoVisitarNuevos: noVisitarAgregados,
        territorio: Number(territorioId),
      },
      {
        onSuccess: () => {
          noVisitarAgregados.forEach((direccion) => {
            createNoVisitar.mutate({ direccion, territorioId: Number(territorioId) });
          });
          navigate('/');
        },
      }
    );
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          backgroundColor: '#F2F2F2',
          minHeight: 'calc(100vh - 64px)',
          py: 4,
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 680,
            mx: 'auto',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Franja de color superior (Google Forms style) */}
          <Box sx={{ height: 10, backgroundColor: '#8BB174' }} />

          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              variant='h5'
              sx={{ fontWeight: 'bold', color: '#426B69', mb: 3 }}
            >
              Informar Salida
            </Typography>

            {/* Territorio */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id='territorio-label'>Territorio</InputLabel>
              <Select
                labelId='territorio-label'
                label='Territorio'
                value={territorioId}
                onChange={handleTerritorioChange}
                disabled={isLoadingTerritorios}
              >
                {territorios
                  ?.sort((a, b) => a.attributes.Numero - b.attributes.Numero)
                  .map((t) => (
                    <MenuItem key={t.id} value={String(t.id)}>
                      Territorio {t.attributes.Numero}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Fecha y hora */}
            <DateTimePicker
              label='Fecha y hora'
              value={fecha}
              onChange={(val) => setFecha(val)}
              views={['year', 'month', 'day', 'hours', 'minutes']}
              ampm={false}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 3 } } }}
            />

            {/* Conductor */}
            <TextField
              label='Conductor'
              value={conductor}
              onChange={(e) => setConductor(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 1 }} />

            {/* Imagen + Manzanas */}
            {!territorioId && (
              <Typography
                variant='body2'
                sx={{ color: 'text.secondary', fontStyle: 'italic', my: 2, textAlign: 'center' }}
              >
                Seleccione un territorio
              </Typography>
            )}

            {territorioId && isLoadingDetalle && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress color='inherit' />
              </Box>
            )}

            {fotoUrl && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <img
                  src={`${BACKEND_BASE}${fotoUrl}`}
                  alt={`Mapa territorio ${territorioDetalle?.attributes?.Numero}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 320,
                    borderRadius: 8,
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </Box>
            )}

            {manzanas.length > 0 && (
              <Box sx={{ mt: 3, mb: 1 }}>
                <FormLabel
                  component='legend'
                  sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'text.secondary', mb: 1 }}
                >
                  Manzanas trabajadas *
                </FormLabel>
                <FormGroup row>
                  {manzanas.map((manzana) => (
                    <FormControlLabel
                      key={manzana}
                      control={
                        <Checkbox
                          checked={manzanasSeleccionadas.includes(manzana)}
                          onChange={() => handleManzanaToggle(manzana)}
                          sx={{ color: '#8BB174', '&.Mui-checked': { color: '#8BB174' } }}
                        />
                      }
                      label={manzana}
                      sx={{ mr: 3 }}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* No Visitar nuevos */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant='subtitle2'
                sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1 }}
              >
                Agregar "No visitar"
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label='Dirección'
                  value={noVisitarInput}
                  onChange={(e) => setNoVisitarInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAgregarNoVisitar()}
                  fullWidth
                  size='small'
                />
                <IconButton
                  onClick={handleAgregarNoVisitar}
                  sx={{ color: '#8BB174' }}
                >
                  <AddCircleIcon fontSize='large' />
                </IconButton>
              </Box>
              {noVisitarAgregados.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {noVisitarAgregados.map((dir, i) => (
                    <ListItem
                      key={i}
                      secondaryAction={
                        <IconButton
                          edge='end'
                          size='small'
                          onClick={() => handleQuitarNoVisitar(i)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`🚫 ${dir}`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* Botón Enviar */}
            <Button
              variant='contained'
              fullWidth
              onClick={handleSubmit}
              disabled={createSalida.isLoading}
              startIcon={
                createSalida.isLoading ? (
                  <CircularProgress size={20} color='inherit' />
                ) : (
                  <SendIcon />
                )
              }
              sx={{
                backgroundColor: '#426B69',
                '&:hover': { backgroundColor: '#2F4C49' },
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              Enviar
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
