import iziToast from 'izitoast';

export const TOAST_PARAMS = {
  timeout: 5000,
  position: 'topRight',
  progressBar: false,
};

export const FETCH_FAILED_ERROR_TEXT = 'Failed to fetch request';

function getNotifyMsg(msg: {title: string, message: string} | string): {title?: string, message: string} {
  return typeof msg === 'string'
    ? { message: msg }
    : msg;
}

export const notify = {
  success: (...args) => { toast.apply(null, ['success', ...args]); },
  error: (...args) => { toast.apply(null, ['error', ...args]); },
  warning: (...args) => { toast.apply(null, ['warning', ...args]); },
};

function toast(
    method: '"success" | "warning" | "error"',
    msg: {title: string, message: string} | string,
    additionalParams?: any) {
  const msgDetails = getNotifyMsg(msg);

  iziToast[method]({
    ...TOAST_PARAMS,
    ...additionalParams,
    ...msgDetails,
  });
}
