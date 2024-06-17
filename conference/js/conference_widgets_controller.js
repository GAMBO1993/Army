const moreOptionsButton = document.getElementById("more_btn");
const moreOptionsDropdown = document.getElementById("more_options_dropdown");
let openUserListBtn = document.getElementById('user_list');
let closeUserListBtn = document.getElementById('close_user_btn');
let roomMembers = document.getElementById('room_members');
let closeActionForm = document.getElementById('close_action_form')
let actionForm = document.getElementById('admin_action_form')
let openAction = document.getElementById('kick_a_user')
let muteRemoteUser = document.getElementById('mute_a_remote_user_mic')
let muteRemoteUserVideo = document.getElementById('mute_a_remote_user_video')
let goActionBtn = document.getElementById('action_form_go_btn')
let userOptions = document.getElementsByClassName('individual_user_options')[0]





document.addEventListener('DOMContentLoaded', function() {
    const closeButton = document.getElementById('close_message_btn');
    const chatButton = document.getElementById('chatting_window');
    const messageContainer = document.querySelector('.message_container');

    let isOpen = false; // Track the state of the message container
    
    // Add an event listener to the close button
    closeButton.addEventListener('click', function() {
        // Slide the container to the right
        slideOut();
    });

    // Add an event listener to the chat button
    chatButton.addEventListener('click', function() {
        // Toggle the message container state
        if (isOpen) {
            slideOut();
        } else {
            slideIn();
        }
    });

    // Function to slide the container out
    function slideOut() {
        messageContainer.style.right = '-350px'; // Slide to the left to hide
        isOpen = false;
        chatButton.style.display = 'flex'
    }

    // Function to slide the container in
    function slideIn() {
        messageContainer.style.display = 'flex';
        messageContainer.style.right = '0'; // Slide in from the right
        isOpen = true;
        chatButton.style.display = 'none'
    }
});

let closeOptions = () => {
    console.log('Close option')
    userOptions.style.display = 'none'
}

userOptions.addEventListener('click', closeOptions)

let muteActionForm = () => {
    document.getElementById('action_form_title').innerText = 'User to mute audio'
    document.getElementById('action_form_go_btn').value = 'Mute audio'
    document.getElementById('action_controls').value = muteUser
    actionForm.style.display = 'flex'
}

let muteUserVideoActionForm = () => {
    document.getElementById('action_form_title').innerText = 'User to mute video'
    document.getElementById('action_form_go_btn').value = 'Mute video'
    document.getElementById('action_controls').value = muteVideo
    actionForm.style.display = 'flex'
}

let openActionForm = () => {
    document.getElementById('action_form_title').innerText = 'User to Kick'
    document.getElementById('action_form_go_btn').value = 'Kick'
    document.getElementById('action_controls').value = kickUser
    actionForm.style.display = 'flex'
}

let goActionForm = () => {
    if(action_form_input_text.value === ''){
        console.log('Empty field')
    }else{
        muteUserVideo(action_form_input_text.value)
        actionForm.style.display = 'none'
        action_form_input_text.value = ''
    }
}

let closeFormAction = () => {
    actionForm.style.display = 'none'
}



let openUserList = () => {
    roomMembers.style.left = '0';
    openUserListBtn.style.display = 'none'
}

let closeUserList = () => {
    roomMembers.style.left = '-350px';
    openUserListBtn.style.display = 'flex'
}



// moreOptionsButton.addEventListener("click", (e) => {
//     e.preventDefault();
//     toggleDropup();
// });

document.addEventListener("click", (e) => {
    if (!moreOptionsButton.contains(e.target) && !moreOptionsDropdown.contains(e.target)) {
        closeDropup();
    }
});

function toggleDropup() {
    if (moreOptionsDropdown.style.display === "block") {
        closeDropup();
    } else {
        moreOptionsDropdown.style.display = "block";
    }
}

function closeDropup() {
    moreOptionsDropdown.style.display = "none";
}

moreOptionsButton.addEventListener('click', toggleDropup)
muteRemoteUser.addEventListener('click', muteActionForm)
muteRemoteUserVideo.addEventListener('click', muteUserVideoActionForm);
openAction.addEventListener('click', openActionForm)
closeActionForm.addEventListener('click', closeFormAction)
openUserListBtn.addEventListener('click', openUserList);
closeUserListBtn.addEventListener('click', closeUserList);