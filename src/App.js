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
import ManageFeedForm from './ManageFeedForm.js';

const uuidv1 = require('uuid/v1');

// An enum type that is used to determine if the current Wisp being posted is new, an edit, or a reply.
const PostTypeEmum = Object.freeze({
  NEW : 0,
  EDIT : 1,
  REPLY : 2
});

class App extends Component 
{
  constructor(props)
  {
    super(props);
    this.state = 
    {
      postContent: '',
      showModal: false,
      showManageFeedModal: false,
      userAddress: '',
      userAlias:'',
      addressToReply:'',
      newsFeedPosts: [],
      subscribed: {},
      postTypeButton: 'Send Wisp',
      postType: PostTypeEmum.NEW,
      messageId: ''
    }

    this.onSubmit = this.handleSubmit.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleSharePost = this.handleSharePost.bind(this);
    this.handleNewPost = this.handleNewPost.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.getPosts = this.getPosts.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleOpenManageFeedModal = this.handleOpenManageFeedModal.bind(this);
    this.handleCloseManageFeedModal = this.handleCloseManageFeedModal.bind(this);
  }

  // Called when page loads. Gets the user's ethereum address and stores it in state.
  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    this.setState({userAddress:accounts[0]});
    this.getPosts(this.state.userAddress);
    const results = await storehash.methods.getFeed(this.state.userAddress).call();

