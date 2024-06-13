/* Global variables */
var cameras = [];
var ci = 0;
var WBMode = 0; // 0: balance, 1: tint


function bodyOnLoad() {
    let intervalIDOne = setInterval(timerCallFunction1, 1000); // Tem second timer for refreshing everything
    let intervalIDTen = setInterval(timerCallFunction10, 10000); // Tem second timer for refreshing everything

    let newCamHostname = document.getElementById("hostnameInput").value;

    if (newCamHostname) {
        initCamera(newCamHostname, ci);
    }
}

function initCamera(hostname, ind) {
    sendRequest("GET", "http://"+hostname+"/control/api/v1/system","").then((response) => {
        if (response.status < 300) {
            cameras[ci] = new BMDCamera(hostname, ind);
            document.getElementById("connectionErrorSpan").innerHTML = "";
        } else {
            document.getElementById("connectionErrorSpan").innerHTML = response.statusText;
        }
    }).catch(error => {
        document.getElementById("connectionErrorSpan").title = error;
        document.getElementById("connectionErrorSpan").innerHTML = "Error "+error.code+": "+error.name+" (Your hostname is probably incorrect, hover for more details)";
    });

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
    document.getElementById("cameraName").innerHTML = "CAMERA NAME";
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

function swapWBMode() {
    if (WBMode == 0) {
        // Balance
        document.getElementById("WBLabel").innerHTML = "TINT";
        document.getElementById("WBValueContainer").classList.add("dNone");
        document.getElementById("WBTintValueContainer").classList.remove("dNone");
        
        WBMode = 1;
    } else {
        //Tint
        document.getElementById("WBLabel").innerHTML = "BALANCE";
        document.getElementById("WBValueContainer").classList.remove("dNone");
        document.getElementById("WBTintValueContainer").classList.add("dNone");

        WBMode = 0;
    }
}

function manualAPICall() {
    const requestRadioGET = document.getElementById("requestTypeGET");

    const requestEndpointText = document.getElementById("manualRequestEndpointLabel").value;
    let requestData = "";

    try {
        requestData = JSON.parse(document.getElementById("manualRequestBodyLabel").value);
    } catch (err) {
        document.getElementById("manualRequestResponseP").innerHTML = err;
    }

    const requestMethod = (requestRadioGET.checked ? "GET" : "PUT");
    const requestURL = cameras[ci].APIAddress+requestEndpointText;

    sendRequest(requestMethod,requestURL,requestData).then((response) => {
        // console.log("Manual API Call Response: ", response);
        if (!response.status) {
            document.getElementById("manualRequestResponseP").innerHTML = JSON.stringify(response);
        } else {
            document.getElementById("manualRequestResponseP").innerHTML = response.status+": "+response.statusText;
        }
        
    });
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

function handleShutterInput(inputString) {
    let cam = cameras[ci];

    if ('shutterSpeed' in cam.shutter) {
        cam.setShutter({"shutterSpeed" :parseInt(inputString)});
    } else {
        cam.setShutter({"shutterAngle": parseInt(parseFloat(inputString)*100)});
    }
}

function decreaseWhiteBalance() {
    cameras[ci].setWhiteBalance(cameras[ci].WhiteBalance-50,cameras[ci].WhiteBalanceTint);
}

function increaseWhiteBalance() {
    cameras[ci].setWhiteBalance(cameras[ci].WhiteBalance+50,cameras[ci].WhiteBalanceTint);
}

function decreaseWhiteBalanceTint() {
    cameras[ci].setWhiteBalance(cameras[ci].WhiteBalance,cameras[ci].WhiteBalanceTint-1);
}

function increaseWhiteBalanceTint() {
    cameras[ci].setWhiteBalance(cameras[ci].WhiteBalance,cameras[ci].WhiteBalanceTint+1);
}

function AEmodeInputHandler() {
    let AEmode = document.getElementById("AEmodeDropDown").value;
    let AEtype = document.getElementById("AEtypeDropDown").value;

    cameras[ci].setAutoExposureMode({mode: AEmode, type: AEtype});
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

// 0: lift, 1: gamma, 2: gain, 3: offset, 4: contrast, 5: color & LC
function resetCC(which) {
    if (which == 0) {
        cameras[ci].setCCLift({"red": 0.0, "green": 0.0, "blue": 0.0, "luma": 0.0});
    } else if (which == 1) {
        cameras[ci].setCCGamma({"red": 0.0, "green": 0.0, "blue": 0.0, "luma": 0.0});
    } else if (which == 2) {
        cameras[ci].setCCGain({"red": 1.0, "green": 1.0, "blue": 1.0, "luma": 1.0});
    } else if (which == 3) {
        cameras[ci].setCCOffset({"red": 0.0, "green": 0.0, "blue": 0.0, "luma": 0.0});
    } else if (which == 4) {
        cameras[ci].setCCContrast({"pivot": 0.5, "adjust": 1.0});
    } else if (which == 5) {
        cameras[ci].setCCColor({"hue": 0.0, "saturation": 1.0});
        cameras[ci].setCCLumaContribuion({"lumaContribution": 1.0});
    }
}


/* Cookie Setting functions from StackOverflow :P */
function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires="";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}