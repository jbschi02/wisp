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

  // This method is called whenever the user attempts to post a new wisp.
  onSubmit = async (event) => 
  {
    event.preventDefault();

    //bring in user's metamask account address
    const accounts = await web3.eth.getAccounts();
    console.log('Sending from Metamask account: ' + accounts[0]);

    //obtain contract address from storehash.js
    const ethAddress= await storehash.options.address;
    this.setState({ethAddress});

    // Create JSON string for new post
    const obj = 
    {
      "address": accounts[0], 
      "content": this.state.postContent,
      "timestamp": Date.now()
    };
    // post newly created JSON obj to IPFS
    await this.addJsonToIpfs(obj, accounts);

    // This code section checks to see if the owner of this ethereum address has posted to wisp before. 
    //    If so, do nothing. If it is their first post, create a new user info page on IPFS.
    storehash.methods.getUserInfoIpfsHash(accounts[0].toString()).call((error, result) => {
      if (error) {
        console.log(error);
      }
      else if (result === '') { // user has not posted before, create new user info page on IPFS.
        //add user to map
        var alias = prompt("This is your first time posting a wisp. Please enter an alias:");
        if (alias == null || alias === "") {
          alias = accounts[0].toString();
        }
        this.addUserToMap(accounts, alias);
      }
      else {
        console.log('Already in map: ', result);
      }
    });

    this.handleCloseModal(); 
  }; //onSubmit

  // This method handles changes to a text area.
  handleChange(e, field) 
  {
    this.setState(
    {
      [field]: e.target.value
    });
  }

  // This method is called whenever a new user is making a post to Wisp. The user's ethereum address is first added to a map in Contract.sol,
  //    mapping their ethereum address to a user info page on IPFS. This user info page is then created and posted.
  async addUserToMap(accounts, alias)
  {
    await storehash.methods.addToUserInfoMap(accounts[0].toString(), this.state.ipfsHash).send(
      {
        from: accounts[0]
      }, (error, transactionHash) => {
        if (error) {
          console.log(error);
        }
        else {
          this.setState({transactionHash});
          console.log('Adding to map');

          // Create JSON string
          const obj = 
          {
            "address": accounts[0], 
            "alias": alias,
            "postsPage": 'f7hewq7fh32rh93'
          };

          this.addJsonToIpfs(obj, accounts);
        } // end else
      }); // end add user to map
  } //addUserToMap

  // This method takes in a JSON obj and a list of ethereum accounts, then posts the obj to IPFS using the first account in the accounts array.
  async addJsonToIpfs(obj, accounts) {
    const stringToWrite = JSON.stringify(obj, null, '  ')
        // Add a space after every key, before the `:`:
        .replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');
    console.log(stringToWrite);
    const buffer = await Buffer.from(stringToWrite);
    this.setState({buffer});  

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

  async testIpfs() {
  	const accounts = await web3.eth.getAccounts();
  	ipfs.files.mkdir('/my/test/directory', (err, ipfsHash) => {
  		console.warn(err, ipfsHash);

  		this.setState({ipfs:ipfsHash[0].hash });
  		console.log(ipfsHash);

  		storehash.methods.sendHash(this.state.ipfsHash).send({
  			from: accounts[0]
  		}, (error, transactionHash) => {
  			this.setState({transactionHash});
  		});
  	})
  }

  async testIpfs2() {
  	ipfs.files.mkdir('/directory', (err) => {
  	if (err) {
    	console.error(err)
  	}
	})
  }


  async testIpfs3() {
  	ipfs.files.stat('/directory', (err, stats) => {
  	if (err) {
    	console.error(err)
  	}
  	console.log(stats);
	})
  }

  // This is a model for how the news feed will work. This method renders a dynamic amount of elements (Wisps).
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
                  <button onClick={this.testIpfs3} className="replyButton">
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

  // This method renders the main user interface for Wisp.
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