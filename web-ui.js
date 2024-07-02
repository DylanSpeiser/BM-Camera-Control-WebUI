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

var defaultControlsHTML;

// Set everything up
function bodyOnLoad() {
    defaultControlsHTML = document.getElementById("allCamerasContainer").innerHTML;
}

// Checks the hostname, if it replies successfully then a new BMCamera object
//  is made and gets put in the array at ind
function initCamera() {
    // Get hostname from Hostname text field
    let hostname = document.getElementById("hostnameInput").value;

    try {
        // Check if the hostname is valid
        let response = sendRequest("GET", "http://"+hostname+"/control/api/v1/system","");

        if (response.status < 300) {
            // Success, make a new camera, get all relevant info, and populate the UI
            cameras[ci] = new BMCamera(hostname);

            cameras[ci].updateUI = updateUIAll;

            cameras[ci].active = true;

            document.getElementById("connectionErrorSpan").innerHTML = "Connected.";
            document.getElementById("connectionErrorSpan").setAttribute("style","color: #6e6e6e;");
        } else {
            // Something has gone wrong, tell the user
            document.getElementById("connectionErrorSpan").innerHTML = response.statusText;
        }
    } catch (error) {
        // Something has gone wrong, tell the user
        document.getElementById("connectionErrorSpan").title = error;
        document.getElementById("connectionErrorSpan").innerHTML = "Error "+error.code+": "+error.name+" (Your hostname is probably incorrect, hover for more details)";
    }

}

// =============================== UI Updater ==================================
// =============================================================================

