import { useQuery } from 'react-query';
import clienteAxios from '../../config/clienteAxios';

const getSalidas = async ({ startDate, endDate } = {}) => {
  let url =
    '/salidas?populate[territorio][populate]=Foto&sort=Fecha:desc&pagination[pageSize]=1000';
  if (startDate) url += `&filters[Fecha][$gte]=${startDate}`;
  if (endDate) url += `&filters[Fecha][$lte]=${endDate}`;
  const { data } = await clienteAxios.get(url);
  return data;
};

export default function useSalidas(filters = {}) {
  return useQuery(['salidas', filters], () => getSalidas(filters), {
    refetchOnWindowFocus: false,
    select: (data) => data.data,
  });
}
