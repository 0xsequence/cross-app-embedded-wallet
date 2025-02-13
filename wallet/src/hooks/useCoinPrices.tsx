import { SequenceAPIClient, Token } from '@0xsequence/api'
import { useQuery } from '@tanstack/react-query'

import { TIME } from '../utils/time.const'

import { apiClient } from '../sequenceApiClient'

export const useExchangeRate = (toCurrency: string) => {
  return useQuery({
    queryKey: ['exchangeRate', toCurrency],
    queryFn: async () => {
      if (toCurrency === 'USD') {
        return 1
      }

      const res = await apiClient.getExchangeRate({ toCurrency })

      return res.exchangeRate.value
    },
    retry: true,
    staleTime: TIME.MINUTE * 10
  })
}

export const getCoinPrices = async (apiClient: SequenceAPIClient, tokens: Token[]) => {
  if (tokens.length === 0) {
    return []
  }

  const res = await apiClient.getCoinPrices({ tokens })

  return res?.tokenPrices || []
}

export const useCoinPrices = (tokens: Token[], disabled?: boolean) => {
  return useQuery({
    queryKey: ['coinPrices', tokens],
    queryFn: () => getCoinPrices(apiClient, tokens),
    retry: true,
    staleTime: TIME.MINUTE,
    enabled: tokens.length > 0 && !disabled
  })
}
