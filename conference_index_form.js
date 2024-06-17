// Get the form element
var createRoomForm = document.getElementById("create_room_form");
var joinFormContainer = document.getElementById('join_room_form_container')
var closeJoinFormBtn = document.getElementById('close_join_form_btn')
var openJoinForm = document.getElementById('join_btn_form')
var goToHomePage = document.getElementById('home_btn')
var displayName = sessionStorage.getItem('displayName')
var joinDisplayName = sessionStorage.getItem('joinDisplayName')


if(displayName){
    createRoomForm.username.value = displayName
}

createRoomForm.addEventListener('submit', (e) => {
    e.preventDefault()

    sessionStorage.setItem('displayName', e.target.username.value)
    sessionStorage.setItem('role', 'admin')

    // Define the characters to include in the random string
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';

    // Specify the desired length of the random string
    const length = 50;

    // Generate the random string
    let inviteCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        inviteCode += characters.charAt(randomIndex);
    }

    window.location = `conference_room.html?roomId=${inviteCode}`;
});




// Get the join room form element
var joinRoomForm = document.querySelector('.join_room_form');

// Add an event listener for the form submission
joinRoomForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var joinRoomId = document.getElementById('join_roomId_field').value;

    sessionStorage.setItem('displayName', e.target.join_username_field.value)
    sessionStorage.setItem('role', 'participant') // Setting user role using session storage
    window.location = `conference_room.html?roomId=${joinRoomId}`;
});




let openJoinFormContainer = () => {
    joinFormContainer.style.display = 'flex'
}

let closeFormContainer = () => {
    joinFormContainer.style.display = 'none'
}


let navigateToHomePage = () => {
    // window.location = '/index.html'
    window.location = '/'
}


goToHomePage.addEventListener('click', navigateToHomePage)
openJoinForm.addEventListener('click', openJoinFormContainer)
closeJoinFormBtn.addEventListener('click', closeFormContainer)