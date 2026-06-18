import { useMutation, useQueryClient } from 'react-query';
import clienteAxios from '../../config/clienteAxios';
import useMessages from './useMessages';

const createNoVisitar = async ({ direccion, territorioId }) => {
  const { data } = await clienteAxios.post('/no-visitars', {
    data: {
      direccion,
      territorio: territorioId,
      publishedAt: new Date().toISOString(),
    },
  });
  return data;
};

export default function useCreateNoVisitar() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMessages();

  return useMutation(createNoVisitar, {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['noVisitar', String(variables.territorioId)]);
      showSuccess('Dirección agregada a "No visitar"');
    },
    onError: () => {
      showError('No se pudo agregar la dirección');
    },
  });
}
