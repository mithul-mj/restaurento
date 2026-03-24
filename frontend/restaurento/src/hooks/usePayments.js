import { useQuery, keepPreviousData } from '@tanstack/react-query'
import adminService from '../services/admin.service'

export const usePayments = ({ page, limit, search, date }) => {
  const queryKey = ['admin_payments', page, limit, search, date];
  const query = useQuery({
    queryKey,
    queryFn: () => adminService.fetchPayments({ page, limit, search, date }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 5,
  })

  return {
    ...query,
    stats: query.data?.stats || {},
    transactions: query.data?.data || [],
    meta: query.data?.meta || {},
  }

}
export const useTransactionDetails = (transactionId) => {
  return useQuery({
    queryKey: ["transaction_details", transactionId],
    queryFn: () => adminService.fetchTransactionDetails(transactionId),
    enabled: !!transactionId, // Only fetch when an ID is provided
  });
};