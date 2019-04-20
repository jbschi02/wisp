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
      showModal: false,
      userDirectoryHash: ''
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

  async addNewPostToIpfs(account, content, timestamp) {
  	const obj = {
  		"address": account,
  		"content": content,
  		"timestamp": timestamp
  	};
    const stringToWrite = JSON.stringify(obj, null, '  ')
        // Add a space after every key, before the `:`:
        .replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');
  	const file = [
  	{
  		path: '/directory/hello_world.txt',
  		content: await Buffer.from(stringToWrite)
  	}];
  	console.log(await ipfs.add(file));
  }

  async addUserToFeedMap(ipfsHash, userAlias, account) {
  	console.log(ipfsHash);
  	await storehash.methods.addUserToFeedMap(ipfsHash, userAlias).send({
  		from: account
  	}, (error, transactionHash) => {
  		if (error) {
  			console.log(error);
  		}
  		else {
  			console.log("Adding " + userAlias + " to feed map");
  		}
  	})
  }

  async makeNewUserDirectory(account, alias) {
  	const accountString = "/" + account.toString() + "2";
  	console.log(accountString)
  	ipfs.files.mkdir(accountString, (err) => {
  		if (err) {
    		console.error(err)
  		}
  		console.log("make dir");
	})
	ipfs.files.stat(accountString, (err, stats) => {
		if (err) {
			console.log(err);
		}
		console.log(stats.hash);
		this.addUserToFeedMap(stats.hash, alias, account);
	})
  }

  // This method is called whenever the user attempts to post a new wisp.
  onSubmit = async (event) => 
  {
  	event.preventDefault();
  	const accounts = await web3.eth.getAccounts();

  	// User is posting a new wisp

  	// 1) Check to see if the user currently is mapped to a directory
  	await storehash.methods.getFeed(accounts[0]).call( async (error, result) => {
  		if (error) {
  			console.log(error);
  		}
       	// 2) If not, update the map
  		else if (result._ipfsHash === '') {
        	var alias = prompt("This is your first time posting a wisp. Please enter an alias:");
        	if (alias == null || alias === "") {
          		alias = accounts[0].toString();
        	}
        	this.makeNewUserDirectory(accounts[0], alias);
  		}
  		else {
  			this.userDirectoryHash = result._ipfsHash;
  		}
  		console.log(this.userDirectoryHash);
  	})
  	// 3) Get user info from map
  	// 4) Add file to IPFS
  	//this.addNewPostToIpfs(accounts[0], this.state.postContent, Date.now());
  	// 5) Add file to existing user directory and update directory hash
  	// 6) Notify listeners that a feed has been updated

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

  async testIpfs2() {
  	var dirName = "/testdirectoryxyz";
  	ipfs.files.mkdir(dirName, (err, stats) => {
  		if (err) {
  			console.error(err);
  		}
  		else console.log("success");
  	})
  }

  async testIpfs3() {
  	var dirName = "/testdirectoryxyz";
  	ipfs.files.stat(dirName, (err, stats) => {
  	if (err) {
    	console.error(err);
  	}
  	console.log(stats);
	})
  }

  async testIpfs4() {
  	const file = [
  	{
  		path: '/directory/hello_world.txt',
  		content: await Buffer.from("hello world")
  	}];
  	console.log(await ipfs.add(file));
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