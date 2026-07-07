import toast from 'react-hot-toast';

export const useToast = () => {
  const showToast = (message, type = 'success') => {
    const isSuccess = type === 'success' || type === 'ok';
    const isError = type === 'error';
    const isWarning = type === 'warn' || type === 'warning';

    if (isSuccess) {
      toast.success(message, {
        duration: 4000,
        style: {
          background: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          fontSize: '14px',
        },
      });
    } else if (isError) {
      toast.error(message, {
        duration: 5000,
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontSize: '14px',
        },
      });
    } else if (isWarning) {
      toast(message, {
        icon: '⚠️',
        duration: 5000,
        style: {
          background: '#fffbeb',
          color: '#92400e',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          fontSize: '14px',
        },
      });
    } else {
      toast(message, {
        duration: 4000,
        style: {
          borderRadius: '8px',
          fontSize: '14px',
        },
      });
    }
  };

  return { showToast };
};
