import { useQuery } from 'react-query';
import clienteAxios from '../../config/clienteAxios';

const getTerritorios = async () => {
  const { data } = await clienteAxios('/territorios?pagination[pageSize]=100');
  return data;
};

export default function useTerritorios() {
  const territoriosQuery = useQuery(['territorios'], getTerritorios, {
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  });

  return territoriosQuery;
}
