module.exports = [
  {
    constant: false,
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'encodedFunction', type: 'bytes' },
      { name: 'transactionFee', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasLimit', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'approval', type: 'bytes' }
    ],
    name: 'relayCall',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'relayaddr', type: 'address' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'from', type: 'address' }],
    name: 'getNonce',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'relayaddr', type: 'address' }],
    name: 'stakeOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'target', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'target', type: 'address' }],
    name: 'depositFor',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: 'relayaddr', type: 'address' },
      { name: 'unstakeDelay', type: 'uint256' }
    ],
    name: 'stake',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_relay', type: 'address' }],
    name: 'unstake',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'relay', type: 'address' },
      { indexed: false, name: 'stake', type: 'uint256' }
    ],
    name: 'Staked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'relay', type: 'address' },
      { indexed: false, name: 'stake', type: 'uint256' }
    ],
    name: 'Unstaked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'relay', type: 'address' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'transactionFee', type: 'uint256' },
      { indexed: false, name: 'stake', type: 'uint256' },
      { indexed: false, name: 'unstakeDelay', type: 'uint256' },
      { indexed: false, name: 'url', type: 'string' }
    ],
    name: 'RelayAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'relay', type: 'address' },
      { indexed: false, name: 'unstakeTime', type: 'uint256' }
    ],
    name: 'RelayRemoved',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'relay', type: 'address' },
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'selector', type: 'bytes4' },
      { indexed: false, name: 'status', type: 'uint256' },
      { indexed: false, name: 'chargeOrCanRelayStatus', type: 'uint256' }
    ],
    name: 'TransactionRelayed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'src', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Deposited',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'dest', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Withdrawn',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'relay', type: 'address' },
      { indexed: false, name: 'sender', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Penalized',
    type: 'event'
  }
];
