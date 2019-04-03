import React, { Component } from 'react';
import Modal from 'react-modal';
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';
import {Container} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import {Form} from 'react-bootstrap';

class App extends Component 
{
  constructor()
  {
    super();
    this.state = 
    {
      ipfsHash:'Post Wisp',
      buffer:'',
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: '',
      postContent: '',
      showModal: false
    }

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal () {
    this.setState({ showModal: true });
  }
  
  handleCloseModal () {
    this.setState({ showModal: false });
  }

  onSubmit = async (event) => 
  {
    event.preventDefault();
    //bring in user's metamask account address
    const accounts = await web3.eth.getAccounts();
     
    console.log('Sending from Metamask account: ' + accounts[0]);
    //obtain contract address from storehash.js
    const ethAddress= await storehash.options.address;
    this.setState({ethAddress});

    // Create JSON string
    const obj = 
    {
      "owner":"newOwner", 
      "content": this.state.postContent,
      "timestamp": Date.now()
    };
    const stringToWrite = JSON.stringify(obj, null, '  ')
        // Add a space after every key, before the `:`:
        .replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');
    console.log(stringToWrite);
    const buffer = await Buffer.from(stringToWrite);
    this.setState({buffer});

    //save document to IPFS,return its hash#, and set hash# to state
    //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
    await ipfs.add(this.state.buffer, (err, ipfsHash) => 
    {
      console.warn(err,ipfsHash);
      //setState by setting ipfsHash to ipfsHash[0].hash 
      this.setState({ ipfsHash:ipfsHash[0].hash });
      // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
      //return the transaction hash from the ethereum contract
      //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send

      storehash.methods.sendHash(this.state.ipfsHash).send(
      {
        from: accounts[0] 
      }, (error, transactionHash) => 
      {
        console.log(transactionHash);
        this.setState({transactionHash});
      }); //storehash 
    }) //await ipfs.add 
  }; //onSubmit

  handleChange(e, field) 
  {
    console.log('hello');
    this.setState(
    {
      [field]: e.target.value
    });
  }

  render() 
  {
    return (
    <div className="App">
    <header className="App-header">
       <h1>Wisp</h1>
    </header>
     <hr />
     <Container>
      <h3>Post Wisp</h3>
      <Form onSubmit={this.onSubmit}>
      <textarea
          value = {this.state.postContent}
          onChange = {e => this.handleChange(e, "postContent")}
      />
      <Button 
          bsStyle="primary" 
          type="submit"> 
          Send Wisp
      </Button>
    </Form>
    <hr/>
    </Container>
    <button onClick={this.handleOpenModal}>
      Trigger Modal
    </button>
    <Modal
      isOpen={this.state.showModal}
      contentLabel="Minimal Modal Example"
    >
    <button onClick={this.handleCloseModal}>
      Close Modal
    </button>
    </Modal>
    </div>
      );
  } //render
} //App
export default App;