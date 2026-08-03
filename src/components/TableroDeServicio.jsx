import { Box, Button, Chip, Dialog, DialogContent, IconButton, LinearProgress, Paper, Typography } from '@mui/material';
import { DataGrid, esES } from '@mui/x-data-grid';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import dayjs from 'dayjs';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import useTerritorios from '../hooks/useTerritorios';
import useSalidas from '../hooks/useSalidas';
import { calcularEstadoTerritorio } from '../utils/ciclos';
import DescargarS13Dialog from './DescargarS13Dialog';
import Navbar from './Navbar';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL.replace('/api', '');

function buildColumns(onFotoClick, onDescargar) {
  return [
  {
    field: 'foto',
    headerName: 'Foto',
    width: 80,
    sortable: false,
    renderCell: (params) =>
      params.value ? (
        <img
          src={params.value}
          alt='territorio'
          onClick={() => onFotoClick(params.value)}
          style={{ width: 60, height: 50, objectFit: 'cover', borderRadius: 4, cursor: 'zoom-in' }}
        />
      ) : (
        <Box sx={{ width: 60, height: 50, backgroundColor: '#e0e0e0', borderRadius: 1 }} />
      ),
  },
  {
    field: 'numero',
    headerName: 'Nº',
    flex: 0.4,
    minWidth: 70,
    // El Numero es string en Strapi: sin esto ordena 1, 11, 12, 2...
    sortComparator: (a, b) => Number(a) - Number(b),
  },
  {
    field: 'fechaFinalizacion',
    headerName: 'Fin de ciclo',
    flex: 0.9,
    minWidth: 120,
    valueFormatter: (params) =>
      params.value ? dayjs(params.value).format('DD/MM/YYYY') : '-',
  },
  { field: 'conductor', headerName: 'Conductor', flex: 1.2, minWidth: 140 },
  {
    field: 'diasDesdeUltima',
    headerName: 'Días sin visitar',
    type: 'number',
    flex: 0.8,
    minWidth: 130,
    valueFormatter: (params) => (params.value !== null ? params.value : '-'),
  },
  {
    field: 'estado',
    headerName: 'Estado',
    flex: 0.8,
    minWidth: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size='small'
        sx={{
          backgroundColor:
            params.value === 'Completo'
              ? '#8BB174'
              : params.value === 'Sin configurar'
              ? '#9E9E9E'
              : '#FF9800',
          color: 'white',
          fontWeight: 'bold',
        }}
      />
    ),
  },
  {
    field: 'manzanasPendientes',
    headerName: 'Manzanas pendientes',
    flex: 1.2,
    minWidth: 160,
  },
  {
    field: 'descargar',
    headerName: 'Descargar',
    width: 120,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    headerClassName: 'no-print',
    cellClassName: 'no-print',
    renderCell: (params) => (
      <>
        <IconButton
          size='small'
          title='Descargar S-13 en PDF'
          onClick={() => onDescargar('pdf', params.row)}
        >
          <PictureAsPdfIcon sx={{ color: '#C62828' }} />
        </IconButton>
        <IconButton
          size='small'
          title='Descargar S-13 en Excel'
          onClick={() => onDescargar('xlsx', params.row)}
        >
          <GridOnIcon sx={{ color: '#1D6F42' }} />
        </IconButton>
      </>
    ),
  },
];
}

const localeText = esES.components.MuiDataGrid.defaultProps.localeText;

export default function TableroDeServicio() {
  const printRef = useRef();
  const { data: territorios, isLoading: isLoadingTerritorios } = useTerritorios();
  const { data: salidas, isLoading: isLoadingSalidas } = useSalidas();
  const [modalFoto, setModalFoto] = useState(null);
  const [descarga, setDescarga] = useState(null);

  const handleDescargar = useCallback(
    (formato, row) => setDescarga({ formato, row }),
    []
  );

  const columns = useMemo(
    () => buildColumns(setModalFoto, handleDescargar),
    [handleDescargar]
  );
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const rows = useMemo(() => {
    if (!territorios || !salidas) return [];

    return territorios
      .sort((a, b) => a.attributes.Numero - b.attributes.Numero)
      .map((t) => {
        const manzanas = t.attributes.Manzanas ?? [];
        const salidasTerritorio = salidas.filter(
          (s) => s.attributes.territorio?.data?.id === t.id
        );
        const fotoUrl = t.attributes.Foto?.data?.attributes?.url;

        if (manzanas.length === 0) {
          return {
            id: t.id,
            numero: t.attributes.Numero,
            foto: fotoUrl ? `${BACKEND_BASE}${fotoUrl}` : null,
            fechaFinalizacion: null,
            conductor: '-',
            diasDesdeUltima: null,
            estado: 'Sin configurar',
            manzanasPendientes: '-',
            manzanas,
            salidas: salidasTerritorio,
          };
        }

        const stats = calcularEstadoTerritorio(salidasTerritorio, manzanas);

        return {
          id: t.id,
          numero: t.attributes.Numero,
          foto: fotoUrl ? `${BACKEND_BASE}${fotoUrl}` : null,
          fechaFinalizacion: stats?.fechaFinalizacion ?? null,
          conductor: stats?.conductor ?? '-',
          diasDesdeUltima: stats?.diasDesdeUltima ?? null,
          estado: stats?.estado ?? 'Incompleto',
          manzanasPendientes:
            stats?.manzanasPendientes?.length > 0
              ? stats.manzanasPendientes.join(', ')
              : '-',
          manzanas,
          salidas: salidasTerritorio,
        };
      });
  }, [territorios, salidas]);

  if (isLoadingTerritorios || isLoadingSalidas)
    return <LinearProgress color='inherit' />;

  return (
    <>
      <Navbar />
      <Box
        sx={{
          backgroundColor: '#F2F2F2',
          minHeight: 'calc(100vh - 64px)',
          py: 3,
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{ maxWidth: 1400, mx: 'auto', borderRadius: 2 }}
        >
          <Box sx={{ height: 10, backgroundColor: '#8BB174', borderRadius: '8px 8px 0 0' }} />

          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#426B69' }}>
                Tablero de Servicio
              </Typography>
              <Button
                variant='outlined'
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ borderColor: '#8BB174', color: '#8BB174' }}
              >
                Imprimir / PDF
              </Button>
            </Box>

            <Box ref={printRef}>
              <DataGrid
                rows={rows}
                columns={columns}
                rowHeight={60}
                localeText={localeText}
                autoHeight
                initialState={{
                  sorting: { sortModel: [{ field: 'diasDesdeUltima', sort: 'desc' }] },
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                sx={{
                  backgroundColor: 'white',
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                  },
                  '& .MuiDataGrid-overlayWrapper': {
                    minHeight: 200,
                  },
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Modal foto ampliada */}
      <Dialog
        open={!!modalFoto}
        onClose={() => setModalFoto(null)}
        maxWidth='md'
      >
        <DialogContent sx={{ p: 0, position: 'relative', lineHeight: 0 }}>
          <IconButton
            onClick={() => setModalFoto(null)}
            sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' } }}
          >
            <CloseIcon />
          </IconButton>
          {modalFoto && (
            <img
              src={modalFoto}
              alt='Mapa del territorio'
              style={{ display: 'block', maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Descarga de la planilla S-13 */}
      <DescargarS13Dialog
        open={!!descarga}
        formato={descarga?.formato}
        territorio={
          descarga
            ? {
                numero: descarga.row.numero,
                manzanas: descarga.row.manzanas,
                salidas: descarga.row.salidas,
              }
            : null
        }
        onClose={() => setDescarga(null)}
      />
    </>
  );
}
