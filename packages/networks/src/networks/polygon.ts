import { NetworkConfig } from '@unlock-protocol/types'

export const polygon: NetworkConfig = {
  publicProvider: 'https://polygon-rpc.com/',
  provider: 'https://rpc.unlock-protocol.com/137',
  unlockAddress: '0xE8E5cd156f89F7bdB267EabD5C43Af3d5AF2A78f',
  multisig: '0x479f3830fbd715342868BA95E438609BCe443DFB',
  serializerAddress: '0x646e373eaf8a4aec31bf62b7fd6fb59296d6cda9',
  uniswapOracle: '0xE20ef269CE3ac2Af8107E706FC2Ec6E1831e3125',
  id: 137,
  name: 'Polygon',
  blockTime: 1000,
  subgraphURI:
    'https://api.thegraph.com/subgraphs/name/unlock-protocol/polygon',
  explorer: {
    name: 'Polygonscan',
    urls: {
      address: (address) => `https://polygonscan.com/address/${address}`,
      transaction: (hash) => `https://polygonscan.com/tx/${hash}`,
      token: (address, holder) =>
        `https://polygonscan.com/token/${address}?a=${holder}`,
    },
  },
  opensea: {
    tokenUrl: (lockAddress, tokenId) =>
      `https://opensea.io/assets/matic/${lockAddress}/${tokenId}`,
  },
  requiredConfirmations: 12,
  erc20: null,
  baseCurrencySymbol: 'Matic',
  locksmithUri: 'https://locksmith.unlock-protocol.com',
  nativeCurrency: {
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
  },
  startBlock: 21986688,
  previousDeploys: [
    {
      unlockAddress: '0x14bb3586Ce2946E71B95Fe00Fc73dd30ed830863',
      startBlock: 15714206,
    },
  ],
  description: 'Popular side chain network. Cheaper transaction cost.',
  isTestNetwork: false,
  teamMultisig: '0x479f3830fbd715342868BA95E438609BCe443DFB',
}

export default polygon
