import { useQuery } from 'react-query';
import clienteAxios from '../../config/clienteAxios';

const getNoVisitar = async (territorioId) => {
  const { data } = await clienteAxios.get(
    `/no-visitars?filters[territorio][id][$eq]=${territorioId}&pagination[pageSize]=1000`
  );
  return data;
};

export default function useNoVisitar(territorioId) {
  const noVisitarQuery = useQuery(
    ['noVisitar', territorioId],
    () => getNoVisitar(territorioId),
    {
      refetchOnWindowFocus: false,
      select: (data) => data?.data ?? [],
      enabled: !!territorioId,
    }
  );

  return noVisitarQuery;
}
