pragma solidity ^0.4.24;

contract ImageRegister {

    struct Feed {
        string ipfsHash;
        string userAlias;
        uint256 dateLastModified;
    }

    mapping (address => Feed) public userAddressToFeedMapping;

    event FeedUpdatedOrAdded(
        address _userAddress, 
        string _ipfsHash, 
        string _userAlias,
        uint256 _dateLastModified
    );

    function() public {}

    function addOrUpdateFeed(
        string _ipfsHash, 
        string _userAlias
    ){
            
        require(bytes(_ipfsHash).length == 46);
        require(bytes(_userAlias).length > 0 && bytes(_userAlias).length <= 256);

        uint256 dateLastModified = now;
        Feed memory feed = Feed(
            _ipfsHash,
            _userAlias,
            dateLastModified
        );

        userAddressToFeedMapping[msg.sender] = feed;

        emit FeedUpdatedOrAdded(
            msg.sender,
            _ipfsHash,
            _userAlias,
            dateLastModified
        );
    }

    function getFeed(address _userAddress) 
    returns (
        string _ipfsHash, 
        string _userAlias,
        uint256 _dateLastModified
    ) {

        require(_userAddress != 0x0);

        Feed storage feed = userAddressToFeedMapping[_userAddress];
        
        return (
            feed.ipfsHash,
            feed.userAlias,
            feed.dateLastModified
        );
    }
}
