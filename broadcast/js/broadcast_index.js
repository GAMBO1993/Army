let form = document.getElementById('index__form')
let joinForm = document.getElementById('join-form')
const roomNameInput = document.getElementById("join-room-Id")
const userName = document.getElementById('username-Id')
const userNameJoin = document.getElementById('username-id-string')
const homeBtn = document.getElementById('home-floating-btn')


let inviteCode = '';
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = characters.length;

for (let i = 0; i < 40; i++) {
	inviteCode += characters.charAt(Math.floor(Math.random() * charactersLength));
}


let displayUsername = sessionStorage.getItem('display_username')
if(displayUsername){
	form.name.value = displayUsername
}


  
form.addEventListener('submit', (e) => {
    e.preventDefault()

	sessionStorage.setItem('role', 'admin')
	sessionStorage.setItem('display_username', userName.value)
	sessionStorage.setItem("display_name", roomNameInput.value)
	
	window.location = `room.html?inviteCode=${inviteCode}`
})

joinForm.addEventListener('submit', (e) => {
    e.preventDefault()

	sessionStorage.setItem('role', 'audience')
	sessionStorage.setItem('display_username', userNameJoin.value)

    let roomId = document.getElementById('room-id-string').value

    window.location = `room.html?inviteCode=${roomId}`
  })


var modal = document.getElementById("myModal");
var btn = document.getElementsByClassName("floating-btn")[0];
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
	modal.style.display = "block";
}

span.onclick = function() {
	modal.style.display = "none";
}

window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}


let goToHomePage = () => {
    // Please set the root of this funtion for website the website
	// Example 
	// http://vainglass.com/vainlive/web/index.html
	window.location = '/index.html'
}



homeBtn.addEventListener('click', goToHomePage)