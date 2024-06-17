let MemberUserId

let handleMemberJoined = async (MemberId) => {
    MemberUserId = MemberId
    console.log('New Member joined: ', MemberId)
    addMemberToDom(MemberId)

    let members = await channel.getMembers()
    updateAudienceTotal(members)

    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    addBotMessageToDom(`${name} has joined 🥳`)
}

let addMemberToDom = async (MemberId) => {
    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    let membersWrapper = document.getElementById('list-of-audience')

    let checkUserRegistration = `<span class="material-symbols-outlined">
                                    done_all
                                </span>`
    let memberItem = `<li id="member__${MemberId}__wrapper">
                        <img class="avatrs" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2864&q=80">
                        <div class="member_userName">${name}</div>
                        <span class="material-symbols-outlined member_menu" id="member_${MemberId}_menu">
                            more_vert
                        </span>
                        ${checkUserRegistration}
                    </li>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}




let localSavedId = sessionStorage.getItem('user_uid')

    

let userMoreOptions = (event) => {
    var element = document.querySelector('.selected-user-name');
    element.textContent = event.target.previousSibling.textContent;

    event.stopImmediatePropagation()
    MemberUserId = event.target.id.split('_')[1]
    console.log('Clicked UID:', MemberUserId)
    let optionClass = document.getElementById('more_user_options')
    optionClass.style.display = 'flex'
}


    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('member_menu')) {
            MemberUserId = event.target.id.split('_')[1]
            console.log('Your id is', MemberUserId, localSavedId)
            if(localSavedId == MemberUserId){
                console.log('Your id is', MemberUserId, localSavedId)
            }else{
                userMoreOptions(event)
            }
        }
    })


let handleChannelMessage = async (messageData, MemberId) => {
    console.log('A new message is recieved')

    let data = JSON.parse(messageData.text)
    
    if(data.type === 'chat'){
        addMessageToDom(data.displayName, data.message)
    }
}


let addMessageToDom = (name, message) => {
    let messageWrapper = document.getElementById('inner-message');
    let newMessage = `<div class="message-conent">
                        <label class="message-name">${name}</label><p></p>
                        <label class="message-message">${message}</label>
                    </div>`;

    messageWrapper.insertAdjacentHTML('beforeend', newMessage);
    let lastMessage = document.querySelector('#inner-message .message-conent:last-child');
    if (lastMessage) {
        lastMessage.scrollIntoView();
    }
}

let addBotMessageToDom = (botMessage) => {
    let messageWrapper = document.getElementById('inner-message');
    let newMessage = `<div class="bot-message">
                            <label class="bot-name">VainLive BOT</label><p></p>
                            <label class="bot-message">${botMessage}</label>
                        </div>`;

    messageWrapper.insertAdjacentHTML('beforeend', newMessage);
    let lastMessage = document.querySelector('#inner-message .message-conent:last-child');
    if (lastMessage) {
        lastMessage.scrollIntoView();
    }
}



const editingField = document.getElementById("editing-field");

        // Listen for the "keydown" event on the input field
        editingField.addEventListener("keydown", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                sendMessage()
            }
        })


let sendMessage = async() => {
    let message = editingField.value;
    channel.sendMessage({text: JSON.stringify({'type' : 'chat', 'message' : message, 'displayName' : displayName})})
    addMessageToDom(displayName, message)
    document.getElementById("message__form").reset()
}


let updateAudienceTotal = async (members) => {
    let total = document.getElementById('classlist')
    total.innerText = members.length
}

let getMembers = async () => {
    let members = await channel.getMembers()

    updateAudienceTotal(members)

    for(let i = 0; members.length > i; i++){
        addMemberToDom(members[i])
    }
}



let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId)

    let members = await channel.getMembers()
    updateAudienceTotal(members)

}

let removeMemberFromDom = async (MemberId) => {
    let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`)
    let name = memberWrapper.getElementsByClassName('member_userName')[0].textContent
    memberWrapper.remove()

    addBotMessageToDom(`${name} has left 😭`)
}



let leaveChannel = async () => {
    await channel.leave()
    await rtmClient.logout()
}

let messagesContainer = document.getElementById('message-cover')
messagesContainer.scrollTop = messagesContainer.scrollHeight


// Needs research
// document.getElementById('more_user_options').addEventListener('click', closeUserMoreOptionsList)



window.addEventListener('beforeunload', leaveChannel)