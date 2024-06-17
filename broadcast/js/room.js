const APP_ID = '7a995545e4ae48cf95b94ea9d6688ea8'
const TOKEN = null;
let UID;
let sharingScreen = false;
let rtmClient;
let channel;


const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
let displayName = sessionStorage.getItem('display_username')
let displayFrame = document.getElementById('stream__box')
let getRole = sessionStorage.getItem('role')





let localTracks = []
let remoteUser = {}


const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('inviteCode')

if(!roomId){
    window.location = 'broadcast_index.html'
}

if(!displayName){
  window.location = 'broadcast_index.html'
}




var options = {
  appid: APP_ID,
  channel: roomId,
  uid: UID,
  token: TOKEN,
  accountName: displayName,
  role: "audience"
}
  


let joinAndDisplayLocalStream = async () => {
    let YID = await client.join(APP_ID, roomId, TOKEN, null)
    UID = YID.toString()
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)



  

    if (getRole === 'admin') {
      options.role = "host"
      console.log('The official log is :', options.role)
      let adminControls = document.getElementsByClassName('floating-button')
      for (let i = 0; i < adminControls.length; i++) {
        adminControls[i].style.display = 'flex';
      }
      rtcEngine()
    }
    else{
      options.role = "audience"
      console.log('The official log is :', options.role)
      let audienceControls = document.getElementsByClassName('audience-floating-button')
      for (let i = 0; i < audienceControls.length; i++) {
        audienceControls[i].style.display = 'flex';
      }
  }

    rtmFunction()
}


let rtcEngine = async () => {
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {
    encoderConfig: {
      width: { max: 1280, ideal: 1280, min: 720 },
      height: { max: 1280, ideal: 1280,  min: 720 },
      frameRate: { max: 120, ideal: 120, min: 60 }
    }
  })





  let player = `<div class="video-container" id="user-container-${UID}">
                  <div class="video-player" id="user-${UID}">
                  </div>
                </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)
    
    await client.publish([localTracks[0], localTracks[1]])
}





let rtmFunction  = async () => {
    rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({uid: UID, TOKEN})

    
    await rtmClient.addOrUpdateLocalUserAttributes({'name' : displayName})
    

    channel = await rtmClient.createChannel(roomId)
    await channel.join()


    channel.on('MemberJoined', handleMemberJoined)
    channel.on('MemberLeft', handleMemberLeft)
    channel.on('ChannelMessage', handleChannelMessage)
    getMembers()
    addBotMessageToDom(`Welcome ${displayName} 😀`)
}


let switchToCamera = async () => {
    let player = `<div class="video-container" id="user-container-${UID}">
                  <div class="video-player" id="user-${UID}">
                  </div>
                </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)

    document.getElementById('mic-btn').classList.remove('active')
    document.getElementById('camera-btn').classList.remove('active')

    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[1]])
}


let handleUserJoined = async (user, mediaType) => {
    remoteUser[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }


        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}">
                        </div> 
                 </div>`
                 
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
          }else if (mediaType === 'audio'){
              user.audioTrack.play()
          }else{
            null
          }
    
  
}

let handleUserLeft = async (user) => {
    delete remoteUser[user.uid]
    try{
        document.getElementById(`user-container-${user.uid}`).remove()
    }catch(e){
        console.log('Error: ', e.toString())
    }
}



let grantAdminAccess = async (event, uid) => {
  let memberId = event.target.id.split('_')[1]
  await rtmClient.addOrUpdateChannelAttributes(roomId, { [uid.memberId]: 'admin' });
  console.log('Admin access granted to:', uid.memberId);
}


let leaveAndRemoveLocalStream = async () => {
  leaveChannel()
  sessionStorage.removeItem('display_username')
  window.location = 'broadcast_index.html'
}


let initVolumeIndicator = () => {
  AgoraRTC.setParameter('AUDIO_VOLUME_INDICATION_INTERVAL', 100)
  client.enableAudioVolumeIndicator()

  client.on('volume-indicator', volumes => {
      volumes.forEach((volume) => {
          try{
              let item = document.getElementsByClassName(`user-talk-${volume.uid}`)[0]

          if(volume.level >=25){
              item.style.color = "#00ff00"
          }else if(volume.level <= 24){
              item.style.color = "transparent"
          }
          }catch(error){
              console.log('Error Message:', error)
          }
      })
  })
}


let leaveAudienceRoom = async () => {
  window.location = 'broadcast_index.html'
}



let toggleScreen = async (e) => {
    let screenButton = e.currentTarget
    let cameraButton = document.getElementById('camera-btn')

    if(!sharingScreen){
        sharingScreen = true
        screenButton.classList.add('active')
        cameraButton.classList.remove('active')
        cameraButton.style.display = 'none'


        localScreenTracks = await AgoraRTC.createScreenVideoTrack()
        document.getElementById(`user-container-${UID}`).remove()

        player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}">
                        </div> 
                 </div>`

        displayFrame.style.display = 'block'
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        localScreenTracks.play(`user-${UID}`)

        await client.unpublish([localTracks[1]])
        await client.publish([localScreenTracks])
    }else{
        sharingScreen = false
        cameraButton.style.display = 'block'
        document.getElementById(`user-container-${UID}`).remove()
        await client.unpublish([localScreenTracks])

        switchToCamera()
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
  };


  let closeUserList = (e) => {
    let button = e.currentTarget
    let closeBtn = document.getElementById('list-of-audience')
    let openBtn = document.getElementById('open-list')

    
    button.style.display = 'none'
    closeBtn.style.display = 'none'
    openBtn.style.display = 'flex'
  }

  let openUserList = (e) => {
    let button = e.currentTarget
    let closeBtn = document.getElementById('list-of-audience')
    let openBtn = document.getElementById('open-list')
    let closeList = document.getElementById('close-list')

    
    button.style.display = 'block'
    closeBtn.style.display = 'block'
    closeList.style.display = 'block'
    openBtn.style.display = 'none'
  }


  let closeMessageContainer = (e) => {
    let button = e.currentTarget
    let closeBtn = document.getElementById('close-message-container')
    let openBtn = document.getElementById('open-message-container')
    let message = document.getElementById('message-cover')


    button.style.display = 'none'
    closeBtn.style.display = 'none'
    openBtn.style.display = 'flex'
    message.style.display = 'none'
  }


  let openMessageContainer = (e) => {
    let button = e.currentTarget
    let closeBtn = document.getElementById('close-message-container')
    let openBtn = document.getElementById('open-message-container')
    let message = document.getElementById('message-cover')


    button.style.display = 'flex'
    closeBtn.style.display = 'flex'
    openBtn.style.display = 'none'
    message.style.display = 'flex'
  }

  let closeUserMoreOptionsList = () => {
    let optionClass = document.getElementById('more_user_options')

    optionClass.style.display = 'none'
  }


  


document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('audience-leave-btn').addEventListener('click', leaveAudienceRoom)
document.getElementById('screen-share-btn').addEventListener('click', toggleScreen)
document.getElementById('copy-btn').addEventListener('click', copyRoomId)
document.getElementById('close-list').addEventListener('click', closeUserList)
document.getElementById('open-list').addEventListener('click', openUserList)
document.getElementById('close-message-container').addEventListener('click', closeMessageContainer)
document.getElementById('open-message-container').addEventListener('click', openMessageContainer)
document.getElementById('close_user_options').addEventListener('click', closeUserMoreOptionsList)
document.getElementById('promote').addEventListener('click', grantAdminAccess)


joinAndDisplayLocalStream()