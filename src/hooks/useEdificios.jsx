import { useQuery } from 'react-query';
import { traerTodo } from '../../config/clienteAxios';

const getEdificios = async (id) => {
  return traerTodo(
    `/edificios?sort=Direccion&filters[territorio][id][$eq]=${id}`
  );
};

export default function useEdificios(id) {
  const edificiosQuery = useQuery(['edificios', id], () => getEdificios(id), {
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  });

  return edificiosQuery;
}
