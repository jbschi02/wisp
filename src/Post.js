import React, { Component } from 'react';

const moment = require('moment');

class Post extends Component {
	constructor(props) {
		super(props);

		this.handleDelete = this.handleDelete.bind(this); 
		this.handleReply = this.handleReply.bind(this);
		this.handleEdit = this.handleEdit.bind(this);
	}

	handleReply() {
		this.props.replyPost();
	}

	handleDelete() {
		this.props.deletePost(this.props.id);
	}

	handleEdit() {
		this.props.editPost(this.props.content, this.props.id);
	}

	render() {
		var time = moment(this.props.timestamp).format("h:mm MM/DD/YYYY");
		return (
      <div>
        <div>
          <div className="wispPost">
            <header> 
            <div className="wispPostOwner">
            {this.props.alias}
            </div>
            </header>
            <div className="wispPostBody">
              <div className="wispPostContent">
              {this.props.content}
              </div>
              <div>
                <div>
                  <button onClick={this.handleReply} className="userActionButton">
                  Reply
                  </button>
                  <button onClick={this.handleEdit} className = "userActionButton">
                  Edit
                  </button>
                  <button onClick={this.handleDelete} className="userActionButton">
                  Delete
                  </button>
                </div>
                <div className="wispPostDate">
                {time}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
		)
	}
}
export default Post;