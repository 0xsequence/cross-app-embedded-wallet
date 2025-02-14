import { Button, Text } from '@0xsequence/design-system';
import { EmailConflictInfo, IdentityType } from '@0xsequence/waas'

interface EmailConflictWarningProps {
  info: EmailConflictInfo
  onCancel: () => void
  onConfirm: () => void
}

const accountTypeText = (info: EmailConflictInfo) => {
  if (info.type === IdentityType.PlayFab) {
    return 'PlayFab'
  }

  if (info.type === IdentityType.Email) {
    return 'Email'
  }

  if (info.type === IdentityType.OIDC) {
    if (info.issuer.includes('cognito-idp')) {
      return 'Email v1 login'
    }

    switch (info.issuer) {
      case 'https://accounts.google.com':
        return 'Google'
      case 'https://appleid.apple.com':
        return 'Apple'
      default:
        return 'Unknown account type'
    }
  }

  return 'Unknown account type'
}

export const EmailConflictWarning = (props: EmailConflictWarningProps) => {
  const { onCancel } = props

  return (
    (<div
      className="flex flex-col px-10 py-4 items-center gap-4"
      style={{ maxWidth: '600px' }}>
      <div>
        <Text variant="large" color="text100" fontWeight="bold">
          Email already in use
        </Text>
      </div>
      <div className="h-full">
        <Text className="text-center" variant="normal" color="text50" asChild><div>It looks like you've previously signed into this email{' '}
            <Text color="text80">({props.info.email})</Text>with another login method. Please sign in again and
                      select the <Text color="text80">{accountTypeText(props.info)}</Text>option to access your account.
                    </div></Text>
      </div>
      <div className="flex flex-row gap-3 mt-2 mb-2">
        <Button label="OK" onClick={onCancel} />
      </div>
    </div>)
  );
}
