import React, { Component } from 'react'
import io from "socket.io-client";

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Message from './message/Message'

import { friendListUpdater } from '../../../actions/userActions'
import { saveMessages, getCurrentMessages, setOnlineFriends, newOnlineFriend, newOfflineFriend } from '../../../actions/messageActions'
let socket;

class Chat extends Component {
    constructor(props) {
        super(props)
        this.state = {
            inputText: '',
            messages: this.props.currentMessages || '',
        }
        this.onSubmit = this.onSubmit.bind(this);
    }


    componentDidMount() {
        console.log(this.props.user.friendsList)
        const friendId = this.props.user.friendsList.map(e => e._id)
        const { id } = this.props.user
        socket = io()
        socket.on("connect", () => {
            socket.emit('setUserId', id)

            socket.emit('setOnlineFriends', friendId)

            setTimeout(() => {
                socket.emit('setToFriendsOnline', id)
            }, 500)

            socket.on('onlineReciever', (newOnlineFriend) => {
                this.props.newOnlineFriend(newOnlineFriend)
            })

            socket.on('offlineReciever', (newOfflineFriend) => {
                this.props.newOfflineFriend(newOfflineFriend)
            })


            socket.on('sendPrivateMessage', (from, message) => {
                this.props.saveMessages(from, id, message)
                this.props.getCurrentMessages(from, id)
            })

            socket.on('pushAction', (to) => {
                this.props.friendListUpdater(to)
            })

            socket.on('userFriends', (friendsArr) => {
                this.props.setOnlineFriends(friendsArr)
            })

            this.props.onPassId(socket)

        });

    }

    componentWillUnmount() {
        // console.log(this.props.user.friendsList)
        const { id } = this.props.user
        socket.emit('setToFriendsOffline', id, this.props.friendsList)
        socket.disconnect(id)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.messages.id !== this.props.messages.id && this.props.messages.id) {
            this.props.getCurrentMessages(this.props.messages.id, this.props.user.id)
        }



    }

    onSubmit(e) {
        e.preventDefault()
        const { id } = this.props.user
        const message = this.state.inputText
        const friendId = this.props.messages.id

        socket.emit('message', friendId, message);
        this.props.saveMessages(id, friendId, message)
        this.props.getCurrentMessages(id, friendId)
        this.setState({
            ...this.state,
            inputText: ''
        })
    }

    render() {
        console.log(this.props)
        if (this.props.messages.username) {
            return (
                <div style={chatWrapper} >
                    <div style={messageBanner}>

                        <div style={headerDiv}>
                            <div style={messagingWrapper}>
                                <p style={messagingText}>Messaging:</p>
                                {this.props.messages.username.slice(0, 1).toUpperCase() + this.props.messages.username.slice(1).toLowerCase()}
                            </div>
                            <div><img src={this.props.messages.image} alt='' /></div>
                        </div>

                    </div>

                    <div style={messageWrapper} id="message">
                        <Message messages={this.props.currentMessages} switch={this.props.messages} />
                    </div>


                    <form style={chatBox} onSubmit={this.onSubmit}>
                        <div style={inputWrapper}>
                            <input
                                style={inputStyle}
                                type='text'
                                value={this.state.inputText}
                                onChange={(e) => {
                                    this.setState({
                                        ...this.state,
                                        inputText: e.target.value
                                    })
                                }} />
                            <button
                                type="submit"
                                style={buttonStyle}
                            ><span className='glyphicon glyphicon-send'></span></button>
                        </div>
                    </form>
                </div>
            )
        } else {
            return (
                <></>
            )
        }
    }

}

Chat.propTypes = {
    messages: PropTypes.object,
    saveMessages: PropTypes.func.isRequired,
    getCurrentMessages: PropTypes.func.isRequired,
    currentMessages: PropTypes.array,
    friendListUpdater: PropTypes.func.isRequired,
    setOnlineFriends: PropTypes.func.isRequired,
    newOnlineFriend: PropTypes.func.isRequired,
    newOfflineFriend: PropTypes.func.isRequired,
    friendsList: PropTypes.array
}

const mapStateToProps = state => ({
    messages: state.friend.messageWith,
    friendsList: state.friend.friendsOnline,
    currentMessages: state.friend.currentMessages,
    user: state.auth.user
})


export default connect(mapStateToProps, { saveMessages, getCurrentMessages, friendListUpdater, setOnlineFriends, newOfflineFriend, newOnlineFriend })(Chat)


const chatWrapper = {
    height: '600px',
    width: '600px',
    margin: 'auto',
}

const messageWrapper = {
    overflow: 'scroll',
    height: '475px',
    display: 'flex',
    flexDirection: 'column-reverse'
}

const inputStyle = {
    display: 'inline-block',
    width: '300px',
    fontSize: '15px',
    border: '1px solid lightgrey',
    margin: 'auto'
}

const buttonStyle = {
    border: 'none',
    borderBottom: '1px solid blue',
    backgroundColor: 'gainsboro',
    marginLeft: '10px',
    color: 'blue',
    letterSpacing: '1px'
}

const messageBanner = {
    fontSize: '25px',
    height: '67px',
    borderBottom: '1px solid grey',
    padding: '10px 20px',
}

const chatBox = {
    display: 'flex',
    alignItems: 'center',
    height: '60px',
    backgroundColor: 'gainsboro'
}

const inputWrapper = {
    display: 'flex',
    justifyContent: 'space-around',
    margin: 'auto',

}

const headerDiv = {
    display: 'flex',
    justifyContent: 'space-between'
}

const messagingWrapper = {
    display: 'inline-block'
}

const messagingText = {
    fontSize: '9px',
    marginBottom: '0'
}