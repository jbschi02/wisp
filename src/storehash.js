import web3 from './web3';

const address = '0xa4b00d82c71e5854294249c7181e03edb8934ae1';

const abi = [
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "userAddressToFeedMapping",
		"outputs": [
			{
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"name": "userAlias",
				"type": "string"
			},
			{
				"name": "dateLastModified",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "getFeed",
		"outputs": [
			{
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"name": "_userAlias",
				"type": "string"
			},
			{
				"name": "_dateLastModified",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"name": "_userAlias",
				"type": "string"
			}
		],
		"name": "addUserToFeedMap",
		"outputs": [
			{
				"name": "_success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "userAddress",
				"type": "string"
			},
			{
				"name": "userInfoIpfsHash",
				"type": "string"
			}
		],
		"name": "addToUserInfoMap",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"name": "_userAlias",
				"type": "string"
			}
		],
		"name": "updateFeed",
		"outputs": [
			{
				"name": "_success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "userAddress",
				"type": "string"
			}
		],
		"name": "getUserInfoIpfsHash",
		"outputs": [
			{
				"name": "hash",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getHash",
		"outputs": [
			{
				"name": "x",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "x",
				"type": "string"
			}
		],
		"name": "sendHash",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
export default new web3.eth.Contract(abi, address);