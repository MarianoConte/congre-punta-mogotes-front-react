import { useQuery } from 'react-query';
import { traerTodo } from '../../config/clienteAxios';

const getNoVisitar = async (territorioId) => {
  return traerTodo(
    `/no-visitars?filters[territorio][id][$eq]=${territorioId}`
  );
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
