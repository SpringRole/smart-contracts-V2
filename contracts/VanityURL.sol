pragma solidity ^0.5.5;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "tabookey-gasless/contracts/IRelayHub.sol";
import "tabookey-gasless/contracts/RelayRecipient.sol";


/**
 * @title VanityURL
 * @dev The VanityURL contract provides functionality to reserve vanity URLs.
 * Go to https://springrole.com to reserve.
 */
contract VanityURL is Ownable, Pausable, RelayRecipient {

    // This declares a state variable that mapping for vanityURL to address
    mapping (string => address) private vanity_address_mapping;
    // This declares a state variable that mapping for address to vanityURL
    mapping (address => string ) private address_vanity_mapping;
    // This declares a state variable that mapping for vanityURL to Springrole ID
    mapping (string => string) private vanity_springrole_id_mapping;
    // This declares a state variable that mapping for Springrole ID to vanityURL
    mapping (string => string) private springrole_id_vanity_mapping;
    // mapping of all whitelisted relays
    mapping (address => bool) public relaysWhitelist;
    
    event VanityReserved(address _to, string _vanity_url);
    event VanityTransfered(address _to, address _from, string _vanity_url);
    event VanityReleased(string _vanity_url);

    event RecipientPreCall();
    event RecipientPostCall(uint256 transactionFee, uint256 gasPrice, uint256 actualCharge, bool success, bytes32 preRetVal);

    address public blacklisted;

    constructor(IRelayHub rhub) public {
        setRelayHub(rhub);
    }

    function deposit() public payable {
        getRelayHub().depositFor.value(msg.value)(address(this));
    }

    function withdraw() public onlyOwner {
        uint256 balance = withdrawAllBalance();
        msg.sender.transfer(balance);
    }

    function acceptRelayedCall(
        address relay,
        address from,
        bytes calldata encodedFunction,
        uint256 transactionFee,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 nonce,
        bytes calldata approvalData,
        uint256 maxPossibleCharge
    )
        external view returns (uint256, bytes memory) 
    {
        if (relaysWhitelist[relay]) {
            return (0, "");
        }
        
        if (from == blacklisted) {
            return (3, "");
        }

        return (0, abi.encode(relay, from, encodedFunction, transactionFee, gasPrice, gasLimit, nonce, approvalData, maxPossibleCharge));
    }

    function preRelayedCall(bytes calldata context) external returns (bytes32) {
        emit RecipientPreCall();
        return bytes32(uint(123456));
    }

    function postRelayedCall(bytes calldata context, bool success, uint actualCharge, bytes32 preRetVal) external {
        ( , , , uint256 transactionFee, uint256 gasPrice, , , , ) = abi.decode(context, (
            address, address, bytes, uint256, uint256, uint256, uint256, bytes, uint256));
        emit RecipientPostCall(transactionFee, gasPrice, actualCharge, success, preRetVal);
    }

    function withdrawAllBalance() private returns (uint256) {
        uint256 balance = getRelayHub().balanceOf(address(this));
        getRelayHub().withdraw(balance);
        return balance;
    }
    
    /* function to retrive wallet address from vanity url */
    function retrieveWalletForVanity(string calldata _vanity_url) external view returns (address) {
        return vanity_address_mapping[_vanity_url];
    }

    /* function to retrive vanity url from address */
    function retrieveVanityForWallet(address _address) external view returns (string memory) {
        return address_vanity_mapping[_address];
    }

    /* function to retrive wallet springrole id from vanity url */
    function retrieveSpringroleIdForVanity(string calldata _vanity_url) external view returns (string memory) {
        return vanity_springrole_id_mapping[_vanity_url];
    }

    /* function to retrive vanity url from address */
    function retrieveVanityForSpringroleId(string calldata _springrole_id) external view returns (string memory) {
        return springrole_id_vanity_mapping[_springrole_id];
    }

    /**
     * @dev Function to reserve vanityURL
     * 1. Checks if vanity is check is valid
     * 2. Checks if address has already a vanity url
     * 3. check if vanity url is used by any other or not
     * 4. Check if vanity url is present in any other spingrole id
     * 5. Transfer the token
     * 6. Update the mapping variables
     */
    function reserve(string memory _vanity_url, string memory _springrole_id) public whenNotPaused {
        _vanity_url = _toLower(_vanity_url);
        require(checkForValidity(_vanity_url));
        require(vanity_address_mapping[_vanity_url] == address(0x0));
        require(bytes(address_vanity_mapping[getSender()]).length == 0);
        require(bytes(springrole_id_vanity_mapping[_springrole_id]).length == 0);
        /* adding to vanity address mapping */
        vanity_address_mapping[_vanity_url] = getSender();
        /* adding to vanity springrole id mapping */
        vanity_springrole_id_mapping[_vanity_url] = _springrole_id;
        /* adding to springrole id vanity mapping */
        springrole_id_vanity_mapping[_springrole_id] = _vanity_url;
        /* adding to address vanity mapping */
        address_vanity_mapping[getSender()] = _vanity_url;
        emit VanityReserved(getSender(), _vanity_url);
    }

    /**
     * @dev Function to change Vanity URL
     * 1. Checks whether vanity URL is check is valid
     * 2. Checks whether springrole id has already has a vanity
     * 3. Checks if address has already a vanity url
     * 4. check if vanity url is used by any other or not
     * 5. Check if vanity url is present in reserved keyword
     * 6. Update the mapping variables
     */
    function changeVanityURL(string memory _vanity_url, string memory _springrole_id) public whenNotPaused {
        require(bytes(address_vanity_mapping[getSender()]).length != 0);
        require(bytes(springrole_id_vanity_mapping[_springrole_id]).length == 0);
        _vanity_url = _toLower(_vanity_url);
        require(checkForValidity(_vanity_url));
        require(vanity_address_mapping[_vanity_url] == address(0x0));

        vanity_address_mapping[_vanity_url] = getSender();
        address_vanity_mapping[getSender()] = _vanity_url;
        vanity_springrole_id_mapping[_vanity_url] = _springrole_id;
        springrole_id_vanity_mapping[_springrole_id] = _vanity_url;

        emit VanityReserved(getSender(), _vanity_url);
    }

    /**
     * @dev Function to transfer ownership for Vanity URL
     */
    function transferOwnershipForVanityURL(address _to) public whenNotPaused {
        require(bytes(address_vanity_mapping[_to]).length == 0);
        require(bytes(address_vanity_mapping[getSender()]).length != 0);
        address_vanity_mapping[_to] = address_vanity_mapping[getSender()];
        vanity_address_mapping[address_vanity_mapping[getSender()]] = _to;
        emit VanityTransfered(getSender(), _to, address_vanity_mapping[getSender()]);
        delete (address_vanity_mapping[getSender()]);
    }

    /** 
     * @dev Function to transfer ownership for Vanity URL by Owner
     */
    function reserveVanityURLByOwner(
        address _to,
        string memory _vanity_url,
        string memory _springrole_id
    ) 
        public
        onlyOwner 
        whenNotPaused
    {
        _vanity_url = _toLower(_vanity_url);
        require(checkForValidity(_vanity_url));
        /* check if vanity url is being used by anyone */
        if (vanity_address_mapping[_vanity_url] != address(0)) {
            /* Sending Vanity Transfered Event */
            emit VanityTransfered(vanity_address_mapping[_vanity_url], _to, _vanity_url);
            /* delete from address mapping */
            delete (address_vanity_mapping[vanity_address_mapping[_vanity_url]]);
            /* delete from vanity mapping */
            delete (vanity_address_mapping[_vanity_url]);
            /* delete from springrole id vanity mapping */
            delete (springrole_id_vanity_mapping[vanity_springrole_id_mapping[_vanity_url]]);
            /* delete from vanity springrole id mapping */
            delete (vanity_springrole_id_mapping[_vanity_url]);
        } else {
            /* sending VanityReserved event */
            emit VanityReserved(_to, _vanity_url);
        }
        /* add new address to mapping */
        vanity_address_mapping[_vanity_url] = _to;
        address_vanity_mapping[_to] = _vanity_url;
        springrole_id_vanity_mapping[_springrole_id] = _vanity_url;
        vanity_springrole_id_mapping[_vanity_url] = _springrole_id;
    }

    /**
     * @dev Function to release a Vanity URL by Owner
     */
    function releaseVanityUrl(string memory _vanity_url) public onlyOwner whenNotPaused {
        require(vanity_address_mapping[_vanity_url] != address(0));
        /* delete from address mapping */
        delete (address_vanity_mapping[vanity_address_mapping[_vanity_url]]);
        /* delete from vanity mapping */
        delete (vanity_address_mapping[_vanity_url]);
        /* delete from springrole id vanity mapping */
        delete (springrole_id_vanity_mapping[vanity_springrole_id_mapping[_vanity_url]]);
        /* delete from vanity springrole id mapping */
        delete (vanity_springrole_id_mapping[_vanity_url]);
        /* sending VanityReleased event */
        emit VanityReleased(_vanity_url);
    }

    /**
     * @dev Function to kill contract
     */
    function kill() public onlyOwner {
        selfdestruct(address(uint160(owner())));
    }

    /**
     * @dev Function to make lowercase
     */
    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        uint8 c;
        for (uint i = 0; i < bStr.length; i++) {
            c = uint8(bStr[i]);
            // Uppercase character...
            if (c >= 65 && c <= 90) {
                // So we add 32 to make it lowercase
                bLower[i] = bytes1(c + 32);
            } else {
                bLower[i] = bytes1(c);
            }
        }
        return string(bLower);
    }

    /**
     * @dev Function to verify vanityURL
     * 1. Minimum length 4
     * 2. Maximum lenght 200
     * 3. Vanity url is only alphanumeric 
     */
    function checkForValidity(string memory _vanity_url) internal pure returns (bool) {
        uint length =  bytes(_vanity_url).length;
        uint8 c;
        if (!(length >= 4 && length <= 200)) {
            return false;
        }
        
        for (uint i =0; i < length; i++) {
            c = uint8(bytes(_vanity_url)[i]);
            if ((c < 48 || c > 122 || (c > 57 && c < 65) || (c > 90 && c < 97)) && (c != 95)) {
                return false;
            }
                
        }

        return true;
    }

}
