var CameraAddress = "http://Studio-Camera-6K-Pro.local"
var CameraAPIAddress = CameraAddress+"/control/api/v1"

var Camera = {
    "maximumAperture": 100.0,
    "minimumAperture": 0.0
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getIrisBounds() {
    // First we get the maximum aperture of the lens
    var requestBody = {"apertureStop": 100.0};
    sendRequest("PUT",CameraAPIAddress+"/lens/iris",JSON.stringify(requestBody));
    sleep(1000).then(() => 
        sendRequest("GET",CameraAPIAddress+"/lens/iris").then(function(value) {
            Camera.maximumAperture = parseFloat(value.apertureStop);
        })
    );

    // Then we get the minimum aperture of the lens
    requestBody = {"apertureStop": 0.0};
    sleep(1500).then(() => 
        sendRequest("PUT",CameraAPIAddress+"/lens/iris",JSON.stringify(requestBody))
    );
    sleep(2500).then(() => 
        sendRequest("GET",CameraAPIAddress+"/lens/iris").then(function(value) {
            Camera.minimumAperture = parseFloat(value.apertureStop);
        })
    );

    sleep(3000).then(() => {
        var irisRangeSlider = document.getElementById("irisRange");
        irisRangeSlider.value = 0.0;

        upadteIrisTextLabels();
    });
}

function sendButtonPressed() {
    const requestRadioGET = document.getElementById("requestTypeGET");

    const requestEndpointText = document.getElementById("queryName").value;
    
    const requestMethod = (requestRadioGET.checked ? "GET" : "PUT");
    const requestURL = CameraAPIAddress+requestEndpointText;
    const requestData = document.getElementById("queryBody").value;

    console.log("Method: ",requestMethod);
    console.log("URL: ",requestURL);
    console.log("Data: ",requestData);

    sendRequest(requestMethod,requestURL,requestData);
};

async function sendRequest(method, url, data) {
    const xhttp  = new XMLHttpRequest();
    var responseObject;

    xhttp.onload = function() {
        if (this.responseText) {
            document.getElementById("responseTextParagraph").innerHTML = this.responseText;
            responseObject = JSON.parse(this.responseText);
        } else {
            document.getElementById("responseTextParagraph").innerHTML = this.statusText;
            responseObject = {"status": this.statusText};
        }
    }

    xhttp.open(method, url, false);
    xhttp.send(data);

    return responseObject;
}

function onBodyLoad() {
    document.getElementById("documentationLink").href = CameraAddress+"/control/documentation.html";
    document.getElementById("mediaManagerLink").href = CameraAddress;

    getIrisBounds();
}

function irisInputHandler() {
    // Get HTML Elements
    var irisSliderValue = parseFloat(document.getElementById("irisRange").value);

    // Set up request body
    var requestBody = {"normalised": irisSliderValue};

    // Update text labels
    upadteIrisTextLabels();

    // Send request
    sendRequest("PUT",CameraAPIAddress+"/lens/iris",JSON.stringify(requestBody));
}

function upadteIrisTextLabels() {
    var irisDisplayText = document.getElementById("currentIrisNumber");
    var irisSliderValue = parseFloat(document.getElementById("irisRange").value);

    var apertureStop = irisSliderValue;
    irisDisplayText.innerHTML = parseFloat(Camera.minimumAperture + (apertureStop*(Camera.maximumAperture-Camera.minimumAperture))).toFixed(1);

    document.getElementById("irisRangeMinLabel").innerHTML = Camera.minimumAperture.toFixed(1);
    document.getElementById("irisRangeMaxLabel").innerHTML = Camera.maximumAperture.toFixed(1);
}