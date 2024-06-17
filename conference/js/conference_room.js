let APP_ID = appID
let TOKEN = hiddenToken
let CHANNEL


const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})


let localTracks = []
let remoteUsers = {}
let rtmClient
let rtmChanel
let usersNames = 'Guest'

let UID;

let localScreenTracks;
let sharingScreen = false;


let displayName = userDisplayName
let userRole = userActualRole



if(!displayName){
    gotToConferencePage()
}



const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('roomId')


if(!roomId){
    gotToConferencePage()
}else{
    CHANNEL = roomId
}





let joinAndDisplayLocalStream = async () => {
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);
    let YID = await client.join(APP_ID, CHANNEL, TOKEN, null)
    UID = YID.toString()


    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {
        encoderConfig: {
          width: { max: 1280, ideal: 1280, min: 720 },
          height: { max: 1280, ideal: 1280,  min: 720 },
          frameRate: { max: 120, ideal: 120, min: 60 }
        }
      })
      


    

    rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({uid : `${UID}`, TOKEN}).then(() => {
        console.log('You are logged in')
    }).catch(error => {
        console.error('Login Failed', error)
    })

    rtmChanel = await rtmClient.createChannel(roomId)
    await rtmChanel.join()

    // To get a user's name through their unique UID //
    await rtmClient.addOrUpdateLocalUserAttributes({'name' : displayName})
    //-----------------------------------------------//


    rtmChanel.on('MemberJoined', handleUserRtmJoin)
    rtmChanel.on('MemberLeft', handleUserRtmLeft)
    rtmChanel.on('ChannelMessage', handleRtmChannelMessage)

    GetUSerList()
    addBotMessageToChannel(`Welcome ${displayName} 😀`)


    // Voice Indicator //

    let volumeIndicator = () => {
        AgoraRTC.setParameter('AUDIO_VOLUME_INDICATION_INTERVAL', 100)
        client.enableAudioVolumeIndicator()
        client.on('volume-indicator', volumes => {
            volumes.forEach((volume) => {
                let item = document.getElementsByClassName(`video-wrapper-${volume.uid}`)[0]
    
                // Check if item is defined
                if (item) {
                    if (volume.level >= 50) {
                        item.style.border = "2px solid red";
                        item.style.animation = 'glow-red 1s infinite alternate';
                    } else if (volume.level >= 20) {
                        item.style.border = "2px solid green";
                        item.style.animation = 'glow 1s infinite alternate';
                    } else {
                        item.style.border = "2px solid rgb(76, 9, 76)";
                        item.style.animation = 'none';
                    }
                }
            })
        })
    }


    
volumeIndicator()
rtmControlManager()
getUserRoleStat()
}


