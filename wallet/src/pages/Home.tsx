import { Wallet } from './Wallet'

export const Home: React.FC = () => {
  return (
    <div className="flex max-w-1/2 mt-10 mx-auto px-4 flex-col gap-4 items-center justify-center w-full">
      <Wallet />
    </div>
  )
}
