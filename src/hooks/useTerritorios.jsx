import { useQuery } from 'react-query';
import clienteAxios from '../../config/clienteAxios';

const getTerritorios = async () => {
  const { data } = await clienteAxios('/territorios?populate=*&pagination[pageSize]=100');
  return data;
};

export default function useTerritorios() {
  const territoriosQuery = useQuery(['territorios'], getTerritorios, {
    refetchOnWindowFocus: false,
    select: (data) => data.data,
    // Reintentar un 401 no sirve de nada: sólo agrega segundos de espera antes
    // de fallar igual. La sesión ya se cerró desde el interceptor de AuthContext.
    retry: (count, error) => error?.response?.status !== 401 && count < 2,
  });

  return territoriosQuery;
}
