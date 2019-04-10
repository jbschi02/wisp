pragma solidity ^0.4.17;

contract Contract {
    string ipfsHash;
    mapping (string => string) userInfoMap;
    string w;

    function sendHash(string x) public {
        ipfsHash = x;
    }

    function getHash() public view returns (string x) {
        return ipfsHash;
    }
    
    function addToUserInfoMap(string userAddress, string userInfoIpfsHash) public {
        userInfoMap[userAddress] = userInfoIpfsHash;
    }
    
    function getUserInfoIpfsHash(string userAddress) public view returns (string hash) {
        return userInfoMap[userAddress];
    }
}