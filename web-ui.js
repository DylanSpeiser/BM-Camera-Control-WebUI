/*      Blackmagic Camera Control WebUI
        WebUI Script functions
        (c) Dylan Speiser 2024              
        github.com/DylanSpeiser
*/


/* Global variables */
var cameras = [];       // Array to store all of the camera objects
var ci = 0;             // Index into this array for the currently selected camera.
// cameras[ci] is used to reference the currently selected camera object

var WBMode = 0;         // 0: balance, 1: tint

// Set everything up
function bodyOnLoad() {
    // Initialize timers
    let intervalIDOne = setInterval(timerCallFunction1, 1000); // One second timer for refreshing record / timecode
    let intervalIDTen = setInterval(timerCallFunction10, 10000); // Ten second timer for refreshing everything

    // Pass along the UI refreshing methods to the BMDCamera class
    BMDCamera.updateUIAll = updateUIAll;
    BMDCamera.updateUIname = updateUIname;
    BMDCamera.updateUIhostname = updateUIhostname;
    BMDCamera.updateUIFormat = updateUIFormat;
    BMDCamera.updateUITransportMode = updateUITransportMode;
    BMDCamera.updateUIPlaybackState = updateUIPlaybackState;
    BMDCamera.updateUIRecordState = updateUIRecordState;
    BMDCamera.updateUITimecode = updateUITimecode;
    BMDCamera.updateUIPresets = updateUIPresets;
    BMDCamera.updateUIActivePreset = updateUIActivePreset;
    BMDCamera.updateUIAperture = updateUIAperture;
    BMDCamera.updateUIZoom = updateUIZoom;
    BMDCamera.updateUIFocus = updateUIFocus;
    BMDCamera.updateUIISO = updateUIISO;
    BMDCamera.updateUIgain = updateUIgain;
    BMDCamera.updateUIWhiteBalance = updateUIWhiteBalance;
    BMDCamera.updateUINDStop = updateUINDStop;
    BMDCamera.updateUIshutter = updateUIshutter;
    BMDCamera.updateUIAutoExposureMode = updateUIAutoExposureMode;
    BMDCamera.updateUIColorCorrection = updateUIColorCorrection;
    BMDCamera.updateUILinks = updateUILinks;
}

// Basically a wrapper for BMDCamera() constructor
// Checks the hostname, if it replies successfully then a new BMDCamera object
//  is made and gets put in the array at ind
function initCamera(hostname) {
    // Check if the hostname is valid
    sendRequest("GET", "http://"+hostname+"/control/api/v1/system","").then((response) => {
        if (response.status < 300) {
            // Success, make a new camera, get all relevant info, and populate the UI
            cameras[ci] = new BMDCamera(hostname);
            cameras[ci].getAllInfo();
            document.getElementById("connectionErrorSpan").innerHTML = "Connected.";
            document.getElementById("connectionErrorSpan").setAttribute("style","color: #6e6e6e;");
        } else {
            // Something has gone wrong, tell the user
            document.getElementById("connectionErrorSpan").innerHTML = response.statusText;
        }
    }).catch(error => {
        // Something has gone wrong, tell the user
        document.getElementById("connectionErrorSpan").title = error;
        document.getElementById("connectionErrorSpan").innerHTML = "Error "+error.code+": "+error.name+" (Your hostname is probably incorrect, hover for more details)";
    });

}

// Important refreshing function. Gets all of the camera's info and populates the UI with it.
// This function controls the visibility of the "Refreshing..." text in the bottom right corner.
function refresh() {
    document.getElementById("refreshingText").classList.add("refreshing");
    cameras[ci].getAllInfo().then(() => {
            document.getElementById("refreshingText").classList.remove("refreshing");
        }
    ); 
}

// =============================== UI Updaters ==================================
// ==============================================================================

function updateUIAll() {
    updateUIname();
    updateUIhostname();
    updateUIFormat();
    updateUITransportMode();
    updateUIPlaybackState();
    updateUIRecordState();
    updateUITimecode();
    updateUIPresets();
    updateUIActivePreset();
    updateUIAperture();
    updateUIZoom();
    updateUIFocus();
    updateUIISO();
    updateUIgain();
    updateUIWhiteBalance();
    updateUINDStop();
    updateUIshutter();
    updateUIAutoExposureMode();
    updateUIColorCorrection();
    updateUILinks();
}

function updateUIname() {
    document.getElementById("cameraName").innerHTML = cameras[ci].name;
}

function updateUIhostname() {
    document.getElementById("hostnameInput").value = cameras[ci].hostname;
}

