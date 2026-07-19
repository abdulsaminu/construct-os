import { saveCircleWallet } from '../src/circle-wallet-store.js';

saveCircleWallet({
  walletId: 'deb8bc03-9fe7-563f-b0c5-87668725c834',
  walletSetId: '14b32ac9-4d11-5ca1-80bf-3e23f49cb8ad',
  address: '0xa3f963861dad702fb8bb1c533c0a5e406dfb76cb',
  blockchain: 'ARC-TESTNET',
  name: 'ConstructOS Main Treasury',
  refId: 'constructos-treasury-main',
});

console.log('Saved.');
