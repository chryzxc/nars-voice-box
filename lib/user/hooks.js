import { fetcher } from '@/lib/fetch';
import useSWR from 'swr';

export function useCurrentUser() {
  const { isValidating, ...otherProps } = useSWR('/api/user', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  return { isLoading: isValidating, ...otherProps };
}

export function useUser(id) {
  const { isValidating, ...otherProps } = useSWR(`/api/users/${id}`, fetcher);
  return { isLoading: isValidating, ...otherProps };
}
