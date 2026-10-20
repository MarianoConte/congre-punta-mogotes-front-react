import { useQuery } from 'react-query';
import { traerTodo } from '../../config/clienteAxios';

const getSalidas = async ({ startDate, endDate } = {}) => {
  let url = '/salidas?populate[territorio][populate]=Foto&sort=Fecha:desc';
  if (startDate) url += `&filters[Fecha][$gte]=${startDate}`;
  if (endDate) url += `&filters[Fecha][$lte]=${endDate}`;
  return traerTodo(url);
};

export default function useSalidas(filters = {}) {
  return useQuery(['salidas', filters], () => getSalidas(filters), {
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  });
}
