import { useQuery } from 'react-query';
import clienteAxios from '../../config/clienteAxios';

const getDepartamentos = async (id) => {
  const { data } = await clienteAxios.get(
    `/departamentos?filter[edificio][id][$eq]=${id}&pagination[pageSize]=100&sort=UltimaVisita`
  );
  return data;
};

export default function useDepartamentos(id) {
  const departamentosQuery = useQuery(
    ['departamentos', id],
    () => getDepartamentos(id),
    {
      refetchOnWindowFocus: false,
      select: (data) => data.data,
    }
  );

  return departamentosQuery;
}
