import { Collapsible, Text } from '@0xsequence/design-system'
import { ethers } from 'ethers'

import { NetworkInfo } from './NetworkInfo'

interface TransactionDetailsProps {
  transactions: ethers.Transaction[]
  chainId?: number
  origin?: string
}

export const TransactionDetails = ({ transactions, chainId, origin }: TransactionDetailsProps) => (
  <div className="flex flex-col gap-2 w-full">
    <Text className="mt-6 text-center" variant="medium" color="text100" fontWeight="bold">
      Transaction Request <br />
      <Text variant="small" color="text80">
        from origin <Text fontWeight="bold">{origin} </Text>
      </Text>
    </Text>
    <div className="flex mt-2 flex-col gap-2 w-full">
      {transactions.map((txn, index) => (
        <div className="flex flex-col gap-3 w-full" key={index}>
          {chainId && <NetworkInfo chainId={chainId} />}
          <Collapsible label="Transaction data">
            <div
              className="overflow-x-scroll bg-background-secondary p-4 rounded-xl"
              style={{
                whiteSpace: 'pre',
                maxHeight: '300px'
              }}
            >
              <Text variant="code" color="text100">
                {JSON.stringify(txn, null, 2)}
              </Text>
            </div>
          </Collapsible>
        </div>
      ))}
    </div>
  </div>
)
