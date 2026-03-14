import { useQuery, keepPreviousData } from '@tanstack/react-query'

import userService from '../services/user.service.js'

export const useWalletHistory = ({ page, limit }) => {
  const queryKey = ["walletHistory", page, limit];

  const query = useQuery({
    queryKey,
    queryFn: () => userService.getMyWalletHistory(page, limit),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 1
  });
  return {
    ...query,
  }

}