function updateUIAll() {
    // ========== Camera Name ==========

    document.getElementById("cameraName").innerHTML = cameras[ci].name;

    // ========== Hostname ==========

    document.getElementById("hostnameInput").value = cameras[ci].hostname;

    // ========== Format ==========

    document.getElementById("formatCodec").innerHTML = cameras[ci].propertyData['/system/format']?.codec.toUpperCase().replace(":"," ").replace("_",":");
    
    let resObj = cameras[ci].propertyData['/system/format']?.recordResolution;
    document.getElementById("formatResolution").innerHTML = resObj?.width + "x" + resObj?.height;
    document.getElementById("formatFPS").innerHTML = cameras[ci].propertyData['/system/format']?.frameRate+" fps";

    // ========== Recording State ==========

    if (cameras[ci].propertyData['/transports/0/record']?.recording) {
        document.getElementById("cameraControlHeadContainer").classList.add("liveCam");
        document.getElementById("cameraControlExpandedHeadContainer").classList.add("liveCam");
    } else {
        document.getElementById("cameraControlHeadContainer").classList.remove("liveCam");
        document.getElementById("cameraControlExpandedHeadContainer").classList.remove("liveCam");
    }

    // ========== Timecode ==========

    document.getElementById("timecodeLabel").innerHTML = parseTimecode(cameras[ci].propertyData['/transports/0/timecode']?.timecode);

    // ========== Presets Dropdown ==========
    
    var presetsList = document.getElementById("presetsDropDown");

    presetsList.innerHTML = "";

    cameras[ci].propertyData['/presets']?.presets.forEach((presetItem) => {
        let presetName = presetItem.split('.', 1);

        let textNode = document.createTextNode(presetName);
        let optionNode = document.createElement("option");
        optionNode.setAttribute("name", "presetOption"+presetName);
        optionNode.appendChild(textNode);
        document.getElementById("presetsDropDown").appendChild(optionNode);
    });

    // ========== Active Preset ==========

    var presetsList = document.getElementById("presetsDropDown");

    presetsList.childNodes.forEach((child) => {
        if (child.nodeName == 'OPTION' && child.value == cameras[ci].propertyData['/presets/active']?.preset) {
            child.selected=true
        } else {
            child.selected=false
        }
    })

    // ========== Iris ==========

    document.getElementById("irisRange").value = cameras[ci].propertyData['/lens/iris']?.normalised;
    document.getElementById("apertureStopsLabel").innerHTML = cameras[ci].propertyData['/lens/iris']?.apertureStop.toFixed(1);

    // ========== Zoom ==========

    document.getElementById("zoomRange").value = cameras[ci].propertyData['/lens/zoom']?.normalised;
    document.getElementById("zoomMMLabel").innerHTML = cameras[ci].propertyData['/lens/zoom']?.focalLength +"mm";

    // ========== Focus ==========

    document.getElementById("focusRange").value = cameras[ci].propertyData['/lens/focus']?.normalised;

    // ========== ISO ==========

    if (cameras[ci].propertyData['/video/iso'])
        document.getElementById("ISOInput").value = cameras[ci].propertyData['/video/iso']?.iso;

    // ========== GAIN ==========

    let gainString = "";
    let gainInt = cameras[ci].propertyData['/video/gain']?.gain

    if (gainInt >= 0) {
        gainString = "+"+gainInt+"db"
    } else {
        gainString = gainInt+"db"
    }

    document.getElementById("gainSpan").innerHTML = gainString;

    // ========== WHITE BALANCE ===========

    document.getElementById("whiteBalanceSpan").innerHTML = cameras[ci].propertyData['/video/whiteBalance']?.whiteBalance+"K";
    document.getElementById("whiteBalanceTintSpan").innerHTML = cameras[ci].propertyData['/video/whiteBalanceTint']?.whiteBalanceTint;

    // =========== ND =============

    if (cameras[ci].propertyData['/video/ndFilter']) {
        document.getElementById("ndFilterSpan").innerHTML = cameras[ci].propertyData['/video/ndFilter']?.stop;
    } else {
        document.getElementById("ndFilterSpan").innerHTML = 0;
        document.getElementById("ndFilterSpan").disabled = true;
    }

    // ============ Shutter =====================

    let shutterString = "SS"
    let shutterObj = cameras[ci].propertyData['/video/shutter'];

    if (shutterObj?.shutterSpeed) {
        shutterString = "1/"+shutterObj.shutterSpeed
    } else if (shutterObj?.shutterAngle) {
        var shangleString = (shutterObj.shutterAngle / 100).toFixed(1).toString()
        if (shangleString.indexOf(".0") > 0) {
            shutterString = parseFloat(shangleString).toFixed(0)+"°";
        } else {
            shutterString = shangleString+"°";
        }
    }

    document.getElementById("shutterSpan").innerHTML = shutterString;

    // =========== Auto Exposure Mode ===========

    let AEmodeSelect = document.getElementById("AEmodeDropDown");
    let AEtypeSelect = document.getElementById("AEtypeDropDown");

    AEmodeSelect.value = cameras[ci].propertyData['/video/autoExposure']?.mode;
    AEtypeSelect.value = cameras[ci].propertyData['/video/autoExposure']?.type;

    // =========== COLOR CORRECTION =============

    // Lift
    let liftProps = cameras[ci].propertyData['/colorCorrection/lift'];
    document.getElementsByClassName("CClumaLabel")[0].innerHTML = liftProps?.luma.toFixed(2);
    document.getElementsByClassName("CCredLabel")[0].innerHTML = liftProps?.red.toFixed(2);
    document.getElementsByClassName("CCgreenLabel")[0].innerHTML = liftProps?.green.toFixed(2);
    document.getElementsByClassName("CCblueLabel")[0].innerHTML = liftProps?.blue.toFixed(2);

    // Gamma
    let gammaProps = cameras[ci].propertyData['/colorCorrection/gamma'];
    document.getElementsByClassName("CClumaLabel")[1].innerHTML = gammaProps?.luma.toFixed(2);
    document.getElementsByClassName("CCredLabel")[1].innerHTML = gammaProps?.red.toFixed(2);
    document.getElementsByClassName("CCgreenLabel")[1].innerHTML = gammaProps?.green.toFixed(2);
    document.getElementsByClassName("CCblueLabel")[1].innerHTML = gammaProps?.blue.toFixed(2);

    // Gain
    let gainProps = cameras[ci].propertyData['/colorCorrection/gain'];
    document.getElementsByClassName("CClumaLabel")[2].innerHTML = gainProps?.luma.toFixed(2);
    document.getElementsByClassName("CCredLabel")[2].innerHTML = gainProps?.red.toFixed(2);
    document.getElementsByClassName("CCgreenLabel")[2].innerHTML = gainProps?.green.toFixed(2);
    document.getElementsByClassName("CCblueLabel")[2].innerHTML = gainProps?.blue.toFixed(2);

    // Offset
    let offsetProps = cameras[ci].propertyData['/colorCorrection/offset'];
    document.getElementsByClassName("CClumaLabel")[3].innerHTML = offsetProps?.luma.toFixed(2);
    document.getElementsByClassName("CCredLabel")[3].innerHTML = offsetProps?.red.toFixed(2);
    document.getElementsByClassName("CCgreenLabel")[3].innerHTML = offsetProps?.green.toFixed(2);
    document.getElementsByClassName("CCblueLabel")[3].innerHTML = offsetProps?.blue.toFixed(2);

    // Contrast
    let constrastProps = cameras[ci].propertyData['/colorCorrection/contrast'];
    document.getElementById("CCcontrastPivotRange").value = constrastProps?.pivot;
    document.getElementById("CCcontrastPivotLabel").innerHTML = constrastProps?.pivot.toFixed(2);
    document.getElementById("CCcontrastAdjustRange").value = constrastProps?.adjust;
    document.getElementById("CCcontrastAdjustLabel").innerHTML = parseInt(constrastProps?.adjust * 50)+"%";
    
    // Color
    let colorProps = cameras[ci].propertyData['/colorCorrection/color'];
    document.getElementById("CChueRange").value = colorProps?.hue;
    document.getElementById("CCcolorHueLabel").innerHTML = parseInt((colorProps?.hue + 1) * 180)+"°";
    
    document.getElementById("CCsaturationRange").value = colorProps?.saturation;
    document.getElementById("CCcolorSatLabel").innerHTML = parseInt(colorProps?.saturation * 50)+"%";

    let lumaContributionProps = cameras[ci].propertyData['/colorCorrection/lumaContribution'];
    document.getElementById("CClumaContributionRange").value = lumaContributionProps?.lumaContribution;
    document.getElementById("CCcolorLCLabel").innerHTML = parseInt(lumaContributionProps?.lumaContribution * 100)+"%";

    // ============ Footer Links ===============
    document.getElementById("documentationLink").href = "http://"+cameras[ci].hostname+"/control/documentation.html";
    document.getElementById("mediaManagerLink").href = "http://"+cameras[ci].hostname;
}


