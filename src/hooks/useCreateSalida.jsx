import { useMutation, useQueryClient } from 'react-query';
import clienteAxios from '../../config/clienteAxios';
import useMessages from './useMessages';

// El backend crea la salida y sus direcciones "no visitar" en una sola
// transacción, así que este es el único pedido que hace el formulario.
const createSalida = async (payload) => {
  const { data } = await clienteAxios.post('/salidas', { data: payload });
  return data;
};

export default function useCreateSalida() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMessages();

  return useMutation(createSalida, {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['salidas']);
      queryClient.invalidateQueries(['noVisitar', String(variables.territorio)]);
      showSuccess('Salida registrada correctamente');
    },
    onError: (error) => {
      // Mostrar el motivo real cuando el backend lo informa: un mensaje
      // genérico deja al usuario sin saber qué corregir.
      const motivo = error?.response?.data?.error?.message;
      showError(
        motivo
          ? `No se pudo registrar la salida: ${motivo}`
          : 'No se pudo registrar la salida, intente más tarde'
      );
    },
  });
}
