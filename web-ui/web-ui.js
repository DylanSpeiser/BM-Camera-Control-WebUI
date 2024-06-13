/* Global variables */
var cameras = [];
var ci = 0;
var ccMode = 0;

function bodyOnLoad() {
    let intervalIDOne = setInterval(timerCallFunction1, 1000); // Tem second timer for refreshing everything
    let intervalIDTen = setInterval(timerCallFunction10, 10000); // Tem second timer for refreshing everything

    let newCamHostname = document.getElementById("hostnameInput").value;

    if (newCamHostname) {
        cameras[ci] = new BMDCamera(newCamHostname,ci);
    }
}

// One Second Timer Call
function timerCallFunction1() {
    if (cameras[ci]) {
        cameras[ci].getRecordState();
        cameras[ci].getPlaybackState();
        cameras[ci].getTimecode();
    
        cameras[ci].updateUIRecordState();
        cameras[ci].updateUIPlaybackState();
        cameras[ci].updateUITimecode();
    }
}

// Ten Second Timer Call
function timerCallFunction10() {
    if (cameras[ci]) {
        cameras[ci].refresh();
    }
}

function textInputTrigger(element) {
    if (event.key === 'Enter') {
        cameras[ci] = new BMDCamera(element.value, ci);
    }
}

function switchCamera(index) {
    ci = index;

    if (cameras[ci]) {
        cameras[ci].refresh();
    }

    for (var i = 0; i < 8; i++) {
        if (i == ci) {
            document.getElementsByClassName("cameraSwitchLabel")[i].classList.add("selectedCam");
        } else {
            document.getElementsByClassName("cameraSwitchLabel")[i].classList.remove("selectedCam");
        }
    }

    document.getElementById("cameraNumberLabel").innerHTML = "CAM"+(ci+1);
}

function setCCMode(mode) {
    if (mode == 0) {
        // Lift

    } else if (mode == 1) {
        // Gamma

    } else {
        // Gain

    }

    for (var i = 0; i < 3; i++) {
        if (i == mode) {
            document.getElementsByClassName("ccTabLabel")[i].classList.add("selectedTab");
        } else {
            document.getElementsByClassName("ccTabLabel")[i].classList.remove("selectedTab");
        }
    }
}

/* Control Calling Functions */

function decreaseND() {
    cameras[ci].setND(cameras[ci].NDStop-2);
}

function increaseND() {
    cameras[ci].setND(cameras[ci].NDStop+2);
}

function decreaseGain() {
    cameras[ci].setGain(cameras[ci].gain-2);
}

function increaseGain() {
    cameras[ci].setGain(cameras[ci].gain+2);
}

function decreaseShutter() {
    let cam = cameras[ci];

    if ('shutterSpeed' in cam.shutter) {
        cam.setShutter({"shutterSpeed":cam.shutter.shutterSpeed+10});
    } else {
        cam.setShutter({"shutterAngle": cam.shutter.shutterAngle-1000});
    }
}

function increaseShutter() {
    let cam = cameras[ci];

    if ('shutterSpeed' in cam.shutter) {
        cam.setShutter({"shutterSpeed":cam.shutter.shutterSpeed-10});
    } else {
        cam.setShutter({"shutterAngle": cam.shutter.shutterAngle+1000});
    }
}

function decreaseWhiteBalance() {
    cameras[ci].setWhiteBalance(cameras[ci].WhiteBalance-50,cameras[ci].WhiteBalanceTint);
}

function increaseWhiteBalance() {
    cameras[ci].setWhiteBalance(cameras[ci].WhiteBalance+50,cameras[ci].WhiteBalanceTint);
}

// 0: lift, 1: gamma, 2: gain, 3: offset
function setCCFromUI(which) {
    let lumaFloat = parseFloat(document.getElementsByClassName("CClumaLabel")[which].innerHTML);
    let redFloat = parseFloat(document.getElementsByClassName("CCredLabel")[which].innerHTML);
    let greenFloat = parseFloat(document.getElementsByClassName("CCgreenLabel")[which].innerHTML);
    let blueFloat = parseFloat(document.getElementsByClassName("CCblueLabel")[which].innerHTML);
    
    let ccobject = {"red": redFloat, "green": greenFloat, "blue": blueFloat, "luma": lumaFloat};

    if (which == 0) {
        cameras[ci].setCCLift(ccobject);
    } else if (which == 1) {
        cameras[ci].setCCGamma(ccobject);
    } else if (which == 2) {
        cameras[ci].setCCGain(ccobject);
    } else {
        cameras[ci].setCCOffset(ccobject);
    }
}

// 0: lift, 1: gamma, 2: gain, 3: offset
function resetCC(which) {
    if (which == 0) {
        cameras[ci].setCCLift({"red": 0.0, "green": 0.0, "blue": 0.0, "luma": 0.0});
    } else if (which == 1) {
        cameras[ci].setCCGamma({"red": 0.0, "green": 0.0, "blue": 0.0, "luma": 0.0});
    } else if (which == 2) {
        cameras[ci].setCCGain({"red": 1.0, "green": 1.0, "blue": 1.0, "luma": 1.0});
    } else {
        cameras[ci].setCCOffset({"red": 0.0, "green": 0.0, "blue": 0.0, "luma": 0.0});
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