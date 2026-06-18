import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const navLinks = [
  { label: 'Informar Salida', path: '/informar-salida' },
  { label: 'Tablero', path: '/tablero' },
  { label: 'Historial', path: '/historial' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNavLink = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  return (
    <AppBar position='static' sx={{ backgroundColor: '#8BB174' }}>
      <Toolbar>
        <Typography
          variant='h6'
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => navigate('/')}
        >
          {`Territorios · ${import.meta.env.VITE_NOMBRE_DE_LA_CONGRE ?? ''}`}
        </Typography>

        {/* Menú escritorio */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          {isAuthenticated &&
            navLinks.map((link) => (
              <Button
                key={link.path}
                color='inherit'
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </Button>
            ))}
          {isAuthenticated ? (
            <>
              <Typography variant='body2' sx={{ mx: 1 }}>
                {user?.nombreCompleto ?? user?.username}
              </Typography>
              <Button
                color='inherit'
                variant='outlined'
                size='small'
                onClick={handleLogout}
                sx={{ borderColor: 'white' }}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Button color='inherit' onClick={() => navigate('/login')}>
              Iniciar sesión
            </Button>
          )}
        </Box>

        {/* Menú mobile */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color='inherit' onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {isAuthenticated &&
              navLinks.map((link) => (
                <MenuItem key={link.path} onClick={() => handleNavLink(link.path)}>
                  {link.label}
                </MenuItem>
              ))}
            {isAuthenticated ? (
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            ) : (
              <MenuItem onClick={() => handleNavLink('/login')}>
                Iniciar sesión
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
