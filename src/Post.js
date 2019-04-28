import React, { Component } from 'react';
import ipfs from './ipfs';
import {Container} from 'react-bootstrap';
import {Form} from 'react-bootstrap';
import Modal from 'react-modal';
import Reply from './Reply.js'

const moment = require('moment');

class Post extends Component {
	constructor(props) {
		super(props);

	    this.state = 
	    {
	      showModal: false,
	      replies:[]
	    }

		this.handleDelete = this.handleDelete.bind(this); 
		this.handleReply = this.handleReply.bind(this);
		this.handleEdit = this.handleEdit.bind(this);
		this.openRepliesModal = this.openRepliesModal.bind(this);
    this.handleSharePost = this.handleSharePost.bind(this);
	}

  async componentDidMount() {

  }

  // These methods handle the opening and closing of the post wisp modal.
  openRepliesModal () {
  	this.setState({ showModal: true });
  	this.props.post.replies.forEach((reply) => {
  		ipfs.files.read(reply, (err, buf) => {
  			var obj = JSON.parse(buf.toString('utf8'));
  			this.setState({replies: this.state.replies.concat([obj])});
  		})
  	})
  }
  
  closeRepliesModal () {
    this.setState({ showModal: false });
  }

	handleReply() {
		this.props.replyPost(this.props.post.id, this.props.post.address);
	}

	handleDelete() {
		this.props.deletePost(this.props.post.id);
	}

	handleEdit() {
		this.props.editPost(this.props.post.content, this.props.post.id);
	}

  handleSharePost() {
    this.props.sharePost(this.props.post.content, this.props.post.alias);
  }

 	getReplies() {
 		return this.state.replies.map((post, id) => {
 			return <Reply post = {post} key = {id}/>
 		})
 	}

 	getEditButton() {
 		if (this.props.userAddress === this.props.post.address) {
 			return <button onClick={this.handleEdit} className="userActionButton">Edit</button>
 		}
 	}

 	getDeleteButton() {
 		if (this.props.userAddress === this.props.post.address) {
 			return <button onClick={this.handleDelete} className="userActionButton">Delete</button>
 		}
 	}

	render() {
		var time = moment(this.props.post.timestamp).format("h:mm MM/DD/YYYY");
		if (this.props.post.isReply) {
			return <div></div>
		}
		return (
      <div>
        <div>
          <div className="wispPost">
            <header> 
            <div className="wispPostOwner">
            {this.props.post.alias}
            </div>
            </header>
            <div className="wispPostBody">
              <div className="wispPostContent">
              {this.props.post.content}
              </div>
              <div>
                <div>
                  <button onClick={this.handleReply} className="userActionButton">
                  Reply
                  </button>
                  {this.getEditButton()}
                  {this.getDeleteButton()}
                  <button onClick={this.openRepliesModal} className="viewRepliesButton">
                  View Replies
                  </button>
                  <button onClick={this.handleSharePost} className="sharePostButton">
                  Share
                  </button>
                </div>
                <div className="wispPostDate">
                {time}
                </div>
              </div>
            </div>
          </div>
          <div>
	      <Modal
	        isOpen={this.state.showModal}
	        contentLabel="PostWispModal"
	        ariaHideApp={false}
	      >
	      <Container>
	        <h3 className="App-header">Wisp</h3>
	        <Form onSubmit={this.onSubmit}>
          <div className="wispPost">
            <header> 
            <div className="wispPostOwner">
            {this.props.post.alias}
            </div>
            </header>
            <div className="wispPostBody">
              <div className="wispPostContent">
              {this.props.post.content}
              </div>
              <div>
                <div className="wispPostDate">
                {time}
                </div>
              </div>
            </div>
          </div>
          <div>
          		{this.getReplies()}
          </div>
	        <button onClick={this.handleCloseModal} className="closeModalButton">
	          Cancel
	        </button>
	      </Form>
	      </Container>
	      </Modal>
	          </div>
	        </div>
	      </div>
		)
	}
}
export default Post;