import React, { Component } from 'react'
import {connect} from "react-redux";
import TestEventHandling from '../build/contracts/TestEventHandling.json'
import getWeb3 from './utils/getWeb3'


import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import EventList from './Components/EventList'
import LoggerSwitch from './Components/LoggerSwitch'
import {toggleLog} from './Components/LoggerSwitch/actions';
import {addEvent} from './Components/EventList/actions'

// const hello = () => ({welcome: 'hello'})
// const store = createStore(hello)
// console.log(store.getState(), 'store')

class App extends Component {
  constructor(props) {
    super(props)
    this.toggleLogging = this.toggleLogging.bind(this);
    this.triggerEvent = this.triggerEvent.bind(this);

    this.state = {
      web3: null,
      contract: null,
      eventsByTopic: null
    };
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      });

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

 /**
  * Logger visibility,
  * add/remove eth.filter to watch for mined TX.
  *
  * This is the ServerSided part, to be implemented in PHP.
  */
  toggleLogging (e) {
    const isLogging = e.currentTarget.checked;
    this.props.toggleLog(isLogging);
    if (isLogging) {
      // ADD filter
      // This is only in Web3 >1.x. Before it was filter
      if (!this.state.web3.eth.filter) {
        throw new Error('Currently only supporting Web3 < 1.0 due to https://github.com/MetaMask/metamask-extension/issues/2350.')
      }

      const currentFilter = this.state.web3.eth.filter({
        address: this.state.contract.address,
        type: 'mined'
      }, (error, event) => {
        if (error) {
          console.log('ERROR at filter')
        }
        else {
          event = this.decodeParams(event);
          console.log(event, 'event with values @currentSubscription')
          this.props.addEvent(event)
        }

      });
      this.setState({
        currentFilter: currentFilter
      });
    }
    else {
      // REMOVE filter (if there is one)
      if (this.state.currentFilter) {
        this.state.currentFilter.stopWatching();
        this.setState({
          currentFilter: null
        });
      }
    }
  }


  getEventDefinitionByTopic(topic) {
    return this.state.eventsByTopic.filter((e) => (e.topic === topic))[0];
  }

  decodeParams(event) {
    const abi = this.getEventDefinitionByTopic(event.topics[0]);

    event.name = abi.name;
    event.topic = abi.topic;
    event.inputs = abi.inputs;
    let topics = 1; // event.topics[0] = event.topic
    abi.inputs.forEach((param, i) => {
      if(param.indexed === true) {
        // Value in event.topics
        event.inputs[i].value = event.topics[topics];
        topics++;
      }
      else {
        // Value in event.data
        // TODO Actually we need to decode the remaining non-indexed ABI!

        const abiDecoder = require('abi-decoder');

        abiDecoder.addABI(this.state.contract.abi);
        console.log(abiDecoder.decodeMethod(event.data),'decodeMethod instance')
        // const testABI = [{"inputs": [{"type": "address", "name": ""}], "constant": true, "name": "isInstantiation", "payable": false, "outputs": [{"type": "bool", "name": ""}], "type": "function"}, {"inputs": [{"type": "address[]", "name": "_owners"}, {"type": "uint256", "name": "_required"}, {"type": "uint256", "name": "_dailyLimit"}], "constant": false, "name": "create", "payable": false, "outputs": [{"type": "address", "name": "wallet"}], "type": "function"}, {"inputs": [{"type": "address", "name": ""}, {"type": "uint256", "name": ""}], "constant": true, "name": "instantiations", "payable": false, "outputs": [{"type": "address", "name": ""}], "type": "function"}, {"inputs": [{"type": "address", "name": "creator"}], "constant": true, "name": "getInstantiationCount", "payable": false, "outputs": [{"type": "uint256", "name": ""}], "type": "function"}, {"inputs": [{"indexed": false, "type": "address", "name": "sender"}, {"indexed": false, "type": "address", "name": "instantiation"}], "type": "event", "name": "ContractInstantiation", "anonymous": false}];
        // abiDecoder.addABI(testABI);
        const testData = "0x53d9d9100000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114de5000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114daa";
        console.log(abiDecoder.decodeMethod(testData), 'abiDecoder.decodeMethod(testData)')

        // ([types array], encodedData)
        event.inputs[i].value = event.data;
      }
    });
    return event;
  }

  /**
   * Manually create a function signature and derived topic hash
   *
   * @param abi
   * @returns {Array}
   */
  createEventsByTopic(abi){
    let topics = [];
    const events = abi.filter((i) => (i.type.toString() === 'event'));

    // Building topics array where index is the topic-hash returned by the filter.
    events.forEach((i) => {
      let signature = i.name + '(';
      i.inputs.forEach((param, ind)=>{
        signature += param.type;
        if(i.inputs.length === ind + 1) {
          signature += ')'
        }
        else {
          signature += ','
        }
      });
      i.signature = signature;
      // topic is the Ethereum Sha3 fo the signature.
      i.topic = this.state.web3.sha3(signature);
      topics.push(i);
    });
    console.log(topics, 'topics (abi filtered)')
    return topics;
  }


 /**
  * Provide a contract instance for tha app contract.
 */
  instantiateContract() {
    const contract = require('truffle-contract');
    const testEventHandling = contract(TestEventHandling);
    testEventHandling.setProvider(this.state.web3.currentProvider);

    // Set a default "from" to web3.eth.accounts[0] for any call.
    testEventHandling.defaults({from: this.state.web3.eth.accounts[0]});

    // Declaring this for later so we can chain functions on SimpleStorage.
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      testEventHandling.deployed().then((instance) => {
        console.log(instance, 'contract instance')
        this.setState({
          contract: instance,
          eventsByTopic: this.createEventsByTopic(instance.abi),
        });
      })
    })
  }

  triggerEvent(method) {
    this.state.contract[method]().then((result) => {
      // Here we actually have the Event log.
      // The actual goal is listen for "mined events" by using
      console.log('Call to ' + method + '()');
      console.log('result.logs contains all emitted events', result.logs);
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>TestEventHandling.sol</h1>
              {this.state.contract &&
              <div>
                <strong>Contract address</strong>
                <br />{this.state.contract.address}
                <p>
                  You may call <em>triggerEvent()</em> which emits <em>CalledTrigger</em>,<br />
                  or send money to the contract address above which emits <em>MoneyReceived</em>.
                </p>

                {/*
                  Contract Method Buttons
                  Mapping the emited events to Contract Methods
                  We can do this only because:
                   * triggerEventX() emits CalledTriggerX
                   * and MoneyReceived you can trigger only by sending Eth.
                */}
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                  {this.state.eventsByTopic.map(e =>
                      <span key={e.topic}
                            style={{padding: '.25em'}}>
                      <button
                          style={{fontSize: '75%'}}
                          id={e.name.replace('CalledTrigger', 'triggerEvent')}
                          onClick={(e) => this.triggerEvent(e.currentTarget.attributes.id.value)}
                          className="pure-button pure-button-primary"
                          disabled={e.name === 'MoneyReceived'}
                      >call {e.name}()
                      </button>
                    </span>
                  )}
                </div>

                <p>
                  <LoggerSwitch watchEvents={this.props.watchEvents} handleChange={this.toggleLogging} />Contract Event log
                </p>
                {this.props.watchEvents &&
                <EventList events={this.props.eventLog} />}
              </div>
              }
            </div>
          </div>
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    web3: state.web3,
    contract: state.contract,
    watchEvents: state.watchEvents,
    eventLog: state.eventLog
  };
};

const mapDispatchToProps = (dispatch) => ({
  toggleLog: (e) => { dispatch(toggleLog(e)) },
  addEvent: (events) => { dispatch(addEvent(events)) },
});

export default connect(mapStateToProps, mapDispatchToProps)(App);

// export default App
