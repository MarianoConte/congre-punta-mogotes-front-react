import { useQuery } from 'react-query';
import clienteAxios from '../../config/clienteAxios';

const getEdificios = async (id) => {
  const { data } = await clienteAxios.get(
    `/edificios?sort=Direccion&filters[territorio][id][$eq]=${id}&pagination[pageSize]=100`
  );
  return data;
};

export default function useEdificios(id) {
  const edificiosQuery = useQuery(['edificios', id], () => getEdificios(id), {
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  });

  return edificiosQuery;
}