    this.setState({userAlias:results._userAlias});
    //this.interval = setInterval(() => this.getPosts(this.state.userAddress), 30000);
  }

  // These methods are called whenever the post wisp modal is opened. Sets the state with appropriate data.
  handleReply(id, address) {
    console.log("handling reply");
    console.log(id);
    console.log(address);

    this.setState({postTypeButton:'Reply'});
    this.setState({postType:PostTypeEmum.REPLY});
    this.setState({messageId:id});
    this.setState({addressToReply:address})
    this.handleOpenModal();
  }

  handleEdit(content, id) {
    this.setState({messageId:id})
    this.setState({postTypeButton:'Edit Post'});
    this.setState({postContent:content})
    this.setState({postType:PostTypeEmum.EDIT});
    this.handleOpenModal();
  }

  handleNewPost() {
    this.setState({postTypeButton:'Send Wisp'});
    this.setState({postType:PostTypeEmum.NEW});
    this.handleOpenModal();
  }

  // These methods handle the opening and closing of the post wisp modal.
  handleOpenModal () {
    this.setState({ showModal: true });
  }
  
  handleCloseModal () {
    this.setState({postContent:''});
    this.setState({messageId:''});
    this.setState({ showModal: false });
  }

  handleOpenManageFeedModal () {
    this.setState({ showManageFeedModal: true });
  }
  
  handleCloseManageFeedModal () {
    this.setState({ showManageFeedModal: false });
  // This method is called whenever the user attempts to post a new wisp.
  //  Checks the PostTypeEnum to determine if the new wisp is a new post, an edit, or a reply.
  }

  handleSubmit = async (event) => 
  {
    event.preventDefault();

    if (this.state.postType === PostTypeEmum.NEW) {
      await this.postNewWisp();
    }
    else if (this.state.postType === PostTypeEmum.EDIT) {
      await this.editWisp(this.state.postContent);
    }
    else if (this.state.postType === PostTypeEmum.REPLY) {
      await this.newReplyWisp(this.state.postContent);
      console.log('reply');
    }
    else {
      console.error("Unrecognized post type.");
    }

    this.handleCloseModal(); 
  };

  // Called when the user wishes to post a brand new Wisp.
  async postNewWisp() {
    // User is posting a new wisp
    // Check to see if the user currently is mapped to a directory
    const results = await storehash.methods.getFeed(this.state.userAddress).call();

    console.log("Get feeds results:");
    console.log(results._userAlias);
    var alias = results._userAlias;
    if (!alias || alias === "") {
      console.log("Making new user directory...");
      alias = prompt("This is your first time posting a wisp. Please enter an alias:");
        if (alias == null || alias === "") {
          alias = this.state.userAddress.toString();
        }
        await this.makeNewUserDirectory(this.state.userAddress, alias);
    }
    await this.addNewPostToIpfs(this.state.userAddress, this.state.postContent, alias);
  }


  // This method is called when a user is posting to Wisp for the first time.
  //  Makes a new directory containing the new user's information, posts,
  //  subscriptions, etc. Then calls addUserToFeedMap to map the user on 
  //  the blockchain.
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

  // This method is called when a user is posting to Wisp for the first time. 
  //  Calls the addUserToFeedMap method in the FeedRegister contract, maps
  //  the user's metamask account hash to a directory containing their information,
  //  posts, subscriptions, etc. 
  async addUserToFeedMap(userAlias, account) {
    console.log("Adding user to feed map:");
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

  // This method can be called whenever a new post is made.
  //	Takes in the user's account hash and the content of the post,
  //	then posts to the user's messages directory.
  async addNewPostToIpfs(account, content, alias) {
    console.log("Adding new post:");
    const id = uuidv1();

    const obj = {
      "alias": alias,
      "content": content,
      "timestamp": Date.now(),
      "id": id.toString(),
      "address": this.state.userAddress,
      "replies":[],
      "isReply":false
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
    this.getPosts(this.state.userAddress);  
  }

  // Called when a user edits an existing Wisp. Edits a post. Note that a user can only edit their own posts.
  //  This means all we need to do is look in their directory for the message.
  async editWisp(content) {
    console.log("Editing post:");
    const path = '/' + this.state.userAddress.toString() + '/messages/message' + this.state.messageId.toString() + '.txt';
    await ipfs.files.read(path, async (error, buf) => {
      var obj = JSON.parse(buf.toString('utf8'));
      obj.content = content;
      obj.timestamp = Date.now();
      const stringToWrite = JSON.stringify(obj, null, '  ').replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');
      await ipfs.files.write(path, await Buffer.from(stringToWrite));
      this.getPosts(this.state.userAddress);
    })
  }

  async newReplyWisp(content) {
    console.log('replying to post:');
    const id = uuidv1();
    const parentPath = '/' + this.state.addressToReply.toString() + '/messages/message' + this.state.messageId.toString() + '.txt';
    console.log(parentPath);
    const childPath = '/' + this.state.userAddress.toString() + '/messages/message' + id.toString() + '.txt';
    await ipfs.files.read(parentPath, async (error, buf) => {
      var obj = JSON.parse(buf.toString('utf8'));
      obj.replies.push(childPath);
      var stringToWrite = JSON.stringify(obj, null, '  ').replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');
      await ipfs.files.write(parentPath, await Buffer.from(stringToWrite));
      obj = {
        "alias": this.state.userAlias,
        "content": content,
        timestamp: Date.now(),
        "id": id.toString(),
        "address": this.state.userAddress,
        replies: [],
        "isReply": true
      };
      stringToWrite = JSON.stringify(obj, null, '  ').replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');
      await ipfs.files.write(childPath, await Buffer.from(stringToWrite), {create:true, parents: true});
      this.getPosts(this.state.userAddress);
    })
  }

  // Deletes a post. Note that a user can only delete their own posts.
  //  This means all we need to do is look in their directory for the message.
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

  async handleSharePost(content, alias) {
    await this.addNewPostToIpfs(this.state.userAddress, content, 'Reposted By ' + this.state.userAlias + ' Via '+ alias);
  }

  // This method handles changes to a text area.
  handleChange(e, field) 
  {
    this.setState(
    {
      [field]: e.target.value
    });
  }

  async getPosts(account) {
    var subscribedAccounts = [account];
    const getSubscribedResults = await this.getSubscribedAddresses(account);
    //console.log("getSubscribedResults:");
    //console.log(getSubscribedResults);
    subscribedAccounts = subscribedAccounts.concat(getSubscribedResults);

    this.setState({newsFeedPosts : []});

    subscribedAccounts.forEach((currentAccount) => {
      //console.log("Loading posts for account:");
      //console.log(currentAccount);

      const path = '/' + currentAccount.toString() + '/messages';

      ipfs.files.ls(path, { long : true }, (err, files) => {
        if (err) {
          console.log(err);
        }
        if (files) {
            files.forEach((file) => {
              ipfs.files.read(path + '/' + file.name, (err, buf) => {
                var obj = JSON.parse(buf.toString('utf8'));
                //console.log(obj);
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
        });
    });

    var postsToSort = this.state.newsFeedPosts;
    postsToSort.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    })
    this.setState({newsFeedPosts : postsToSort});
  }

  async getSubscribedAddresses(address) {
    console.log(address);
    return await storehash.methods.getSubscribed(address).call();
  }

  async subscribeToAddress(address) {
    const accounts = await web3.eth.getAccounts();
    await storehash.methods.subscribe(accounts[0], address).call();
  }

  async unsubscribeToAddress(address) {
    const accounts = await web3.eth.getAccounts();
    await storehash.methods.unsubscribe(accounts[0], address).call();
  }

  async buildSubscribedStateObjects() {
    //console.log("building subscribed state objects");
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    var subscribedAccounts = [account];
    const getSubscribedResults = await this.getSubscribedAddresses(account);
    subscribedAccounts = subscribedAccounts.concat(getSubscribedResults);    

    this.setState({subscribed : {}});

    for(var i = 0; i < subscribedAccounts.length; i++) {
      const results = await storehash.methods.getFeed(subscribedAccounts[i]).call();
      var timestamp = (new Date()).getTime();
      this.state.subscribed[results._userAlias + timestamp] = results._userAlias;
      this.setState({subscribed : this.state.subscribed})
    }
  }

  // This method renders the newsfeed. Maps each post to a Post.js object.
  renderWisps() {
    return this.state.newsFeedPosts.map((post, id) => {
      return <Post post={post} key={id} userAddress={this.state.userAddress} deletePost={this.deletePost} replyPost={this.handleReply} editPost={this.handleEdit} sharePost={this.handleSharePost}/>
    })
  }

  async componentWillMount() {
    this.handleCloseModal();
    const accounts = await web3.eth.getAccounts();
    await this.buildSubscribedStateObjects();
    await this.getPosts(accounts[0]);
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
         <button onClick={() => this.handleNewPost()} className="postWispButton">
         Post New Wisp
         </button>
         <button onClick={this.handleOpenManageFeedModal} className="manageFeedButton">
         Manage Feed
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
            {this.state.postTypeButton}
        </Button>
        <button onClick={this.handleCloseModal} className="closeModalButton">
          Close
        </button>
      </Form>
      </Container>
      </Modal>
      <Modal
        isOpen={this.state.showManageFeedModal}
        contentLabel="ManageFeedModal"
        ariaHideApp={false}
      >
      <Container>
        <h3 className="App-header">Manage Feed</h3>
        <ManageFeedForm subscribed={this.state.subscribed} account={this.state.userAddress}/>
        <button onClick={this.handleCloseManageFeedModal} className="closeModalButton">
          Cancel
        </button>
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