function updateUIFormat() {
    document.getElementById("formatCodec").innerHTML = cameras[ci].format.codec.toUpperCase().replace(":"," ").replace("_",":");
    
    let resObj = cameras[ci].format.recordResolution;
    document.getElementById("formatResolution").innerHTML = resObj.width + "x" + resObj.height;
    document.getElementById("formatFPS").innerHTML = cameras[ci].format.frameRate+" fps";
}

function updateUITransportMode() {
    //TBI
}

function updateUIPlaybackState() {
    //TBI
}

function updateUIRecordState() {
    if (cameras[ci].recordState.recording) {
        document.getElementById("cameraControlHeadContainer").classList.add("liveCam");
        document.getElementById("cameraControlExpandedHeadContainer").classList.add("liveCam");
    } else {
        document.getElementById("cameraControlHeadContainer").classList.remove("liveCam");
        document.getElementById("cameraControlExpandedHeadContainer").classList.remove("liveCam");
    }
}

function updateUITimecode() {
    var tcString = parseInt(cameras[ci].timecode.timecode.toString(16),10).toString().padStart(8,'0').match(/.{1,2}/g).join(':');

    document.getElementById("timecodeLabel").innerHTML = tcString;
}

function updateUIPresets() {
    var presetsList = document.getElementById("presetsDropDown");

    presetsList.innerHTML = "";

    cameras[ci].presets.forEach((presetItem) => {
        let presetName = presetItem.split('.', 1);

        let textNode = document.createTextNode(presetName);
        let optionNode = document.createElement("option");
        optionNode.setAttribute("name", "presetOption"+presetName);
        optionNode.appendChild(textNode);
        document.getElementById("presetsDropDown").appendChild(optionNode);
    });
}

function updateUIActivePreset() {
    var presetsList = document.getElementById("presetsDropDown");

    presetsList.childNodes.forEach((child) => {
        if (child.nodeName == 'OPTION' && child.value == cameras[ci].activePreset) {
            child.selected=true
        } else {
            child.selected=false
        }
    })
}

function updateUIAperture() {
    document.getElementById("irisRange").value = cameras[ci].apertureNormalised;
    document.getElementById("apertureStopsLabel").innerHTML = cameras[ci].apertureStop.toFixed(1);
}

function updateUIZoom() {
    document.getElementById("zoomRange").value = cameras[ci].zoomNormalised;
    document.getElementById("zoomMMLabel").innerHTML = cameras[ci].zoomMM +"mm";
}

function updateUIFocus() {
    document.getElementById("focusRange").value = cameras[ci].focusNormalised;
}

function updateUIISO() {
    document.getElementById("ISOInput").value = cameras[ci].ISO;
}

function updateUIgain() {
    var gainString = "";

    if (cameras[ci].gain >= 0) {
        gainString = "+"+cameras[ci].gain+"db"
    } else {
        gainString = cameras[ci].gain+"db"
    }

    document.getElementById("gainSpan").innerHTML = gainString;
}

function updateUIWhiteBalance() {
    document.getElementById("whiteBalanceSpan").innerHTML = cameras[ci].WhiteBalance+"K";
    document.getElementById("whiteBalanceTintSpan").innerHTML = cameras[ci].WhiteBalanceTint;
}

function updateUINDStop() {
    document.getElementById("ndFilterSpan").innerHTML = cameras[ci].NDStop;
    if (cameras[ci].UnimplementedFunctionality.includes("/video/ndFilter")) {
        document.getElementById("ndFilterSpan").innerHTML = 0;
        document.getElementById("ndFilterSpan").disabled = true;
    }
}

function updateUIshutter() {
    var shutterString = ""

    if ('shutterSpeed' in cameras[ci].shutter) {
        shutterString = "1/"+cameras[ci].shutter.shutterSpeed
    } else {
        var shangleString = (cameras[ci].shutter.shutterAngle / 100).toFixed(1).toString()
        if (shangleString.indexOf(".0") > 0) {
            shutterString = parseFloat(shangleString).toFixed(0)+"°";
        } else {
            shutterString = shangleString+"°";
        }
    }

    document.getElementById("shutterSpan").innerHTML = shutterString;
}

function updateUIAutoExposureMode() {
    let AEmodeSelect = document.getElementById("AEmodeDropDown");
    let AEtypeSelect = document.getElementById("AEtypeDropDown");

    AEmodeSelect.value = cameras[ci].AutoExposureMode.mode;
    AEtypeSelect.value = cameras[ci].AutoExposureMode.type;
}

