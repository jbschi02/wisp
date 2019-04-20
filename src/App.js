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

  // This method can be called whenever a new post is made.
  //	Takes in the user's account hash and the content of the post,
  //	then posts to the user's messages directory.
  async addNewPostToIpfs(account, content) {
  	const obj = {
  		"address": account,
  		"content": content,
  		"timestamp": Date.now()
  	};
  	// TODO: Will we need a unique file name for each post? Or will ipfs.files.write()
  	//	work better here?
  	const path = account.toString() + "/messages/newPost.txt";
  	console.log("Adding new post to " + path);
    const stringToWrite = JSON.stringify(obj, null, '  ')
        // Add a space after every key, before the `:`:
        .replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');
  	const file = [
  	{
  		path: path,
  		content: await Buffer.from(stringToWrite)
  	}];
  	await ipfs.add(file);
  }

  // This method is called when a user is posting to Wisp for the first time. 
  //	Calls the addUserToFeedMap method in the FeedRegister contract, maps
  //	the user's metamask account hash to a directory containing their information,
  //	posts, subscriptions, etc. 
  async addUserToFeedMap(ipfsHash, userAlias, account) {
  	// TODO: We really need to wait for the ethereum transaction to be mined before continuing
  	//	after this method. Quick Google doesn't give me any answers on how to do this.
  	//	For the time being, wait for the transaction to be confirmed by Metamask before making a 
  	//	second post.
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

  // This method is called when a user is posting to Wisp for the first time.
  //	Makes a new directory containing the new user's information, posts,
  //	subscriptions, etc. Then calls addUserToFeedMap to map the user on 
  //	the blockchain.
  async makeNewUserDirectory(account, alias) {
  	const path = "/" + account.toString() + "/accountdetails.txt";
  	const obj = {
  		"address": account,
  		"alias": alias,
  	};
    const stringToWrite = JSON.stringify(obj, null, '  ')
        // Add a space after every key, before the `:`:
        .replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');
  	const file = [
  	{
  		path: path,
  		content: await Buffer.from(stringToWrite)
  	}];
  	const results = await ipfs.add(file);
  	console.log("....")
  	this.addUserToFeedMap(results[1].hash, alias, account);
  }

  // This method is called whenever the user attempts to post a new wisp.
  onSubmit = async (event) => 
  {
  	event.preventDefault();
  	const accounts = await web3.eth.getAccounts();

  	// User is posting a new wisp

  	// 1) Check to see if the user currently is mapped to a directory
  	const results = await storehash.methods.getFeed(accounts[0]).call();
  	if (results._ipfsHash === "") {
  		var alias = prompt("This is your first time posting a wisp. Please enter an alias:");
        if (alias == null || alias === "") {
         	alias = accounts[0].toString();
        }
        await this.makeNewUserDirectory(accounts[0], alias);
  	}
  	else {
  		this.userDirectoryHash = results._ipfsHash;
  	}
  	// 3) Get user info from map
  	// 4) Add file to IPFS
  	await this.addNewPostToIpfs(accounts[0], this.state.postContent);
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