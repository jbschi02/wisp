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
      ipfsHash:'',
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
    this.setState({postContent:''})
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
      "address": accounts[0], 
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
      console.log(ipfsHash);
      // call Ethereum contract method "sendHash" and send IPFS hash to etheruem contract 
      //return the transaction hash from the ethereum contract

      storehash.methods.sendHash(this.state.ipfsHash).send(
      {
        from: accounts[0] 
      }, (error, transactionHash) => 
      {
        this.setState({transactionHash});
      }); //storehash 
    }) //await ipfs.add

    storehash.methods.getUserInfoIpfsHash(accounts[0].toString()).call((error, result) => {
      if (error) {
        console.log(error);
      }
      else if (result === '') {
        //add user to map
        this.addUserToMap(accounts);
      }
      else {
        console.log('Already in map: ', result);
      }
    });
    this.handleCloseModal(); 
  }; //onSubmit

  handleChange(e, field) 
  {
    this.setState(
    {
      [field]: e.target.value
    });
  }

  async addUserToMap(accounts)
  {
    // Create JSON string
    const obj = 
    {
      "address": accounts[0], 
      "alias": "sampleAlias",
      "postsPage": 'f7hewq7fh32rh93'
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
      console.log(ipfsHash);
      // call Ethereum contract method "sendHash" and send IPFS hash to etheruem contract 
      //return the transaction hash from the ethereum contract

      storehash.methods.sendHash(this.state.ipfsHash).send(
      {
        from: accounts[0] 
      }, (error, transactionHash) => 
      {
        this.setState({transactionHash});
      }); //storehash 
    }) //await ipfs.add

    await storehash.methods.addToUserInfoMap(accounts[0].toString(), this.state.ipfsHash).send(
      {
        from: accounts[0]
      }, (error, result) => {
        if (error) {
          console.log(error);
        }
        else {
          console.log('Adding to map');
          //save document to IPFS,return its hash#, and set hash# to state
          //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
          ipfs.add(this.state.buffer, (err, ipfsHash) => {
            console.warn(err,ipfsHash);
            //setState by setting ipfsHash to ipfsHash[0].hash 
            this.setState({ ipfsHash:ipfsHash[0].hash });
            console.log(ipfsHash);
            // call Ethereum contract method "sendHash" and send IPFS hash to etheruem contract 
            //return the transaction hash from the ethereum contract

            storehash.methods.sendHash(this.state.ipfsHash).send({
              from: accounts[0] 
            }, (error, transactionHash) => {
              this.setState({transactionHash});
              }); //storehash 
          }) //await ipfs.add
        }
      });
  } //addUserToMap

  renderWisps() {
    var elements = [];
    for (var i = 0; i < 10; i++)
    {
      elements.push(
      <div key={i}>
        <div>
          <div className="wispPost">
            <header> 
            <div className="wispPostOwner">
            John Schieman
            </div>
            </header>
            <div className="wispPostBody">
              <div className="wispPostContent">
              Sample Wisp
              </div>
              <div>
                <div>
                  <button onClick={this.handleOpenModal} className="replyButton">
                  Reply
                  </button>
                </div>
                <div className="wispPostDate">
                4/8/2019
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )
    }
    return elements;
  }

  render() 
  {
    return (
    <div>
      <div className="App">
      <header className="App-header"> 
         <div className="main">
         <h1>Wisp</h1>
         <button onClick={this.handleOpenModal} className="postWispButton">
         Post New Wisp
         </button>
         </div>
      </header>
      <Modal
        isOpen={this.state.showModal}
        contentLabel="PostWispModal"
        ariaHideApp={false}
      >
      <Container>
        <h3 className="App-header">Post Wisp</h3>
        <Form onSubmit={this.onSubmit}>
        <textarea
            value = {this.state.postContent}
            onChange = {e => this.handleChange(e, "postContent")}
        />
        <Button
            className="postWispButtonModal"
            type="submit"> 
            Send Wisp
        </Button>
        <button onClick={this.handleCloseModal} className="closeModalButton">
          Cancel
        </button>
      </Form>
      </Container>
      </Modal>
      </div>
      
      <div>
        {this.renderWisps()}
      </div>
    </div>
    );
  } //render
} //App
export default App;