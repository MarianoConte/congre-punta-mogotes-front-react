import { useQuery } from 'react-query';
import clienteAxios from '../../config/clienteAxios';

const getDepartamentos = async (id) => {
  const { data } = await clienteAxios.get(
    `/departamentos?filters[edificio][id][$eq]=${id}&pagination[pageSize]=100&sort=UltimaVisita:asc`
  );
  return data;
};

export default function useDepartamentos(id) {
  const departamentosQuery = useQuery(
    ['departamentos', id],
    () => getDepartamentos(id),
    {
      refetchOnWindowFocus: false,
      select: (data) =>
        data.data?.sort((a, b) => {
          // Sort by last visit with null first
          if (a.attributes.UltimaVisita === null) return -1;
          if (b.attributes.UltimaVisita === null) return 1;
          return (
            new Date(a.attributes.UltimaVisita) -
            new Date(b.attributes.UltimaVisita)
          );
        }),
    }
  );

  return departamentosQuery;
}