function updateUIColorCorrection() {
    // Lift
    document.getElementsByClassName("CClumaLabel")[0].innerHTML = cameras[ci].CClift.luma.toFixed(2);
    document.getElementsByClassName("CCredLabel")[0].innerHTML = cameras[ci].CClift.red.toFixed(2);
    document.getElementsByClassName("CCgreenLabel")[0].innerHTML = cameras[ci].CClift.green.toFixed(2);
    document.getElementsByClassName("CCblueLabel")[0].innerHTML = cameras[ci].CClift.blue.toFixed(2);

    // Gamma
    document.getElementsByClassName("CClumaLabel")[1].innerHTML = cameras[ci].CCgamma.luma.toFixed(2);
    document.getElementsByClassName("CCredLabel")[1].innerHTML = cameras[ci].CCgamma.red.toFixed(2);
    document.getElementsByClassName("CCgreenLabel")[1].innerHTML = cameras[ci].CCgamma.green.toFixed(2);
    document.getElementsByClassName("CCblueLabel")[1].innerHTML = cameras[ci].CCgamma.blue.toFixed(2);

    // Gain
    document.getElementsByClassName("CClumaLabel")[2].innerHTML = cameras[ci].CCgain.luma.toFixed(2);
    document.getElementsByClassName("CCredLabel")[2].innerHTML = cameras[ci].CCgain.red.toFixed(2);
    document.getElementsByClassName("CCgreenLabel")[2].innerHTML = cameras[ci].CCgain.green.toFixed(2);
    document.getElementsByClassName("CCblueLabel")[2].innerHTML = cameras[ci].CCgain.blue.toFixed(2);

    // Offset
    document.getElementsByClassName("CClumaLabel")[3].innerHTML = cameras[ci].CCoffset.luma.toFixed(2);
    document.getElementsByClassName("CCredLabel")[3].innerHTML = cameras[ci].CCoffset.red.toFixed(2);
    document.getElementsByClassName("CCgreenLabel")[3].innerHTML = cameras[ci].CCoffset.green.toFixed(2);
    document.getElementsByClassName("CCblueLabel")[3].innerHTML = cameras[ci].CCoffset.blue.toFixed(2);

    // Contrast
    document.getElementById("CCcontrastPivotRange").value = cameras[ci].CCcontrast.pivot;
    document.getElementById("CCcontrastPivotLabel").innerHTML = cameras[ci].CCcontrast.pivot.toFixed(2);
    document.getElementById("CCcontrastAdjustRange").value = cameras[ci].CCcontrast.adjust;
    document.getElementById("CCcontrastAdjustLabel").innerHTML = cameras[ci].CCcontrast.adjust.toFixed(2);
    
    // Color
    document.getElementById("CChueRange").value = cameras[ci].CCcolor.hue;
    document.getElementById("CCcolorHueLabel").innerHTML = cameras[ci].CCcolor.hue.toFixed(2);
    
    document.getElementById("CCsaturationRange").value = cameras[ci].CCcolor.saturation;
    document.getElementById("CCcolorSatLabel").innerHTML = cameras[ci].CCcolor.saturation.toFixed(2);

    document.getElementById("CClumaContributionRange").value = cameras[ci].CClumacontribution.lumaContribution;
    document.getElementById("CCcolorLCLabel").innerHTML = cameras[ci].CClumacontribution.lumaContribution.toFixed(2);
}

function updateUILinks() {
    document.getElementById("documentationLink").href = "http://"+cameras[ci].hostname+"/control/documentation.html";
    document.getElementById("mediaManagerLink").href = "http://"+cameras[ci].hostname;
}


// ==============================================================================


// One Second Timer Call
// Only updates rec/play state and timecode
function timerCallFunction1() {
    if (cameras[ci]) {
        cameras[ci].getRecordState();
        cameras[ci].getPlaybackState();
        cameras[ci].getTimecode();
    }
}

// Ten Second Timer Call
// Refreshes all elements
function timerCallFunction10() {
    if (cameras[ci]) {
        refresh();
    }
}

// Called when the user changes tabs to a different camera
function switchCamera(index) {
    ci = index;

    if (cameras[ci]) {
        refresh();
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

// For not-yet-implemented Color Correction UI
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

// Allows for changing WB/Tint displayed in the UI
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

// Triggered by the button by those text boxes. Reads the info from the inputs and sends it to the camera.
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

/*  Control Calling Functions   */
/*    Makes the HTML cleaner.   */

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
        if (inputString.indexOf("1/") >= 0) {
            cam.setShutter({"shutterSpeed" :parseInt(inputString.substring(2))});
        } else {
            cam.setShutter({"shutterSpeed" :parseInt(inputString)});
        }
        
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

// Reset Color Correction Values
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