import { useQuery } from 'react-query';
import { traerTodo } from '../../config/clienteAxios';

const getDepartamentos = async (id) => {
  return traerTodo(
    `/departamentos?filters[edificio][id][$eq]=${id}&sort=UltimaVisita:asc`
  );
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
