import { Text } from '@0xsequence/design-system';

import { SequenceLogo } from './SequenceLogo'

export const PoweredBySequence = () => {
  return (
    (<div
      className="flex gap-1 flex-row items-center justify-center select-none cursor-pointer absolute bottom-5 left-0 right-0"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.open('https://sequence.xyz')
        }
      }}>
      <Text variant="small" color="text100">
        Powered by Sequence
      </Text>
      <div className="h-5 w-5">
        <SequenceLogo />
      </div>
    </div>)
  );
}
