import React, { useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Lock } from './Lock'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

import { useAccount } from '../../../hooks/useAccount'
import { Button } from './FormStyles'
import { EnjoyYourMembership } from './EnjoyYourMembership'
import { PaywallConfig } from '../../../unlockTypes'
import { ConfigContext } from '../../../utils/withConfig'

interface ClaimMembershipCheckoutProps {
  emitTransactionInfo: (info: TransactionInfo) => void
  lock: any
  network: number
  name: string
  closeModal: (success: boolean) => void
  paywallConfig: PaywallConfig
  redirectUri: string
}

export const ClaimMembershipCheckout = ({
  emitTransactionInfo,
  lock,
  network,
  name,
  closeModal,
  paywallConfig,
  redirectUri,
}: ClaimMembershipCheckoutProps) => {
  const config = useContext(ConfigContext)
  const { account } = useContext(AuthenticationContext)
  // @ts-expect-error account is _always_ defined in this component
  const { claimMembershipFromLock } = useAccount(account, network)
  const [purchasePending, setPurchasePending] = useState(false)
  const [keyExpiration, setKeyExpiration] = useState(0)
  const [error, setError] = useState('')
  // Convenience
  const now = new Date().getTime() / 1000
  const hasValidkey =
    keyExpiration === -1 || (keyExpiration > now && keyExpiration < Infinity)
  const hasOptimisticKey = keyExpiration === Infinity

  useEffect(() => {
    const waitForTransaction = async (hash: string) => {
      if (config.networks[network]) {
        const provider = new ethers.providers.JsonRpcProvider(
          config.networks[network].provider
        )
        try {
          await provider.waitForTransaction(hash)
          setKeyExpiration(Infinity) // Optimistic!
          setPurchasePending(false)
        } catch (e) {
          console.error(e)
          setError('Claim failed. Please try again.')
        }
      }
    }

    if (purchasePending && typeof purchasePending === 'string') {
      // If we have a hash, let's wait for it to be mined!
      waitForTransaction(purchasePending)
    }
  }, [purchasePending])

  const charge = async () => {
    setError('')
    setPurchasePending(true)
    try {
      const { transactionHash: hash } = await claimMembershipFromLock(
        lock.address,
        network
      )
      if (hash) {
        emitTransactionInfo({
          lock: lock.address,
          hash,
        })
        if (!paywallConfig.pessimistic) {
          setKeyExpiration(Infinity) // Optimistic!
          setPurchasePending(false)
        } else {
          setPurchasePending(hash)
        }
      } else {
        setError('Claim failed. Please try again.')
        setPurchasePending(false)
      }
    } catch (error: any) {
      console.error(error)
      setError('Claim failed. Please try again.')
      setPurchasePending(false)
    }
  }

  const handleHasKey = (key: any) => {
    if (!key) {
      setKeyExpiration(0)
    } else {
      setKeyExpiration(key.expiration)
    }
  }

  if (!lock.fiatPricing?.creditCardEnabled) {
    return (
      <div className="flex flex-col w-full">
        <Lock
          recipient={account}
          network={network}
          lock={lock}
          name={name}
          setHasKey={handleHasKey}
          onSelected={null}
          hasOptimisticKey={hasOptimisticKey}
          purchasePending={purchasePending}
        />
        <p className="w-full text-base text-left text-red-500">
          Unfortunately, you cannot claim a membership from this lock. You need
          to send a transaction using a crypto-wallet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <Lock
        recipient={account}
        network={network}
        lock={lock}
        name={name}
        setHasKey={handleHasKey}
        onSelected={null}
        hasOptimisticKey={hasOptimisticKey}
        purchasePending={purchasePending}
      />

      {!hasValidkey && !hasOptimisticKey && (
        <>
          <Button disabled={purchasePending} onClick={charge}>
            Claim your membership
          </Button>
          {error && (
            <p className="w-full text-base text-left text-red-500">{error}</p>
          )}
        </>
      )}
      {hasValidkey && (
        <>
          <p className="w-full text-base text-left">
            You already have a valid membership!
          </p>
          <EnjoyYourMembership
            redirectUri={redirectUri}
            closeModal={closeModal}
          />
        </>
      )}
      {purchasePending && typeof purchasePending === 'string' && (
        <p className="w-full text-base text-left">
          Waiting for your{' '}
          <a
            target="_blank"
            href={config.networks[network].explorer.urls.transaction(
              purchasePending
            )}
            rel="noreferrer"
          >
            NFT membership to be minted
          </a>
          ! This should take a few seconds :)
        </p>
      )}

      {hasOptimisticKey && (
        <EnjoyYourMembership
          redirectUri={redirectUri}
          closeModal={closeModal}
        />
      )}
    </div>
  )
}

export default ClaimMembershipCheckout
