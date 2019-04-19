//const IPFS = require('ipfs-http-client');
//const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('localhost', '5001', { protocol: 'http' }); // leaving out the arguments will default to these values 


export default ipfs;