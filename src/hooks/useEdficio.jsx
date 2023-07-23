import { useQuery } from 'react-query';
import clienteAxios from '../../config/clienteAxios';

const getEdificio = async (id) => {
  const { data } = await clienteAxios.get(`/edificios/${id}`);
  return data;
};

export default function useEdificio(id) {
  const edificioQuery = useQuery(['edificio', id], () => getEdificio(id), {
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  });

  return edificioQuery;
}
