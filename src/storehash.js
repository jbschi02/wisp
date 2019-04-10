import web3 from './web3';

//access our local copy to contract deployed on rinkeby testnet


const address = '0xde1fa252484ebf58c09e1d995e17cbe536b9b63b';

const abi = [
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
				"name": "x",
				"type": "string"
			}
		],
		"name": "sendHash",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
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
	}
]
export default new web3.eth.Contract(abi, address);