import web3 from './web3';

const address = '0xd23f523b1fbf317b91ca37fc849e9dab3675cd34';

const abi = [
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
	}
]
export default new web3.eth.Contract(abi, address);