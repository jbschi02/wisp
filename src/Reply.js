import React, { Component } from 'react';

const moment = require('moment');

class Reply extends Component {

	render() {
		var time = moment(this.props.post.timestamp).format("h:mm MM/DD/YYYY");
		return (
          <div className="wispReply">
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
		)
	}
}
export default Reply;