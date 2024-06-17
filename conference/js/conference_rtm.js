let uidLead


let handleUserRtmJoin = async (UserId) => {
    console.log('A member has joined', UserId)
    addUserToDom(UserId)

    let users = await rtmChanel.getMembers()
    totalNumberOfUsers(users)

    let {name} = await rtmClient.getUserAttributesByKeys(UserId, ['name'])
    usersNames = name
    addBotMessageToChannel(`${name} has joined 🥳`)
}

let handleUserRtmLeft = async (userId) => {
    console.log('A member has left', userId)
    removeUserFromDom(userId)

    let users = await rtmChanel.getMembers()
    totalNumberOfUsers(users)
}


let addUserToDom = async(UserId) => {
    // To get user's name value by id from addOrUpdateLocalUserAttributes //
    let {name} = await rtmClient.getUserAttributesByKeys(UserId, ['name'])
    //---------------------------------------------------------------------//

    


    let UsersList = document.getElementById('scrollable_content')
    let IndividualUserList = `<div class="user_name_content" id="user_${UserId}_dom">
                                    <div class="users_name_list">${name}</div>
                                    <div class="user_name_id">${UserId}</div>
                                    <div onclick="openMoreOptions(${UserId})" id="optionsBtn" class="optionsBtn">
                                        <span class="material-symbols-outlined">
                                            <span class="material-symbols-outlined">
                                                more_vert
                                            </span>
                                        </span>
                                    </div>
                                </div>`
    UsersList.insertAdjacentHTML('beforeend', IndividualUserList)
    if(UserId == UID){
        document.getElementById('optionsBtn').style.display = 'none'
    }
}



let openMoreOptions = (UserID) => {
        if(UserID == UID){
            console.log("Can't action yourself")
        }else{
            uidLead = UserID.toString()
        if(userActualRole != 'admin'){
            console.log('You are not allowed')
        }else{
        let userNameElement = document.querySelector(`#user_${UserID}_dom .users_name_list`);
        let userName = userNameElement.textContent;

        // Set the user's name in the 'usernameOption' field
        let usernameOption = document.querySelector('.usernameOption');
        usernameOption.textContent = userName;

        // Display the options
        let moreOpt = document.getElementById('individual_user_options');
        moreOpt.style.display = "flex";



        let sendMuteMic = document.getElementById('muteMic')
        sendMuteMic.addEventListener('click', () => {
            let commandControls = muteUser

            rtmClient.sendMessageToPeer({ text: commandControls }, uidLead)
                .then(() => {})
                .catch(error => {
                    console.error('Send message error:', error)
            })
        })



        let sendMuteVideo = document.getElementById('kickMember')
        sendMuteVideo.addEventListener('click', () => {
            let commandControls = kickUser

            rtmClient.sendMessageToPeer({ text: commandControls }, uidLead)
                .then(() => {})
                .catch(error => {
                    console.error('Send message error:', error)
            })
        })


        let sendRemoveLocalFrame = document.getElementById('removeVideoFrame')
        sendRemoveLocalFrame.addEventListener('click', () => {
            let commandControls = blockUser

            rtmClient.sendMessageToPeer({ text: commandControls }, uidLead)
                .then(() => {})
                .catch(error => {
                    console.error('Send message error:', error)
            })
        })



        let sendKickMember = document.getElementById('muteVideo')
        sendKickMember.addEventListener('click', () => {
            let commandControls = muteVideo

            rtmClient.sendMessageToPeer({ text: commandControls }, uidLead)
                .then(() => {})
                .catch(error => {
                    console.error('Send message error:', error)
            })
        })


        }
    }
}




let removeUserFromDom = async(UserId) => {
    let IndividualUserListLeft = document.getElementById(`user_${UserId}_dom`)

    IndividualUserListLeft.remove()

    let name = IndividualUserListLeft.getElementsByClassName('users_name_list')[0].textContent
    addBotMessageToChannel(`${name} has left 😭`)

}

let totalNumberOfUsers = async(userNumber) => {
    let userCounter = document.getElementById('user_counter');
    let membersCount = document.getElementById('members_count');

    userCounter.innerText = userNumber.length;
    membersCount.innerText = userNumber.length;
}

let GetUSerList = async () => {
    let userList = await rtmChanel.getMembers()
    
    for(let i = 0; userList.length> i; i++){
        addUserToDom(userList[i])
    }
    totalNumberOfUsers(userList)
}



let handleRtmChannelMessage = async (messageData, userId) => {
    console.log('New message :', messageData)
    let data = JSON.parse(messageData.text)
    if(data.type == 'chat'){
        // addMessageToChannel(data.displayName, data.message)
        if(data.message === muteAllUserAudio){
            remoteAudioToggle()
        }else if(data.message === muteAllUserVideo){
            remoteVideoToggle()
        }else{
            addMessageToChannel(data.displayName, data.message)
        }
    }
}


let addMessageToChannel = (name, message) => {
    let messageContainer = document.getElementById('message_area')
    let receivedChannelMessage = `<div class="message_content">
                                    <div class="users_name">${name}</div>
                                    <div class="message_text">${message}</div>
                                </div>`
    messageContainer.insertAdjacentHTML('beforeend', receivedChannelMessage)
    let lastMessage = document.querySelector('#message_area .message_content:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}


let addBotMessageToChannel = (botMessage) => {
    let messageContainer = document.getElementById('message_area')
    let receivedChannelMessage = `<div id="bot_message_content" class="bot_message_content">
                                    <div class="bot_users_name">Live BOT</div>
                                    <div class="message_text">${botMessage}</div>
                                </div>`
    messageContainer.insertAdjacentHTML('beforeend', receivedChannelMessage)
    let lastMessage = document.querySelector('#message_area .message_content:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}



let muteUsersVideos = async() => {
    rtmChanel.sendMessage({text:JSON.stringify({'type':'chat', 'message':muteAllUserVideo, 'displayName':displayName})})
}


let muteUsersAudio = async() => {
    rtmChanel.sendMessage({text:JSON.stringify({'type':'chat', 'message':muteAllUserAudio, 'displayName':displayName})})
}


let sendMessage = async(e) => {
    let message = document.getElementById('message_text_area').value
    rtmChanel.sendMessage({text:JSON.stringify({'type':'chat', 'message':message, 'displayName':displayName})})
    addMessageToChannel(displayName, message)
}

document.addEventListener('DOMContentLoaded', function() {
    const messageTextArea = document.getElementById('message_text_area');
    function clearTextOnEnter(event) {
        if (event.key === 'Enter') {
            sendMessage()
            messageTextArea.value = ''
        }
    }

    
    messageTextArea.addEventListener('keydown', clearTextOnEnter);
})