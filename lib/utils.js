import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatString = (raw) => {
  return raw.replaceAll('_', ' ');
};

export const formatDate = (raw) => dayjs(raw).format('DD/MM/YYYY hh:mm a');
