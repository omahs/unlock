import { useQueries } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ImageBar } from './ImageBar'
import { MemberCard } from './MemberCard'
import { paginate } from '~/utils/pagination'
import { PaginationBar } from './PaginationBar'
import React from 'react'

interface MembersProps {
  lockAddress: string
  network: number
  loading: boolean
  setPage: (page: number) => void
  page: number
  filters?: {
    [key: string]: any
  }
}

const MembersPlaceholder = () => {
  const placeHolderCardStyle =
    'h-[130px] md:h-[92px] border-2 rounded-lg bg-slate-200 animate-pulse'
  return (
    <div className="flex flex-col gap-3">
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
    </div>
  )
}

export const Members = ({
  lockAddress,
  network,
  loading: loadingFilters,
  setPage,
  page,
  filters = {
    query: '',
    filterKey: 'owner',
    expiration: 'all',
  },
}: MembersProps) => {
  const { account } = useAuth()
  const walletService = useWalletService()
  const web3Service = useWeb3Service()
  const storageService = useStorageService()

  const getMembers = async () => {
    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network,
    })
    return storageService.getKeys({
      lockAddress,
      network,
      filters,
    })
  }

  const getLockVersion = async (): Promise<number> => {
    if (!network) return 0
    return web3Service.publicLockVersion(lockAddress, network)
  }

  const [
    { isLoading, data: members = [] },
    { isLoading: isLoadingVersion, data: lockVersion = 0 },
  ] = useQueries({
    queries: [
      {
        queryFn: getMembers,
        queryKey: ['getMembers', lockAddress, network, filters],
        onError: () => {
          ToastHelper.error('There is some unexpected issue, please try again')
        },
      },
      {
        queryFn: getLockVersion,
        queryKey: ['getLockVersion', lockAddress, network],
        onError: () => {
          ToastHelper.error('There is some unexpected issue, please try again')
        },
      },
    ],
  })

  const loading = isLoadingVersion || isLoading || loadingFilters
  const noItems = members?.length === 0 && !loading

  const hasActiveFilter =
    filters?.expiration !== 'active' || filters?.filterKey !== 'owner'
  const hasSearch = filters?.query?.length > 0

  if (loading) {
    return <MembersPlaceholder />
  }

  if (noItems && !hasSearch && !hasActiveFilter) {
    return (
      <ImageBar
        src="/images/illustrations/no-member.svg"
        alt="No members"
        description="There are no members yet, but keep it up."
      />
    )
  }

  if (noItems && (hasSearch || hasActiveFilter)) {
    return (
      <ImageBar
        src="/images/illustrations/no-member.svg"
        alt="No results"
        description="No key matches your filter."
      />
    )
  }

  const pageOffset = page - 1 ?? 0
  const { items, maxNumbersOfPage } = paginate({
    items: members,
    page: pageOffset,
    itemsPerPage: 30,
  })

  const showPagination = maxNumbersOfPage > 1

  return (
    <div className="grid grid-cols-1 gap-6">
      {(items || [])?.map((metadata: any) => {
        const { token, keyholderAddress: owner, expiration } = metadata ?? {}
        return (
          <MemberCard
            key={metadata.token}
            token={token}
            owner={owner}
            expiration={expiration}
            version={lockVersion}
            metadata={metadata}
            lockAddress={lockAddress!}
            network={network}
          />
        )
      })}
      {showPagination && (
        <PaginationBar
          maxNumbersOfPage={maxNumbersOfPage}
          setPage={setPage}
          page={page}
        />
      )}
    </div>
  )
}
