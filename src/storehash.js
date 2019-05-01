import web3 from './web3';

const address = '0xbd3e2c0daafbb4328d5402668a9646e08d2fbacc';

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
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"name": "userAliasToAddressMapping",
		"outputs": [
			{
				"name": "",
				"type": "address"
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
				"name": "_userAlias",
				"type": "string"
			}
		],
		"name": "addOrUpdateFeed",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_subscriber",
				"type": "address"
			},
			{
				"name": "_subscribed",
				"type": "address"
			}
		],
		"name": "subscribe",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_subscriber",
				"type": "address"
			}
		],
		"name": "getSubscribed",
		"outputs": [
			{
				"name": "_subscribedAddresses",
				"type": "address[]"
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
				"name": "_userAlias",
				"type": "string"
			}
		],
		"name": "getAddress",
		"outputs": [
			{
				"name": "_address",
				"type": "address"
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
				"name": "_subscriber",
				"type": "address"
			},
			{
				"name": "_subscribed",
				"type": "address"
			}
		],
		"name": "unsubscribe",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userAddressToSubscribedAddressesMapping",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_userAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_userAlias",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "_dateLastModified",
				"type": "uint256"
			}
		],
		"name": "FeedUpdatedOrAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_userAlias",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "_userBytes",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "GetAddressEvent",
		"type": "event"
	}
]
export default new web3.eth.Contract(abi, address);