// ==============================================================================

// Called when the user changes tabs to a different camera
function switchCamera(index) {
    if (cameras[ci]) {
        cameras[ci].active = false;
    }

    ci = index;

    // Reset the Controls
    document.getElementById("allCamerasContainer").innerHTML = defaultControlsHTML;

    // Update the UI

    for (var i = 0; i < 8; i++) {
        if (i == ci) {
            document.getElementsByClassName("cameraSwitchLabel")[i].classList.add("selectedCam");
        } else {
            document.getElementsByClassName("cameraSwitchLabel")[i].classList.remove("selectedCam");
        }
    }

    document.getElementById("cameraNumberLabel").innerHTML = "CAM"+(ci+1);
    document.getElementById("cameraName").innerHTML = "CAMERA NAME";

    if (cameras[ci]) {
        cameras[ci].active = true;
    }
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

    let response = sendRequest(requestMethod,requestURL,requestData);
    
    document.getElementById("manualRequestResponseP").innerHTML = JSON.stringify(response);
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

/*  Helper Functions   */
function parseTimecode(timecodeBCD) {
    let noDropFrame = timecodeBCD & 0b01111111111111111111111111111111;     // The first bit of the timecode is 1 if "Drop Frame Timecode" is on. We don't want to include that in the display.
    let decimalTCInt = parseInt(noDropFrame.toString(16), 10);              // Convert the BCD number into base ten
    let decimalTCString = decimalTCInt.toString().padStart(8, '0');         // Convert the base ten number to a string eight characters long
    let finalTCString = decimalTCString.match(/.{1,2}/g).join(':');         // Put colons between every two characters
    return finalTCString;
}