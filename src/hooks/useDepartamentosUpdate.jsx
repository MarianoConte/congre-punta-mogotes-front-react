import { useMutation, useQueryClient } from 'react-query';
import clienteAxios from '../../config/clienteAxios';
import useMessages from './useMessages';

const updateDepartamentos = async (departamentos) => {
  const { data } = await clienteAxios.put(`/departamento/updateDepartamentos`, {
    departamentos,
  });
  return data;
};

export default function useDepartamentosUpdate(id) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMessages();

  const departamentosUpdateQuery = useMutation(
    (departamentos) => updateDepartamentos(departamentos),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['departamentos', id]);
        showSuccess('Se han actualizado los departamentos correctamente');
      },
      onError: (error) => {
        showError('No se pudo actualizar los departamentos, intente más tarde');
      },
    }
  );

  return departamentosUpdateQuery;
}
