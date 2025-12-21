import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiClient';

export function useStockQuote(symbol) {
  return useQuery({
    queryKey: ['quote', symbol],
    enabled: !!symbol,                   // only runs when we have a symbol
    queryFn: async () => {
      // Example backend route: GET /api/quotes/:symbol
      url = `/stocks/price/${symbol}`;
      const { data } = await api.get(url);
      return data;
    },
    refetchInterval: 10_000,             // refresh every 10s (tweak as needed)
    staleTime: 5_000,
  });
}
