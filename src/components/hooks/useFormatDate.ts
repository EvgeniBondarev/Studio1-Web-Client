import { useCallback } from 'react';
import dayjs from 'dayjs';

export const useFormatDate = () => {
  const formatDate = useCallback((date?: string) => {
    if (!date) return null;
    const parsed = dayjs(date);
    return parsed.isValid() ? parsed.format('DD.MM.YYYY HH:mm') : null;
  }, []);

  return { formatDate };
};
