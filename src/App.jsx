import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Territorios from './components/Territorios';
import Edificios from './components/Edificios';
import MarcarEdificio from './components/MarcarEdificio';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import InformarSalida from './components/InformarSalida';
import TableroDeServicio from './components/TableroDeServicio';
import HistorialDeSalidas from './components/HistorialDeSalidas';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/'>
      <Route path='/' element={<Territorios />} />
      <Route path='/territorio/:id' element={<Edificios />} />
      <Route path='/edificio/:id' element={<MarcarEdificio />} />
      <Route path='/login' element={<Login />} />
      <Route
        path='/informar-salida'
        element={
          <ProtectedRoute>
            <InformarSalida />
          </ProtectedRoute>
        }
      />
      <Route
        path='/tablero'
        element={
          <ProtectedRoute>
            <TableroDeServicio />
          </ProtectedRoute>
        }
      />
      <Route
        path='/historial'
        element={
          <ProtectedRoute>
            <HistorialDeSalidas />
          </ProtectedRoute>
        }
      />
    </Route>
  )
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
