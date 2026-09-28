import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import clienteAxios from '../../config/clienteAxios';
import { isTokenExpirado } from '../utils/jwt';

const AuthContext = createContext();

// Limpia la sesión guardada. Se usa tanto al iniciar como al cerrar sesión.
const limpiarStorage = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
};

// Lee la sesión guardada una sola vez al montar. Si el token venció lo descarta
// (así un token muerto nunca llega a mandarse: Strapi responde 401 a cualquier
// request con Bearer inválido, incluso en endpoints públicos) y deja marcado que
// la sesión expiró, para poder avisarle al usuario en el login.
const leerSesionGuardada = () => {
  const jwt = localStorage.getItem('jwt');
  const rawUser = localStorage.getItem('user');

  if (jwt && isTokenExpirado(jwt)) {
    limpiarStorage();
    return { token: null, user: null, expirada: true };
  }

  if (!jwt) {
    if (rawUser) limpiarStorage();
    return { token: null, user: null, expirada: false };
  }

  try {
    return { token: jwt, user: rawUser ? JSON.parse(rawUser) : null, expirada: false };
  } catch {
    return { token: jwt, user: null, expirada: false };
  }
};

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const [sesionInicial] = useState(leerSesionGuardada);
  const [token, setToken] = useState(sesionInicial.token);
  const [user, setUser] = useState(sesionInicial.user);
  const [sesionExpirada, setSesionExpirada] = useState(sesionInicial.expirada);

  const login = async (identifier, password) => {
    const { data } = await clienteAxios.post('/auth/local', {
      identifier,
      password,
    });
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.jwt);
    setUser(data.user);
    setSesionExpirada(false);
    return data;
  };

  const logout = useCallback(
    (porExpiracion = false) => {
      limpiarStorage();
      setToken(null);
      setUser(null);
      setSesionExpirada(porExpiracion);
      // Vacía la caché de React Query: evita que queden datos de la sesión
      // anterior visibles para el próximo usuario.
      queryClient.clear();
    },
    [queryClient]
  );

  // Ante un 401 del backend (token vencido o revocado) cerramos la sesión.
  // ProtectedRoute se encarga de redirigir al login.
  useEffect(() => {
    const id = clienteAxios.interceptors.response.use(
      (res) => res,
      (error) => {
        const esLogin = error.config?.url?.includes('/auth/local');
        // El guard sobre el jwt cumple dos funciones: no avisar de "sesión
        // expirada" a quien nunca inició sesión, y que varios requests fallando
        // en paralelo no disparen el logout más de una vez.
        const habiaSesion = !!localStorage.getItem('jwt');
        if (error.response?.status === 401 && !esLogin && habiaSesion) {
          logout(true);
        }
        return Promise.reject(error);
      }
    );

    return () => clienteAxios.interceptors.response.eject(id);
  }, [logout]);

  // Caso típico: la pestaña quedó abierta semanas y el token venció mientras
  // tanto. Al volver a ella revalidamos antes de que dispare ningún request.
  useEffect(() => {
    const revalidar = () => {
      if (document.visibilityState !== 'visible') return;
      if (localStorage.getItem('jwt') && isTokenExpirado(localStorage.getItem('jwt'))) {
        logout(true);
      }
    };

    document.addEventListener('visibilitychange', revalidar);
    return () => document.removeEventListener('visibilitychange', revalidar);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        sesionExpirada,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  return ctx;
}
