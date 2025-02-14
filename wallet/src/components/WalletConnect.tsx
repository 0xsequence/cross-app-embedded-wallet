import {
  Box,
  Button,
  Divider,
  Spinner,
  TabsHeader,
  TabsRoot,
  Text,
  TextInput
} from '@0xsequence/design-system'
import { SessionTypes } from '@walletconnect/types'
import { useEffect, useState } from 'react'
import { subscribe, useSnapshot } from 'valtio'

import { walletConnectStore } from '../store/WalletConnectStore'

import { QRScanner } from './QRScanner'

interface SessionViewProps {
  topic: string
  peerMetadata: {
    name: string
    description?: string
    url: string
    icon?: string
  }
  expiry: number
}

const mapSessionToView = (session: {
  topic: string
  peer: {
    metadata: {
      name: string
      description: string
      url: string
      icons: readonly string[]
    }
  }
  expiry: number
}): SessionViewProps => ({
  topic: session.topic,
  peerMetadata: {
    name: session.peer.metadata.name,
    description: session.peer.metadata.description,
    url: session.peer.metadata.url,
    icon: session.peer.metadata.icons?.[0]
  },
  expiry: session.expiry
})

interface ActiveSessionCardProps {
  session: SessionViewProps
  onDisconnect: (topic: string) => void
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({ session, onDisconnect }) => {
  const isExpired = session.expiry * 1000 < Date.now()

  return (
    <Box
      background="backgroundSecondary"
      borderRadius="md"
      padding="4"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      gap="4"
      opacity={isExpired ? '50' : '100'}
    >
      <Box flexDirection="row" gap="3" alignItems="center" style={{ flex: 1 }}>
        <Box flexDirection="column" gap="1">
          <Box flexDirection="row" alignItems="center" gap="2">
            <Text variant="normal" color="text100" fontWeight="bold">
              {session.peerMetadata.name}
            </Text>
          </Box>
          <Text variant="small" color="text80">
            {new URL(session.peerMetadata.url).hostname}
          </Text>
          <Text variant="xsmall" color="text50">
            Connected: {formatTime(session.expiry - 7 * 24 * 60 * 60)} {/* Assuming 7 day expiry */}
          </Text>
        </Box>
      </Box>
      <Box flexDirection="column" gap="2" alignItems="flex-end">
        <Button size="sm" variant="danger" onClick={() => onDisconnect(session.topic)} label="Disconnect" />
      </Box>
    </Box>
  )
}

type ConnectMethod = 'uri' | 'qr'

const getConnectMethods = (isMobile: boolean) => [
  { value: isMobile ? 'qr' : 'uri', label: isMobile ? 'Scan QR' : 'Paste URI' },
  { value: isMobile ? 'uri' : 'qr', label: isMobile ? 'Paste URI' : 'Scan QR' }
]

export const WalletConnect = () => {
  const isMobile = isMobileDevice()
  const [wcUri, setWcUri] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectMethod, setConnectMethod] = useState<ConnectMethod>(isMobile ? 'qr' : 'uri')
  const [isQrScannerActive, setIsQrScannerActive] = useState(true)
  const { sessions, isReady } = useSnapshot(walletConnectStore.state)

  // Keep track of initial sessions count to detect new connections
  const [initialSessionsCount, setInitialSessionsCount] = useState(sessions.length)

  useEffect(() => {
    if (!isConnecting) return

    // Listen for session changes to detect when connection is complete
    const unsubscribe = subscribe(walletConnectStore.state, () => {
      if (walletConnectStore.state.sessions.length > initialSessionsCount) {
        // A new session was added, connection is complete
        setIsConnecting(false)
        setWcUri('') // Clear the input
        if (connectMethod === 'qr') {
          setIsQrScannerActive(false) // Hide scanner only if QR tab is active
        }
      }
    })

    return () => unsubscribe()
  }, [isConnecting, initialSessionsCount])

  const handlePair = async (uri: string) => {
    if (!uri || !isReady) return

    try {
      setIsConnecting(true)
      setInitialSessionsCount(sessions.length)
      await walletConnectStore.pair(uri)
    } catch (error) {
      console.error('Failed to pair:', error)
      setIsConnecting(false)
    }
  }

  const handleScan = (qrContent: string) => {
    handlePair(qrContent)
  }

  const validSessions = sessions
    .filter(s => s.expiry * 1000 > Date.now())
    .map(s => mapSessionToView(s as SessionTypes.Struct))

  const connectMethods = getConnectMethods(isMobile)

  return (
    <Box gap="2" flexDirection="column" style={{ maxWidth: '400px' }}>
      <Box flexDirection="column" gap="2">
        <Box flexDirection="column" gap="3">
          <Box flexDirection="row" gap="2" justifyContent="space-between" alignItems="center">
            <Text variant="small" color="text80">
              Connect to a dApp using WalletConnect
            </Text>
          </Box>
          <TabsRoot
            value={connectMethod}
            onValueChange={(value: string) => setConnectMethod(value as ConnectMethod)}
          >
            <TabsHeader tabs={connectMethods} value={connectMethod} />
          </TabsRoot>
          <Box flexDirection="column" gap="2" width="full">
            {connectMethod === 'uri' ? (
              <>
                <TextInput
                  value={wcUri}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWcUri(e.target.value)}
                  placeholder="wc:..."
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      handlePair(wcUri)
                    }
                  }}
                />
                <Box alignItems="center" justifyContent="center" marginTop="2" height="10">
                  {isConnecting ? (
                    <Spinner />
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handlePair(wcUri)}
                      disabled={!wcUri || isConnecting || !isReady}
                      label="Connect"
                    />
                  )}
                </Box>
              </>
            ) : (
              <>
                {isQrScannerActive ? (
                  <Box
                    background="backgroundSecondary"
                    borderRadius="md"
                    padding="4"
                    style={{ aspectRatio: '1', width: '100%' }}
                  >
                    {isConnecting ? (
                      <Box alignItems="center" justifyContent="center" height="full">
                        <Spinner />
                      </Box>
                    ) : (
                      <QRScanner
                        onScan={handleScan}
                        onError={error => console.error(error)}
                        containerStyle={{
                          borderRadius: '8px'
                        }}
                      />
                    )}
                  </Box>
                ) : (
                  <Box alignItems="center" justifyContent="center" marginTop="2" height="10">
                    <Button variant="primary" onClick={() => setIsQrScannerActive(true)} label="Scan again" />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      {validSessions.length > 0 && (
        <>
          <Divider width="full" />
          <Box flexDirection="column" gap="2">
            {validSessions.map(session => (
              <ActiveSessionCard
                key={session.topic}
                session={session}
                onDisconnect={walletConnectStore.disconnectSession}
              />
            ))}
          </Box>
        </>
      )}

      {!validSessions.length && (
        <>
          <Divider width="full" />
          <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="2"
            padding="6"
            background="backgroundSecondary"
            borderRadius="md"
          >
            <Text variant="normal" color="text80" textAlign="center">
              No active connections
            </Text>
            <Text variant="small" color="text50" textAlign="center">
              Connect to a dApp using WalletConnect to get started
            </Text>
          </Box>
        </>
      )}
    </Box>
  )
}
