const VanityURL = artifacts.require('./VanityURL.sol');
const { expect } = require('chai');
const { expectRevert } = require('openzeppelin-test-helpers');

contract('VanityURL', function([owner, user1, user2, user3, user4, user5]) {
  let vanityInstance;

  before(async function() {
    this.vanityInstance = await VanityURL.deployed();
  });

  describe('reserve a Vanity url', function() {
    before(async function() {
      await this.vanityInstance.reserve('vinay_035', 'srind1', { from: user1 });
    });

    it('Should be able to retrive the same wallet address', async function() {
      expect(
        await this.vanityInstance.retrieveWalletForVanity.call('vinay_035')
      ).equal(user1);
    });

    it('Should be able to retrive the same Vanity', async function() {
      expect(
        await this.vanityInstance.retrieveVanityForWallet.call(user1)
      ).equal('vinay_035');
    });

    it('Should be able to retrive the same springrole id', async function() {
      expect(
        await this.vanityInstance.retrieveSpringroleIdForVanity.call(
          'vinay_035'
        )
      ).equal('srind1');
    });

    it('Should be able to retrive the same Vanity', async function() {
      expect(
        await this.vanityInstance.retrieveVanityForSpringroleId.call('srind1')
      ).equal('vinay_035');
    });
  });

  describe('reserve a Vanity url (case insensitive)', function() {
    before(async function() {
      await this.vanityInstance.reserve('CASEIN', 'srind2', { from: user2 });
    });

    it('Should be able to retrive the same wallet address', async function() {
      expect(
        await this.vanityInstance.retrieveWalletForVanity.call('casein')
      ).equal(user2);
    });

    it('Should be able to retrive the same Vanity', async function() {
      expect(
        await this.vanityInstance.retrieveVanityForWallet.call(user2)
      ).equal('casein');
    });

    it('Should be able to retrive the same springrole id', async function() {
      expect(
        await this.vanityInstance.retrieveSpringroleIdForVanity.call('casein')
      ).equal('srind2');
    });

    it('Should be able to retrive the same Vanity', async function() {
      expect(
        await this.vanityInstance.retrieveVanityForSpringroleId.call('srind2')
      ).equal('casein');
    });
  });

  describe('reserve a non alphanumeric Vanity url', function() {
    it('should fail and revert', async function() {
      await expectRevert.unspecified(
        this.vanityInstance.reserve('Vi@345', 'srind3', { from: user3 })
      );
    });
  });

  describe('reserve a Vanity url of less than 4 characters', function() {
    it('should fail and revert', async function() {
      await expectRevert.unspecified(
        this.vanityInstance.reserve('van', 'srind3', { from: user3 })
      );
    });
  });

  describe('reserve a already reserved Vanity url', function() {
    it('should fail and revert', async function() {
      await expectRevert.unspecified(
        this.vanityInstance.reserve('vinay_035', 'srind3', { from: user3 })
      );
    });
  });

  describe('transfer a Vanity url', function() {
    it('should be able to transfer ownership of Vanity url to other user', async function() {
      await this.vanityInstance.transferOwnershipForVanityURL(user3, {
        from: user1
      });
    });

    it('should be able to retrive the same Vanity', async function() {
      expect(
        await this.vanityInstance.retrieveVanityForWallet.call(user3)
      ).equal('vinay_035');
    });

    it('should be able to retrive the new wallet address', async function() {
      expect(
        await this.vanityInstance.retrieveWalletForVanity.call('vinay_035')
      ).equal(user3);
    });
  });

  describe('Not a dApp owner', function() {
    describe('Release Vanity url', function() {
      it('should not be able to release url', async function() {
        await expectRevert.unspecified(
          this.vanityInstance.releaseVanityUrl('casein', { from: user4 })
        );
      });
    });

    describe('Reserve a Vanity url for other user', function() {
      it('should not be able to reserve a url', async function() {
        await expectRevert.unspecified(
          this.vanityInstance.reserveVanityURLByOwner(
            user3,
            'testowner',
            'srind3',
            {
              from: user4
            }
          )
        );
      });
    });
  });

  describe('dApp owner', function() {
    describe('Release Vanity url', function() {
      it('should be able to release url', async function() {
        this.vanityInstance.releaseVanityUrl('casein', { from: owner });
      });
    });

    describe('Reserve a Vanity url for other user', function() {
      it('should be able to reserve Vanity URL for others', async function() {
        await this.vanityInstance.reserveVanityURLByOwner(
          user4,
          'testowner',
          'srind3',
          { from: owner }
        );
      });

      it('reserved Vanity url should be assigned to user', async function() {
        expect(
          await this.vanityInstance.retrieveVanityForWallet.call(user4)
        ).equal('testowner');
      });

      it('reserved Vanity url should be able to retrive from assigned user wallet address', async function() {
        expect(
          await this.vanityInstance.retrieveWalletForVanity.call('testowner')
        ).equal(user4);
      });
    });
  });

  describe('Change Vanity URL', function() {
    describe('address has no Vanity URL', function() {
      it('should fail and revert', async function() {
        await expectRevert.unspecified(
          this.vanityInstance.changeVanityURL('noassigned', 'srind4', {
            from: user5
          })
        );
      });
    });
    describe('when vanity is in use', function() {
      it('should fail and revert', async function() {
        await expectRevert.unspecified(
          this.vanityInstance.changeVanityURL('vinay_035', 'srind4', {
            from: user3
          })
        );
      });
    });

    describe('have an existing Vanity url and new Vanity url not in use', function() {
      it('should be able to change Vanity url', async function() {
        await this.vanityInstance.changeVanityURL('nervehammer', 'srind4', {
          from: user3
        });
      });

      it('Vanity url should be assigned to user', async function() {
        expect(
          await this.vanityInstance.retrieveVanityForWallet.call(user3)
        ).equal('nervehammer');
      });

      it('Vanity url should be able to retrive from assigned user wallet address', async function() {
        expect(
          await this.vanityInstance.retrieveWalletForVanity.call('nervehammer')
        ).equal(user3);
      });
    });
  });
});
