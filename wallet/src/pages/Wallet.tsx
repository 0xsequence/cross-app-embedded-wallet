import { Button, Collapsible, Spinner, Text } from '@0xsequence/design-system'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { useSnapshot } from 'valtio'

import { useConnectionHandler } from '../hooks/useConnectionHandler'
import { useSignMessageHandler } from '../hooks/useSignMessageHandler'
import { useTransactionHandler } from '../hooks/useTransactionHandler'

import { FeeOptionSelector } from '../components/FeeOptionSelector'
import { SignatureDetails } from '../components/SignatureDetails'
import { TransactionDetails } from '../components/TransactionDetails'
import { WalletConnect } from '../components/WalletConnect'

import { walletConnectStore } from '../store/WalletConnectStore'

export const Wallet: React.FC = () => {
  const {
    connectionRequest,
    handleApproveConnection,
    handleRejectConnection,
    isConnectionHandlerRegistered
  } = useConnectionHandler()

  const {
    transactionRequest,
    requestOrigin: txnOrigin,
    requestChainId: txnChainId,
    isSendingTxn,
    txnFeeOptions,
    feeOptionBalances,
    selectedFeeOptionAddress,
    setSelectedFeeOptionAddress,
    hasCheckedFeeOptions,
    handleApproveTxn,
    handleRejectTxn,
    isTransactionHandlerRegistered
  } = useTransactionHandler()

  const {
    signRequest,
    requestOrigin: signOrigin,
    requestChainId: signChainId,
    isSigningMessage,
    handleApproveSign,
    handleRejectSign,
    isSignHandlerRegistered
  } = useSignMessageHandler()

  const allHandlersRegistered =
    isConnectionHandlerRegistered && isTransactionHandlerRegistered && isSignHandlerRegistered

  const { sessions } = useSnapshot(walletConnectStore.state)
  const activeWcSessions = sessions.filter(s => s.expiry * 1000 > Date.now())

  return (
    <div>
      <div className="flex flex-col gap-2 items-center justify-center w-full">
        {!transactionRequest && !connectionRequest && !signRequest && (
          <div className="w-full" style={{ maxWidth: '400px' }}>
            <Collapsible
              label={
                <div className="flex flex-col items-start justify-center gap-2" style={{ width: '400px' }}>
                  <Text color="text100">WalletConnect</Text>
                  {activeWcSessions.length > 0 && (
                    <span className="text-white text-style-sm">
                      {activeWcSessions.length} Active Connection{activeWcSessions.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              }
            >
              <WalletConnect />
            </Collapsible>
          </div>
        )}
      </div>
      <AnimatePresence>
        {allHandlersRegistered && !connectionRequest && !transactionRequest && !signRequest && (
          <motion.div
            className="flex p-4 items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Text variant="normal" color="text80">
              No pending confirmation
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-center w-full">
        <AnimatePresence>
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: '400px' }}
          >
            {connectionRequest && (
              <div className="flex mt-4 flex-col items-center justify-center p-4">
                <Text variant="medium" color="text80">
                  Connection request from dapp with origin <Text color="text100">{connectionRequest}</Text>
                </Text>
                <div className="flex flex-col gap-2 mt-6">
                  <Text variant="normal" color="text80">
                    - This will share your wallet address with the dapp
                  </Text>
                  <Text variant="normal" color="text80">
                    - This will NOT allow the dapp to do any operations without your confirmation
                  </Text>
                </div>
                <div className="flex mt-6 gap-2">
                  <Button label="Reject" onClick={handleRejectConnection} />
                  <Button variant="primary" label="Approve" onClick={handleApproveConnection} />
                </div>
              </div>
            )}
            {(isSendingTxn || isSigningMessage) && (
              <div className="flex items-center justify-center mt-4">
                <Spinner className="text-text100" size="lg" />
              </div>
            )}
            {transactionRequest && transactionRequest.length > 0 && !isSendingTxn && (
              <div className="flex mt-4 flex-col items-center justify-center p-4 rounded-xl gap-2">
                <TransactionDetails
                  transactions={transactionRequest}
                  chainId={txnChainId}
                  origin={txnOrigin}
                />

                {txnFeeOptions && feeOptionBalances.length > 0 && (
                  <FeeOptionSelector
                    txnFeeOptions={txnFeeOptions}
                    feeOptionBalances={feeOptionBalances}
                    selectedFeeOptionAddress={selectedFeeOptionAddress}
                    setSelectedFeeOptionAddress={setSelectedFeeOptionAddress}
                  />
                )}

                <div className="flex mt-2 pb-10 gap-2">
                  <Button label="Reject" onClick={handleRejectTxn} disabled={!hasCheckedFeeOptions} />
                  <Button
                    variant="primary"
                    label="Approve"
                    onClick={handleApproveTxn}
                    disabled={
                      !hasCheckedFeeOptions ||
                      (txnFeeOptions && txnFeeOptions.length > 0 && !selectedFeeOptionAddress)
                    }
                  />
                </div>
              </div>
            )}
            {signRequest && !isSigningMessage && (
              <div className="flex mt-4 flex-col items-center justify-center p-4 rounded-xl gap-2">
                <SignatureDetails message={signRequest.message} chainId={signChainId} origin={signOrigin} />
                <div className="flex mt-4 mb-2 gap-2">
                  <Button label="Reject" onClick={handleRejectSign} />
                  <Button variant="primary" label="Approve" onClick={handleApproveSign} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
