import { Button, Divider, Spinner, TabsHeader, TabsRoot, Text, TextInput } from '@0xsequence/design-system';
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
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({ session, onDisconnect }) => {
  const isExpired = session.expiry * 1000 < Date.now()

  return (
    (<div
      className="flex bg-background-secondary rounded-xl p-4 flex-row items-center justify-between gap-4">
      <div className="flex flex-row gap-3 items-center" style={{ flex: 1 }}>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-2">
            <Text variant="normal" color="text100" fontWeight="bold">
              {session.peerMetadata.name}
            </Text>
          </div>
          <Text variant="small" color="text80">
            {new URL(session.peerMetadata.url).hostname}
          </Text>
          <Text variant="xsmall" color="text50">
            Connected: {formatTime(session.expiry - 7 * 24 * 60 * 60)} {/* Assuming 7 day expiry */}
          </Text>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <Button size="sm" variant="danger" onClick={() => onDisconnect(session.topic)} label="Disconnect" />
      </div>
    </div>)
  );
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
    (<div className="flex gap-2 flex-col" style={{ maxWidth: '400px' }}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-2 justify-between items-center">
            <Text variant="small" color="text80">
              Connect to a dApp using WalletConnect
            </Text>
          </div>
          <TabsRoot
            value={connectMethod}
            onValueChange={(value: string) => setConnectMethod(value as ConnectMethod)}
          >
            <TabsHeader tabs={connectMethods} value={connectMethod} />
          </TabsRoot>
          <div className="flex flex-col gap-2 w-full">
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
                <div className="flex items-center justify-center mt-2 h-10">
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
                </div>
              </>
            ) : (
              <>
                {isQrScannerActive ? (
                  <div
                    className="bg-background-secondary rounded-xl p-4"
                    style={{ aspectRatio: '1', width: '100%' }}>
                    {isConnecting ? (
                      <div className="flex items-center justify-center h-full">
                        <Spinner />
                      </div>
                    ) : (
                      <QRScanner
                        onScan={handleScan}
                        onError={error => console.error(error)}
                        containerStyle={{
                          borderRadius: '8px'
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center mt-2 h-10">
                    <Button variant="primary" onClick={() => setIsQrScannerActive(true)} label="Scan again" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {validSessions.length > 0 && (
        <>
          <Divider className="w-full" />
          <div className="flex flex-col gap-2">
            {validSessions.map(session => (
              <ActiveSessionCard
                key={session.topic}
                session={session}
                onDisconnect={walletConnectStore.disconnectSession}
              />
            ))}
          </div>
        </>
      )}
      {!validSessions.length && (
        <>
          <Divider className="w-full" />
          <div
            className="flex flex-col items-center justify-center gap-2 p-6 bg-background-secondary rounded-xl">
            <Text className="text-center" variant="normal" color="text80">
              No active connections
            </Text>
            <Text className="text-center" variant="small" color="text50">
              Connect to a dApp using WalletConnect to get started
            </Text>
          </div>
        </>
      )}
    </div>)
  );
}
