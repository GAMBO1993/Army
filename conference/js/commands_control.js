// These variables should be saved in firebase to avoid theft and unauthorized access

var kickUser = '##KickUser##Out';
var muteUser = '##MuteUser##Out';
var muteVideo = '##MuteUserVideo##Out';
var muteAllUserAudio = '##MuteAll##User#Audio';
var muteAllUserVideo = '##MuteAllUser#Video';
var blockUser = '##BlockUserFrom##TheChannel#';

var appID = 'd07c340f51c94e068f47d2cd5ededf68';
var userDisplayName = sessionStorage.getItem('displayName');
var userActualRole = sessionStorage.getItem('role');
var hiddenToken = null

let gotToConferencePage = () => {
    // window.location = 'conference_index.html'
    window.location = '/'
}
