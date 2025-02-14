import {
  ArrowRightIcon,
  Button,
  Card,
  Divider,
  Image,
  Modal,
  PINCodeInput,
  Spinner,
  Text,
  TextInput,
} from '@0xsequence/design-system';
import { EmailConflictInfo } from '@0xsequence/waas'
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import React, { SetStateAction, useEffect, useRef, useState } from 'react'
import { appleAuthHelpers, useScript } from 'react-apple-signin-auth'
import { useNavigate } from 'react-router'

import { randomName } from '../utils/string'

import { useAuth } from '../context/AuthContext'

import { useEmailAuth } from '../hooks/useEmailAuth'

import { AppleLogo } from '../components/AppleLogo'
import { EmailConflictWarning } from '../components/EmailConflictWarning'
import { GoogleLogo } from '../components/GoogleLogo'

import { ROUTES } from '../routes'
import { googleClientId, sequenceWaas } from '../waasSetup'

const PROJECT_NAME = import.meta.env.VITE_PROJECT_NAME
const PROJECT_LOGO = import.meta.env.VITE_PROJECT_LOGO

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI

const BUTTON_SIZE = '14'
const ICON_SIZE = '10'

interface AppleAuthResponse {
  authorization: {
    id_token: string
  }
}

export const Auth: React.FC = () => {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC)
  const navigate = useNavigate()

  const { setWalletAddress, pendingEventOrigin, authState } = useAuth()
  const [isSocialLoginInProgress, setIsSocialLoginInProgress] = useState(false)

  useEffect(() => {
    if (authState.status === 'signedIn') {
      navigate(ROUTES.HOME)
    }
  }, [authState.status, navigate])

  const handleGoogleLogin = async (tokenResponse: CredentialResponse) => {
    try {
      setIsSocialLoginInProgress(true)
      const res = await sequenceWaas.signIn(
        {
          idToken: tokenResponse.credential!
        },
        randomName()
      )
      setWalletAddress(res.wallet)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSocialLoginInProgress(false)
    }
  }

  const handleAppleLogin = async () => {
    try {
      setIsSocialLoginInProgress(true)
      await appleAuthHelpers.signIn({
        authOptions: {
          clientId: APPLE_CLIENT_ID,
          redirectURI: APPLE_REDIRECT_URI,
          scope: 'openid email',
          usePopup: true
        },
        onSuccess: async (response: AppleAuthResponse) => {
          try {
            const res = await sequenceWaas.signIn(
              {
                idToken: response.authorization.id_token
              },
              randomName()
            )
            setWalletAddress(res.wallet)
          } catch (error) {
            console.error(error)
          } finally {
            setIsSocialLoginInProgress(false)
          }
        }
      })
    } catch (error) {
      console.error(error)
      setIsSocialLoginInProgress(false)
    }
  }

  const {
    inProgress: emailAuthInProgress,
    loading: emailAuthLoading,
    initiateAuth: initiateEmailAuth,
    sendChallengeAnswer,
    cancel: cancelEmailAuth
  } = useEmailAuth({
    sessionName: randomName(),
    onSuccess: async ({ wallet }) => {
      setWalletAddress(wallet)
    }
  })

  const [email, setEmail] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isEmailValid = inputRef.current?.validity.valid
  const [showEmailWarning, setEmailWarning] = useState(false)
  const [code, setCode] = useState<string[]>([])

  const [emailConflictInfo, setEmailConflictInfo] = useState<EmailConflictInfo | undefined>()
  const [isEmailConflictModalOpen, setIsEmailConflictModalOpen] = useState(false)
  const forceCreateFuncRef = useRef<(() => Promise<void>) | null>(null)

  sequenceWaas.onEmailConflict(async (info, forceCreate) => {
    forceCreateFuncRef.current = forceCreate
    setEmailConflictInfo(info)
    setIsEmailConflictModalOpen(true)
  })

  const isPopup = window.opener !== null

  return (
    (<div className="p-4">
      <div className="flex items-center justify-center">
        <div
          className="flex flex-col gap-2 my-4 items-center justify-center"
          style={{ maxWidth: '400px' }}>
          <div className="flex items-center flex-col mb-2">
            {PROJECT_LOGO && <Image className="max-w-1/2 max-h-1/4 aspect-square" src={PROJECT_LOGO} />}

            {isPopup && (
              <Text className="text-center mt-4" variant="normal" color="text100">
                Sign in to your <Text fontWeight="bold">{PROJECT_NAME}</Text> wallet to give access to dapp
                with origin <Text fontWeight="bold">{pendingEventOrigin}</Text>
              </Text>
            )}
            {!isPopup && (
              <Text className="mt-4" variant="medium" color="text80">
                Sign in to your <Text color="text100">{PROJECT_NAME}</Text> wallet
              </Text>
            )}
          </div>

          <Card className="mt-4 pb-4">
            {!emailAuthInProgress && (
              <>
                <div className="flex justify-center">
                  Sign in with Soneium
                </div>
                <div className="flex flex-row gap-4 my-5 justify-center items-center">
                  {isSocialLoginInProgress ? (
                    <Spinner size="md" />
                  ) : (
                    <>
                      {GOOGLE_CLIENT_ID && (
                        <GoogleOAuthProvider clientId={googleClientId}>
                          <Card className="bg-transparent rounded-sm p-0 relative" clickable>
                            <div
                              className="flex w-full h-full overflow-hidden rounded-lg items-center justify-center"
                              style={{ opacity: 0.0000001, transform: 'scale(1.4)' }}>
                              <GoogleLogin
                                className="w-56"
                                type="icon"
                                size="large"
                                onSuccess={handleGoogleLogin}
                                onError={() => {
                                  console.log('Login Failed')
                                  setIsSocialLoginInProgress(false)
                                }}
                              />
                            </div>
                            <div
                              className="flex bg-background-secondary rounded-sm justify-center items-center absolute pointer-events-none w-full h-full top-0 right-0">
                              <GoogleLogo width={ICON_SIZE} height={ICON_SIZE} />
                            </div>
                          </Card>
                        </GoogleOAuthProvider>
                      )}

                      {APPLE_CLIENT_ID && (
                        <Card
                          className="bg-transparent rounded-sm p-0 relative"
                          clickable
                          onClick={handleAppleLogin}>
                          <div
                            className="flex bg-background-secondary rounded-sm justify-center items-center w-full h-full">
                            <AppleLogo width={ICON_SIZE} height={ICON_SIZE} />
                          </div>
                        </Card>
                      )}
                    </>
                  )}
                </div>
                <div className="relative w-full">
                  <Divider className="bg-button-glass w-full" />
                </div>
              </>
            )}

            <div className="flex justify-center">
              <Text variant="medium" color="text100">
                Sign in with email
              </Text>
            </div>

            {sendChallengeAnswer ? (
              <div className="flex flex-col mt-6 p-4 items-center justify-center">
                <div>
                  <Text
                    className="flex items-center justify-center"
                    variant="normal"
                    color="text80">
                    Enter code received in email.
                  </Text>
                </div>
                <div className="mt-4">
                  <PINCodeInput value={code} digits={6} onChange={setCode} />
                </div>

                <div className="flex gap-2 mt-4 items-center justify-center">
                  {emailAuthLoading ? (
                    <Spinner />
                  ) : (
                    <Button
                      variant="primary"
                      disabled={code.includes('')}
                      label="Verify"
                      onClick={() => sendChallengeAnswer(code.join(''))}
                      data-id="verifyButton"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <Text variant="normal" color="text80">
                  Enter your email to receive a code to login and create your wallet.
                </Text>

                <div className="flex flex-row gap-2">
                  <div className="mt-4 w-full">
                    <TextInput
                      name="email"
                      type="email"
                      onChange={(ev: { target: { value: SetStateAction<string> } }) => {
                        setEmail(ev.target.value)
                      }}
                      ref={inputRef}
                      onKeyDown={(ev: { key: string }) => {
                        if (email && ev.key === 'Enter') {
                          initiateEmailAuth(email)
                        }
                      }}
                      onBlur={() => setEmailWarning(!!email && !isEmailValid)}
                      value={email}
                      placeholder="hello@example.com"
                      required
                      data-id="loginEmail"
                    />
                    {showEmailWarning && (
                      <Text className="my-2" variant="small" color="negative" asChild><p>Invalid email address
                                              </p></Text>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 items-center justify-center">
                    {emailAuthLoading ? (
                      <Spinner />
                    ) : (
                      <Button
                        variant="primary"
                        shape="circle"
                        disabled={!isEmailValid}
                        leftIcon={ArrowRightIcon}
                        onClick={() => initiateEmailAuth(email)}
                        data-id="continueButton"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      {isEmailConflictModalOpen && emailConflictInfo && (
        <Modal size="small" onClose={() => setIsEmailConflictModalOpen(false)}>
          <EmailConflictWarning
            info={emailConflictInfo}
            onCancel={() => {
              setIsEmailConflictModalOpen(false)
              setEmailConflictInfo(undefined)
              setIsSocialLoginInProgress(false)
              if (emailAuthInProgress) {
                setCode([])
                cancelEmailAuth()
                setEmail('')
              }
            }}
            onConfirm={async () => {
              setIsEmailConflictModalOpen(false)
              setEmailConflictInfo(undefined)
              await forceCreateFuncRef.current?.()
            }}
          />
        </Modal>
      )}
    </div>)
  );
}
