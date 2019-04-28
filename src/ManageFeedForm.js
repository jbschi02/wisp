import './App.css';
import React, { Component } from 'react';
import storehash from './storehash';

class ManageFeedForm extends Component {
  constructor(props)
  {
    super(props);
    this.state = 
    {
      subscribed: this.props.subscribed
    }
  }

  render () {
    return (
      <div className="component-wrapper">
        <SubscribedList subscribed={this.state.subscribed} />
        <AddSubscribedForm addSubscribed={this.addSubscribed.bind(this)} />
      </div>
    );
  }

  async addSubscribed (subscribed) {
    console.log("subscribed");
    const subscribedAddress = await storehash.methods.getAddress(subscribed).call();

    console.log("subscribed Address:");
    console.log(subscribedAddress);
    if (subscribedAddress)
    {
      var timestamp = (new Date()).getTime();
      this.state.subscribed[subscribed + timestamp] = subscribed;
      this.setState({ subscribed : this.state.subscribed});
      
      await storehash.methods.subscribe(this.props.account, subscribedAddress).send({
           from: this.props.account
         }, (error, transactionHash) => {
           if (error) {
             console.log(error);
           }
         });
    }
  }
}

class SubscribedList extends Component {
  render () {
    return (
      <div className="container">
        <ul className="list-group text-center">
          {
            Object.keys(this.props.subscribed).map(function(key) {
              console.log('key:');
              console.log(key);
              return <li className="list-group-item list-group-item-info">{this.props.subscribed[key]}</li>
            }.bind(this))
          }
        </ul>
      </div>
    );
  }
}

class AddSubscribedForm extends Component {
  createSubscribed (e) {
    e.preventDefault();
    var subscribed = this.refs.subscribedName.value;

    if (typeof subscribed === 'string' && subscribed.length > 0)
    {
      this.props.addSubscribed(subscribed);
      this.refs.subscribedForm.reset();
    }
  }

  render () {
    return (
      <form className="form-inline" ref="subscribedForm" onSubmit={this.createSubscribed.bind(this)}>
      <div className="form-group">
        <label for="subscribedItem">
          Subscribe To:
          <input type="text" id="subscribedItem" placeholder="e.x.lemmon" ref="subscribedName" className="form-control" />
        </label>
      </div>
      <button type="submit" className="postWispButtonModal">Add</button>
     </form>
    );
  }
}

export default ManageFeedForm;