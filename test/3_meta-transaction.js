const Attestation = artifacts.require('Attestation');
const VanityURL = artifacts.require('VanityURL');
const { RelayProvider } = require('tabookey-gasless');
const { expect } = require('chai');
const { expectEvent } = require('openzeppelin-test-helpers');

contract('Attestation & VanityURL (meta txns test)', function([
  _,
  anotherUser
]) {
  let attestationInstance;
  let gasless;
  let gasPrice;
  let relay_client_config;

  before(async function() {
    const gasPricePercent = 100;
    gasPrice = ((await web3.eth.getGasPrice()) * (100 + gasPricePercent)) / 100;
    gasless = await web3.eth.personal.newAccount('password');
    web3.eth.personal.unlockAccount(gasless, 'password');
    attestationInstance = await Attestation.deployed();
    vanityInstance = await VanityURL.deployed();
  });

  describe('enable relay', function() {
    it('should be able to enable relay', async function() {
      relay_client_config = {
        txfee: 60,
        force_gasPrice: gasPrice, //override requested gas price
        force_gasLimit: 900000,
        verbose: process.env.DEBUG
      };

      let relayProvider = await new RelayProvider(
        web3.currentProvider,
        relay_client_config
      );

      await Attestation.web3.setProvider(relayProvider);
      await VanityURL.web3.setProvider(relayProvider);
    });
  });

  describe('Attestation:', function() {
    it('should be able to send gasless tranasactions and emit Attest event', async function() {
      // await timeout(5000);
      const { logs } = await attestationInstance.write(
        'some_type',
        'some_data',
        {
          from: gasless
        }
      );
      expectEvent.inLogs(logs, 'Attest', {
        _address: gasless,
        _type: 'some_type',
        _data: 'some_data'
      });
    });
  });

  describe('VanityURL:', function() {
    describe('reserve a Vanity url', function() {
      before(async function() {
        // await timeout(5000);
        await vanityInstance.reserve('sr_user', 'srind1', { from: gasless });
      });

      it('Should be able to retrive the same wallet address', async function() {
        expect(
          await vanityInstance.retrieveWalletForVanity.call('sr_user')
        ).equal(gasless);
      });

      it('Should be able to retrive the same Vanity', async function() {
        expect(
          await vanityInstance.retrieveVanityForWallet.call(gasless)
        ).equal('sr_user');
      });

      it('Should be able to retrive the same springrole id', async function() {
        expect(
          await vanityInstance.retrieveSpringroleIdForVanity.call('sr_user')
        ).equal('srind1');
      });

      it('Should be able to retrive the same Vanity', async function() {
        expect(
          await vanityInstance.retrieveVanityForSpringroleId.call('srind1')
        ).equal('sr_user');
      });
    });

    describe('Change Vanity URL', function() {
      it('should be able to change Vanity url', async function() {
        // await timeout(5000);
        await vanityInstance.changeVanityURL('nervehammer', 'srind2', {
          from: gasless
        });
      });

      it('Vanity url should be assigned to user', async function() {
        expect(
          await vanityInstance.retrieveVanityForWallet.call(gasless)
        ).equal('nervehammer');
      });

      it('Vanity url should be able to retrive from assigned user wallet address', async function() {
        expect(
          await vanityInstance.retrieveWalletForVanity.call('nervehammer')
        ).equal(gasless);
      });
    });

    describe('transfer a Vanity url', function() {
      it('should be able to transfer ownership of Vanity url to other user', async function() {
        // await timeout(5000);
        await vanityInstance.transferOwnershipForVanityURL(anotherUser, {
          from: gasless
        });
      });

      it('should be able to retrive the same Vanity', async function() {
        expect(
          await vanityInstance.retrieveVanityForWallet.call(anotherUser)
        ).equal('nervehammer');
      });

      it('should be able to retrive the new wallet address', async function() {
        expect(
          await vanityInstance.retrieveWalletForVanity.call('nervehammer')
        ).equal(anotherUser);
      });
    });
  });
});
