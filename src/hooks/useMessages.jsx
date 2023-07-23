import { useSnackbar } from 'notistack';

export default function useMessages() {
  const { enqueueSnackbar } = useSnackbar();

  const showSuccess = (successMessage, duration = 3000) => {
    enqueueSnackbar(successMessage, {
      variant: 'success',
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
      },
      autoHideDuration: duration,
    });
  };

  const showError = (errorMessage, duration = 3000) => {
    enqueueSnackbar(errorMessage, {
      variant: 'error',
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
      },
      autoHideDuration: duration,
    });
  };

  return { showSuccess, showError };
}
