import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material';
import { DataGrid, esES } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PrintIcon from '@mui/icons-material/Print';
import ClearIcon from '@mui/icons-material/Clear';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import useSalidas from '../hooks/useSalidas';
import Navbar from './Navbar';

function numeroDeTerritorio(valor) {
  return parseInt(String(valor).replace(/\D/g, ''), 10) || 0;
}

const columns = [
  {
    field: 'territorio',
    headerName: 'Territorio',
    flex: 0.7,
    minWidth: 110,
    // El valor es "Territorio 12": ordenado como texto quedaría 1, 11, 12, 2...
    sortComparator: (a, b) => numeroDeTerritorio(a) - numeroDeTerritorio(b),
  },
  {
    field: 'fecha',
    headerName: 'Fecha',
    flex: 0.9,
    minWidth: 150,
    valueFormatter: (params) =>
      params.value ? dayjs(params.value).format('DD/MM/YYYY HH:mm') : '-',
  },
  { field: 'conductor', headerName: 'Conductor', flex: 1.2, minWidth: 140 },
  { field: 'manzanas', headerName: 'Manzanas', flex: 0.8, minWidth: 120 },
  { field: 'noVisitar', headerName: 'No Visitar nuevos', flex: 1.4, minWidth: 180 },
];

const localeText = esES.components.MuiDataGrid.defaultProps.localeText;

export default function HistorialDeSalidas() {
  const printRef = useRef();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const filtros = {
    startDate: startDate ? startDate.startOf('day').toISOString() : undefined,
    endDate: endDate ? endDate.endOf('day').toISOString() : undefined,
  };

  const { data: salidas, isLoading } = useSalidas(filtros);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const rows = (salidas ?? []).map((s) => ({
    id: s.id,
    territorio: `Territorio ${s.attributes.territorio?.data?.attributes?.Numero ?? '-'}`,
    fecha: s.attributes.Fecha,
    conductor: s.attributes.Conductor,
    manzanas: (s.attributes.Manzanas ?? []).join(', ') || '-',
    noVisitar: (s.attributes.NoVisitarNuevos ?? []).join(' | ') || '-',
  }));

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
            {/* Encabezado */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#426B69' }}>
                Historial de Salidas
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

            {/* Filtros de fecha */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
              <DatePicker
                label='Desde'
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label='Hasta'
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { size: 'small' } }}
              />
              {(startDate || endDate) && (
                <Button
                  variant='text'
                  startIcon={<ClearIcon />}
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  sx={{ color: '#8BB174' }}
                >
                  Limpiar filtros
                </Button>
              )}
              {isLoading && <LinearProgress sx={{ width: 100, alignSelf: 'center' }} />}
            </Box>

            <Box ref={printRef}>
              <DataGrid
                rows={rows}
                columns={columns}
                localeText={localeText}
                autoHeight
                initialState={{
                  sorting: { sortModel: [{ field: 'fecha', sort: 'desc' }] },
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                loading={isLoading}
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
    </>
  );
}