let joinConference = async() =>{
    document.getElementById('join-video-conference').style.display = 'none'
    document.getElementsByClassName('video_controls')[0].style.display = 'flex'

    let player = `<div class="video_players video-wrapper-${UID}" id="video-wrapper-${UID}">
                    <div class="video_capture" id="user-container-${UID}"></div>
                    
                    <div onclick="showVideoInFullScreen('user-container-${UID}')" id="full_screen_btn_${UID}"class="full_screen_btn"><span class="material-symbols-outlined">
                        open_in_full
                    </span></div>
                    <div class="user_name">${displayName}</div>
                </div>`
    document.getElementById('video_grid').insertAdjacentHTML('beforeend', player)
    

    localTracks[1].play(`user-container-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])
}


let getUserRoleStat = () => {
    const interval = 3000
    const intervalId = setInterval(async() => {
    console.log('Checking user role ...')
    checkAdminStat();
  }, interval)
}


let rtmControlManager = async() => {
    
    rtmClient.on('MessageFromPeer', async ({ text }, senderId) => {
        console.log(`User Message ${senderId}: ${text}`)

        if(text === muteVideo){
            remoteVideoToggle()
        }else if(text === muteUser){
            remoteAudioToggle()
        }else if(text === kickUser){
            leaveBtn()
        }else if(text === blockUser){
            removeLocalFrame()
        }
    });
    

    
    
    
    let sendButton = document.getElementById('action_form_go_btn');
    sendButton.addEventListener('click', () => {
        let recipientUserId = document.getElementById('action_form_input_text');
        let commandControls = document.getElementById('action_controls').value;
        
        if(!recipientUserId){
            console.log("Field can't be empty")
        }else{
            if (commandControls) {
                rtmClient.sendMessageToPeer({ text: commandControls }, recipientUserId.value)
                    .then(() => {})
                    .catch(error => {
                        console.error('Send message error:', error);
                    });
            }

            recipientUserId.value = ''
            document.getElementById('admin_action_form').style.display = 'none'
        }
    });
}


let checkAdminStat = () => {
    if (userRole === 'admin') {
        let moreOptions = document.getElementById('more_btn')
        moreOptions.style.display = 'flex'
    } else {
        let moreOptions = document.getElementById('more_btn');

        moreOptions.style.display = 'none'
    }
}






let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
        let player = document.getElementById(`video-wrapper-${user.uid}`);
        console.log('player:', player);
        if (player != null) {
            player.remove();
        }

        player = `<div class="video_players video-wrapper-${user.uid}" id="video-wrapper-${user.uid}">
                    <div class="video_capture" id="user-container-${user.uid}"></div>

                    <div onclick="copyUserId(${user.uid})" id="copy_userId" class="copy_userId"><span class="material-symbols-outlined">
                    content_copy
                    </span></div>

                    <div onclick="showVideoInFullScreen('user-container-${user.uid}')" id="full_screen_btn_${user.uid}"class="full_screen_btn"><span class="material-symbols-outlined">
                        open_in_full
                    </span></div>

                    <div id="user_name" class="user_name">${user.uid}</div>
                </div>`;
        document.getElementById('video_grid').insertAdjacentHTML('beforeend', player);
        user.videoTrack.play(`user-container-${user.uid}`);
    }

    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
}

const showVideoInFullScreen = (elementId) => {
    const element = document.getElementById(elementId);
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
};



let handleUserLeft = (user) => {
    console.log('Handle user left!')
    delete remoteUsers[user.UID]
    document.getElementById(`video-wrapper-${user.uid}`).remove()
}



let switchToVideoCam = async () => {
    let {name} = await rtmClient.getUserAttributesByKeys(UID, ['name'])
    let player = `<div class="video_players video-wrapper-${UID}" id="video-wrapper-${UID}">
                    <div class="video_capture" id="user-container-${UID}"></div>
                    <div id="more_user_options" class="more_user_options"><span class="material-symbols-outlined">
                        more_vert
                    </span></div>
                    <div class="user_name">${name}</div>
                </div>`

    document.getElementById('video_grid').insertAdjacentHTML('beforeend', player);
    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)

    document.getElementById('mic_btn').classList.remove('active')
    document.getElementById('video_btn').classList.remove('active')

    localTracks[1].play(`user-container-${UID}`)
    await client.publish([localTracks[1]])
}


// Options at each user frame
let userMoreOptions = (UserId) => {
    console.log('Tapped more options', UserId)
    let options = document.getElementsByClassName('remote_user_options')
    options.style.display = 'flex'
}

let remoteAudioToggle = async () => {
    let button = document.getElementById('mic_btn')
    await localTracks[0].setMuted(true)
    button.classList.remove('active')
}


let remoteVideoToggle = async () => {
    let button = document.getElementById('video_btn')
    await localTracks[1].setMuted(true)
    button.classList.remove('active')
}

let toggleCamera = async (e) => {
    let button = e.currentTarget

    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[1].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleMic = async (e) => {
    let button = e.currentTarget

    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[0].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleScreen = async (e) => {
    let screenBtn = e.currentTarget
    let cameraBtn = document.getElementById('video_btn')

    if (!sharingScreen) {
        sharingScreen = true

        screenBtn.classList.add('active')
        cameraBtn.classList.remove('active')
        cameraBtn.style.display = 'none'

        // Create a local screen video track
        localScreenTracks = await AgoraRTC.createScreenVideoTrack()

        document.getElementById(`video-wrapper-${UID}`).remove()

        let player = `<div class="video_players video-wrapper-${UID}" id="video-wrapper-${UID}">
                        <div class="video_capture" id="user-container-${UID}"></div>
                    <div class="user_name">${UID}</div>
                </div>`

        
        document.getElementById('video_grid').insertAdjacentHTML('beforeend', player);
        localScreenTracks.play(`user-container-${UID}`)

        // Unpublish the previous video track and publish the screen track
        await client.unpublish(localTracks[1])
        await client.publish(localScreenTracks)
        
    } else {
        sharingScreen = false
        cameraBtn.style.display = 'block'
        document.getElementById(`video-wrapper-${UID}`).remove()
        await client.unpublish(localScreenTracks)

        switchToVideoCam()
    }
}

let leaveBtn = async () => {
    sessionStorage.removeItem('displayName')
    gotToConferencePage()
}



const removeLocalFrame = async () => {
    document.getElementById('join-video-conference').style.display = 'flex'
    document.getElementsByClassName('video_controls')[0].style.display = 'none'

    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].stop()
    }

    const player = document.getElementById(`video-wrapper-${UID}`);
    if (player) {
        player.remove();
    }

    await client.unpublish([localTracks[0], localTracks[1]]);
}




let copyRoomId = (e) => {
    // Get the text to copy
    var textToCopy = roomId;
  
    // Create a temporary input element to copy the text
    var tempInput = document.createElement("input");
    tempInput.setAttribute("type", "text");
    tempInput.setAttribute("value", textToCopy);
    document.body.appendChild(tempInput);
  
    // Select the text in the input element
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
  
    // Copy the selected text
    document.execCommand("copy");
  
    // Remove the temporary input element
    document.body.removeChild(tempInput);
  
    // Get the snackbar element
    var snackbar = document.getElementById("snackbar");
  
    // Set the text of the snackbar
    snackbar.innerHTML = "Copied";
  
    // Show the snackbar
    snackbar.classList.add("show");
  
    // Hide the snackbar after 3 seconds
    setTimeout(function() {
      snackbar.classList.remove("show");
    }, 3000);
  }


  let copyUserId = (userId) => {
    // Create a text area element to copy the text
    var textArea = document.createElement("textarea");
    textArea.value = userId;
    document.body.appendChild(textArea);
  
    // Select the text in the text area
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices
  
    // Copy the selected text
    document.execCommand("copy");
  
    // Remove the text area element
    document.body.removeChild(textArea);
  
    // Get the snackbar element
    var snackbar = document.getElementById("snackbar");
  
    // Set the text of the snackbar
    snackbar.innerHTML = "Copied";
  
    // Show the snackbar
    snackbar.classList.add("show");
  
    // Hide the snackbar after 3 seconds
    setTimeout(function() {
      snackbar.classList.remove("show");
    }, 3000);
  };
  



document.getElementById('video_btn').addEventListener('click', toggleCamera)
document.getElementById('mic_btn').addEventListener('click', toggleMic)
document.getElementById('screen_share_btn').addEventListener('click', toggleScreen)
document.getElementById('leave_btn').addEventListener('click', leaveBtn)
document.getElementById('mute_all_remote_users_audio').addEventListener('click', muteUsersAudio)
document.getElementById('mute_all_remote_users_video').addEventListener('click', muteUsersVideos)
document.getElementById('copy_btn').addEventListener('click', copyRoomId)
document.getElementById('join-video-conference').addEventListener('click', joinConference)



joinAndDisplayLocalStream()



window.addEventListener('beforeunload', async function(event) {
    await rtmChanel.leave()
    await rtmClient.logout()
    sessionStorage.removeItem('displayName')
})
