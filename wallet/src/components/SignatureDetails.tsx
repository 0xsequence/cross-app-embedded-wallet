import { Collapsible, Text } from '@0xsequence/design-system'
import React from 'react'

import { NetworkInfo } from './NetworkInfo'

interface SignatureDetailsProps {
  message: string
  chainId?: number
  origin?: string
}

export const SignatureDetails = ({ message, chainId, origin }: SignatureDetailsProps) => {
  const isJson = React.useMemo(() => {
    try {
      JSON.parse(message)
      return true
    } catch {
      return false
    }
  }, [message])

  return (
    <div className="flex flex-col gap-2 w-full">
      <Text className="mt-6 text-center" variant="medium" color="text100" fontWeight="bold">
        Signature Request <br />
        <Text variant="small" color="text80">
          from origin <Text fontWeight="bold">{origin} </Text>
        </Text>
      </Text>
      <div className="flex mt-2 flex-col gap-2 w-full">
        {chainId && <NetworkInfo chainId={chainId} />}
        <Collapsible label="Message to sign:" open={true}>
          {isJson ? (
            <div
              className="overflow-x-scroll bg-background-secondary p-4 rounded-xl"
              style={{
                whiteSpace: 'pre',
                maxHeight: '250px'
              }}
            >
              <Text variant="code" color="text100">
                {message}
              </Text>
            </div>
          ) : (
            <Text variant="small" color="text80" style={{ wordBreak: 'break-all' }}>
              {message}
            </Text>
          )}
        </Collapsible>
      </div>
    </div>
  )
}
