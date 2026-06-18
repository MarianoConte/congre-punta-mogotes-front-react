import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import useMessages from '../hooks/useMessages';

export default function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useMessages();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password);
      const destino = location.state?.from?.pathname ?? '/';
      navigate(destino, { replace: true });
    } catch {
      showError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F2F2F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant='h5'
            sx={{ textAlign: 'center', mb: 3, color: '#8BB174', fontWeight: 'bold' }}
          >
            {`Congregación ${import.meta.env.VITE_NOMBRE_DE_LA_CONGRE}`}
          </Typography>
          <Typography variant='h6' sx={{ textAlign: 'center', mb: 3 }}>
            Iniciar sesión
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label='Email o usuario'
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label='Contraseña'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3 }}
            />
            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: '#8BB174',
                '&:hover': { backgroundColor: '#729D58' },
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
