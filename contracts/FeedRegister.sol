pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";

contract ImageRegister is Destructible {

    struct Feed {
        string ipfsHash;
        string userAlias;
        uint256 dateLastModified;
    }

    mapping (address => Feed) public userAddressToFeedMapping;

    bool private stopped = false;

    event FeedUpdatedOrAdded(
        address _userAddress, 
        string _ipfsHash, 
        string _userAlias
        uint256 _dateLastModified
    );

    event LogEmergencyStop(
        address indexed _owner, 
        bool _stop
    );

    modifier stopInEmergency { 
        require(!stopped); 
        _;
    }

    function() public {}

    function updateFeed(
        string _ipfsHash, 
        string _userAlias
    ) public stopInEmergency returns (bool _success) {
            
        require(bytes(_ipfsHash).length == 46);
        require(bytes(_userAlias).length > 0 && bytes(_userAlias).length <= 256);

        uint256 dateLastModified = now;
        Feed memory feed = Feed(
            _ipfsHash,
            _userAlias,
            uploadedOn
        );

        userAddressToFeedMapping[msg.sender] = feed;

        emit FeedUpdated(
            msg.sender,
            _ipfsHash,
            _userAlias,
            dateLastModified
        );

        _success = true;
    }

    function getFeed(address _userAddress) 
        public stopInEmergency view returns (
        string _ipfsHash, 
        string _userAlias,
        uint256 _dateLastModified
    ) {

        require(_owner != 0x0);

        Feed storage feed = userAddressToFeedMapping[_userAddress];
        
        return (
            feed.ipfsHash,
            feed.userAlias,
            feed.dateLastModified
        );
    }

    /**
    * @notice Pause the contract. 
    * It stops execution if certain conditions are met and can be useful 
    * when new errors are discovered. 
    * @param _stop Switch the circuit breaker on or off
    */
    function emergencyStop(bool _stop) public onlyOwner {
        stopped = _stop;
        emit LogEmergencyStop(owner, _stop);
    }
}
