import { useQuery } from 'react-query';
import clienteAxios from '../../config/clienteAxios';

const getTerritorio = async (id) => {
  const { data } = await clienteAxios.get(`/territorios/${id}`);
  return data;
};

export default function useTerritorio(id) {
  const territorioQuery = useQuery(
    ['territorio', id],
    () => getTerritorio(id),
    {
      refetchOnWindowFocus: false,
      select: (data) => data.data,
    }
  );

  return territorioQuery;
}
