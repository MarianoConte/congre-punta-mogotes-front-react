import { useMutation, useQueryClient } from 'react-query';
import clienteAxios from '../../config/clienteAxios';
import useMessages from './useMessages';

const deleteSalida = async (id) => {
  const { data } = await clienteAxios.delete(`/salidas/${id}`);
  return data;
};

export default function useDeleteSalida() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMessages();

  return useMutation(deleteSalida, {
    onSuccess: () => {
      queryClient.invalidateQueries(['salidas']);
      showSuccess('Salida eliminada');
    },
    onError: (error) => {
      const motivo = error?.response?.data?.error?.message;
      showError(
        motivo
          ? `No se pudo eliminar la salida: ${motivo}`
          : 'No se pudo eliminar la salida, intente más tarde'
      );
    },
  });
}
