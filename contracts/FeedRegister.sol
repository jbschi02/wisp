pragma solidity ^0.5.7;

contract FeedRegister {

    struct Feed {
        string userAlias;
        uint256 dateLastModified;
    }

    mapping (address => Feed) public userAddressToFeedMapping;
    mapping (address => address[]) public userAddressToSubscribedAddressesMapping;
    mapping (string => address) public userAliasToAddressMapping;

    event FeedUpdatedOrAdded(
        address _userAddress,
        string _userAlias,
        uint256 _dateLastModified
    );
    
    event GetAddressEvent(
        string _userAlias,
        bytes32 _userBytes,
        address _userAddress
    );

    function() external {}

    function addOrUpdateFeed(
        string memory _userAlias
    ) public {
        require(bytes(_userAlias).length > 0 && bytes(_userAlias).length <= 256);

        Feed storage feed = userAddressToFeedMapping[msg.sender];
        
        feed.userAlias = _userAlias;
        feed.dateLastModified = now;
        
        userAliasToAddressMapping[_userAlias] = msg.sender;

        emit FeedUpdatedOrAdded(
            msg.sender,
            feed.userAlias,
            feed.dateLastModified
        );
    }

    function getFeed(address _userAddress) public view
    returns (
        string memory _userAlias,
        uint256 _dateLastModified
    ) {
        Feed memory feed = userAddressToFeedMapping[_userAddress];
        
        return (
            feed.userAlias,
            feed.dateLastModified
        );
    }

    function getAddress (string memory _userAlias) 
    public view returns (
        address _address
    ) {
        return userAliasToAddressMapping[_userAlias];
    }

    function subscribe(
        address _subscriber,
        address _subscribed
    ) public {
        address[] storage subscribed = userAddressToSubscribedAddressesMapping[_subscriber];
        subscribed.push(_subscribed);
        userAddressToSubscribedAddressesMapping[_subscribed] = subscribed;
    }

    function unsubscribe(
        address _subscriber,
        address _subscribed
    ) public {
        address[] storage subscribedAddresses = userAddressToSubscribedAddressesMapping[_subscriber];
        uint deletedIndex = 0;
        bool deleted = false;
        for (uint i = deletedIndex; i < subscribedAddresses.length-1; i++){
            if (subscribedAddresses[i] == _subscribed)
            {
                deletedIndex = i;
                delete subscribedAddresses[i];
                deleted = true;
            }
        }

        if (deleted)
        {
            for (uint j = deletedIndex; j < subscribedAddresses.length-1; j++){
                subscribedAddresses[j] = subscribedAddresses[j+1]; 
            }
        }
        subscribedAddresses.length--;
    }

    function getSubscribed(
        address _subscriber
    ) public view returns (
        address[] memory _subscribedAddresses
    ) {
        return userAddressToSubscribedAddressesMapping[_subscriber];
    }
}