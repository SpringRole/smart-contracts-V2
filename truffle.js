var HDWalletProvider = require('truffle-hdwallet-provider-privkey');

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      gas: 6721975,
      network_id: '*' // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          ['<Priv key goes here>'],
          'https://ropsten.infura.io/<Infura pub key>'
        );
      },
      network_id: 3,
      gas: 4600000
    }
  },
  compilers: {
    solc: {
      version: '0.5.10'
    }
  }
};
