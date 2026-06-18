import { useMutation, useQueryClient } from 'react-query';
import clienteAxios from '../../config/clienteAxios';
import useMessages from './useMessages';

const createSalida = async (payload) => {
  const { data } = await clienteAxios.post('/salidas', { data: payload });
  return data;
};

export default function useCreateSalida() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMessages();

  return useMutation(createSalida, {
    onSuccess: () => {
      queryClient.invalidateQueries(['salidas']);
      showSuccess('Salida registrada correctamente');
    },
    onError: () => {
      showError('No se pudo registrar la salida, intente más tarde');
    },
  });
}
