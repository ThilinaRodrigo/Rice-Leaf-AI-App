import Swal from 'sweetalert2';

export const customSwal = Swal.mixin({
  customClass: {
    popup: 'bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl p-6',
    title: 'text-white font-extrabold text-xl mb-2',
    htmlContainer: 'text-slate-300 text-sm mb-4',
    confirmButton: 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition-all mx-1 cursor-pointer',
    cancelButton: 'bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-xs transition-all mx-1 cursor-pointer',
    denyButton: 'bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all mx-1 cursor-pointer',
  },
  buttonsStyling: false,
  background: '#0f172a',
  color: '#f8fafc',
});

export const showConfirmDialog = async (options: {
  title: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: 'warning' | 'info' | 'question' | 'success' | 'error';
}): Promise<boolean> => {
  const result = await customSwal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Confirm',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const showSuccessToast = (message: string) => {
  customSwal.fire({
    icon: 'success',
    title: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showErrorAlert = (title: string, message: string) => {
  customSwal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonText: 'OK',
  });
};
