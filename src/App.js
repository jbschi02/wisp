import React, { Component } from 'react';
import Modal from 'react-modal';
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';
import {Container} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import Post from './Post.js';

const uuidv1 = require('uuid/v1');

class App extends Component 
{
  constructor(props)
  {
    super(props);
    this.state = 
    {
      postContent: '',
      showModal: false,
      userAddress: '',
      newsFeedPosts: [],
    }

    this.onSubmit = this.handleSubmit.bind(this);
    this.deletePost = this.deletePost.bind(this);
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
  async addNewPostToIpfs(account, content, alias) {
    console.log("Adding new post:");
  	// TODO: Will we need a unique file name for each post? Or will ipfs.files.write()
  	//	work better here?
    const id = uuidv1();

    const obj = {
      "alias": alias,
      "content": content,
      "timestamp": Date.now(),
      "id": id.toString()
    };

  	const path = '/' + account.toString() + '/messages/message' + id.toString() + '.txt';
  	console.log("Adding new post to " + path);
    const stringToWrite = JSON.stringify(obj, null, '  ')
        // Add a space after every key, before the `:`:
        .replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');
  	const file = [
  	{
  		path: path,
  		content: await Buffer.from(stringToWrite)
  	}];
  	await ipfs.files.write(file[0].path, file[0].content, {create: true, parents: true});  
  }

  deletePost(postId) {
    const path = '/' + this.state.userAddress.toString() + '/messages/message' + postId.toString() + '.txt';
    console.log(path);
    ipfs.files.rm(path, (err) => {
      if (err) {
        console.error(err);
      }
      else {
        this.getPosts(this.state.userAddress);
      }
    })
  }

  // This method is called when a user is posting to Wisp for the first time. 
  //	Calls the addUserToFeedMap method in the FeedRegister contract, maps
  //	the user's metamask account hash to a directory containing their information,
  //	posts, subscriptions, etc. 
  async addUserToFeedMap(userAlias, account) {
    console.log("Adding user to feed map:");
  	// TODO: We really need to wait for the ethereum transaction to be mined before continuing
  	//	after this method. Quick Google doesn't give me any answers on how to do this.
  	//	For the time being, wait for the transaction to be confirmed by Metamask before making a 
  	//	second post.
    console.log("send from:");
    console.log(account);
  	await storehash.methods.addOrUpdateFeed(userAlias).send({
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
    console.log("Making new user directory.")

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
    console.log(file);
  	await ipfs.files.write(file[0].path, file[0].content, {create: true, parents: true});
  	this.addUserToFeedMap(alias, account);
  }

  // This method is called whenever the user attempts to post a new wisp.
  handleSubmit = async (event) => 
  {
  	event.preventDefault();
  	const accounts = await web3.eth.getAccounts();

    //this.props.onSubmit

  	// User is posting a new wisp
    console.log("calling getFeed");
    console.log(accounts[0]);
  	// 1) Check to see if the user currently is mapped to a directory
  	const results = await storehash.methods.getFeed(accounts[0]).call();

    console.log("Get feeds results:");
    console.log(results._userAlias);
    var alias = results._userAlias;
  	if (!alias || alias === "") {
      console.log("Making new user directory...");
  		alias = prompt("This is your first time posting a wisp. Please enter an alias:");
        if (alias == null || alias === "") {
         	alias = accounts[0].toString();
        }
        await this.makeNewUserDirectory(accounts[0], alias);
  	}
  	// 4) Add file to IPFS
  	await this.addNewPostToIpfs(accounts[0], this.state.postContent, alias);
    this.getPosts(accounts[0]);
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

  getPosts(account) {
    const path = '/' + account.toString() + '/messages';
    //ipfs.files.rm(path, {recursive:true});
    this.setState({newsFeedPosts : []});
    ipfs.files.ls(path, { long : true }, (err, files) => {
      if (err) {
        console.log(err);
      }
      if (files) {
          files.forEach((file) => {
            ipfs.files.read(path + '/' + file.name, (err, buf) => {
              var obj = JSON.parse(buf.toString('utf8'));
              console.log(obj);
              this.setState({
                newsFeedPosts: this.state.newsFeedPosts.concat([obj])
              });
              var postsToSort = this.state.newsFeedPosts;
              postsToSort.sort((a, b) => {
                  return new Date(b.timestamp) - new Date(a.timestamp);
              })
              this.setState({newsFeedPosts : postsToSort});
        })
      })
      }
      })
  }

  // This is a model for how the news feed will work. This method renders a dynamic amount of elements (Wisps).
  renderWisps() {
    return this.state.newsFeedPosts.map((post, id) => {
      return <Post id={post.id} alias={post.alias} content={post.content} timestamp={post.timestamp} key={id} deletePost={this.deletePost} replyButtonClicked={this.handleOpenModal}/>
    })
  }

  async componentWillMount() {
    this.handleCloseModal();
    const accounts = await web3.eth.getAccounts();
    this.getPosts(accounts[0]);
    this.setState({userAddress:accounts[0]});
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