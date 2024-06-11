/* Global variables */
var cameras = [];
var ci = 0;

function bodyOnLoad() {
    //let intervalID = setInterval(timerCallFunction, 1000);

    let newCamHostname = document.getElementsByClassName("hostnameInput")[ci].value;

    if (newCamHostname) {
        cameras[ci] = new BMDCamera(newCamHostname,ci);
    }
}

// function timerCallFunction() {
//     cameras.forEach((camera) => camera.everySecond());
// }

function textInputTrigger(element) {
    if (event.key === 'Enter') {
        cameras[ci] = new BMDCamera(element.value, ci);
    }
}

function makeFakeCamera() {
    cam = new BMDCamera("Studio-Camera-6K-Pro.local",0) 
    return Object.assign(cam,{
        "name": "Studio Camera 6K Pro",
        "hostname": "Studio-Camera-6K-Pro.local",
        "APIAddress": "http://Studio-Camera-6K-Pro.local/control/api/v1",
        "index": 0,
        "transportMode": {
            "mode": "InputPreview"
        },
        "isPlaying": false,
        "playbackState": {
            "loop": false,
            "position": 0,
            "singleClip": false,
            "speed": 0,
            "type": "Play"
        },
        "recordState": {
            "recording": false
        },
        "timecode": {
            "clip": 0,
            "timecode": 289550880,
            "source": "Clip"
        },
        "presets": {
            "presets": []
        },
        "activePreset": "default",
        "apertureStop": 4.400000095367432,
        "apertureNormalised": 0.021739130839705467,
        "zoomMM": 18,
        "zoomNormalised": 0,
        "focusNormalised": 0.5,
        "ISO": 400,
        "gain": 0,
        "NDStop": 0,
        "NDMode": "Fraction",
        "shutter": {
            "continuousShutterAutoExposure": false,
            "shutterSpeed": 50
        },
        "AutoExposureMode": {
            "mode": "Off",
            "type": ""
        },
        "CClift": {
            "blue": 0,
            "green": 0,
            "luma": 0,
            "red": 0
        },
        "CCgamma": {
            "blue": 0,
            "green": 0,
            "luma": 0,
            "red": 0
        },
        "CCgain": {
            "blue": 1,
            "green": 1,
            "luma": 1,
            "red": 1
        },
        "CCoffset": {
            "blue": 0,
            "green": 0,
            "luma": 0,
            "red": 0
        },
        "CCcontrast": {
            "adjust": 1,
            "pivot": 0.5
        },
        "CCcolor": {
            "hue": 0,
            "saturation": 1
        },
        "CClumacontribution": {
            "lumaContribution": 1
        },
        "WhiteBalance": 5600,
        "WhiteBalanceTint": 0
    })
}