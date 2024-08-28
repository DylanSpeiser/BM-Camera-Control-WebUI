/*      Blackmagic Camera Control JS Class
        Written based on the Camera Control
        API Documentation from Blackmagic's
        Developer info website.

        (c) Dylan Speiser 2024              
        github.com/DylanSpeiser

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU Affero General Public License as published.

        This program is distributed in the hope that it will be useful but without
        any warranty; without even the implied warranty of merchantability or fitness
        for a particular purpose as specified by the License, which you should consult
        for more details at LICENSE.txt in this repository.
*/

// Generic Blackmagic Device class, use with HyperDecks.
class BMDevice {
    // Pretty name and network hostname (strings)
    name;
    hostname;
    APIAddress;

    // Are we using HTTPS?
    useHTTPS;

    // WebSocket items
    ws;
    availableProperties;

    // Active Flag
    // Won't call updateUI if this is false
    active = false;

    // JSON Object to store all data
    propertyData = {};

    // Reference to UI Updating callback function
    // For BYOUI purposes (Bring-Your-Own-UI). If you're using this class for your own UI, 
    //  set this function to point to your UI updater.
    updateUI() {};

    // ============= CONSTRUCTOR ================
    constructor(hostname, secure=false) {
        // Set Security
        this.useHTTPS = secure;

        // Set name properties
        this.hostname = hostname;
        this.APIAddress = (this.useHTTPS ? "https://" : "http://")+hostname+"/control/api/v1";
        this.name = this.hostname.replace(".local","").replaceAll("-"," ");

        // Initialize WebSocket
        this.ws = new WebSocket((this.useHTTPS ? "wss://" : "ws://")+hostname+"/control/api/v1/event/websocket");

        // Get a self object for accessing within callback fns
        var self = this;

        // Set the onmessage behavior
        this.ws.onmessage = (event) => {
            // Parse the event's data as JSON
            let eventData = JSON.parse(event.data);

            // Extract data we really care about
            let messageData = eventData.data;

            // If it's a listProperties message, update the available properties array
            if (messageData.action == "listProperties") {
                self.availableProperties = messageData.properties;
            }

            // If we get a response from the camera with property information, save it.
            if (eventData.type == "response") {
                Object.assign(this.propertyData, messageData.values);
            }

            // If it's a propertyValueChanged event, update the camera object accordingly and show it on the web page.
            if (messageData.action == "propertyValueChanged") {
                this.propertyData[messageData.property] = messageData.value;
            }

            if (this.active) {
                // Update the UI
                this.updateUI();
            }

            // Output info to console.
            // console.log("WebSocket message received: ", eventData);
        }

        // Wait for the WebSocket to open
        this.ws.onopen = (event) => {
            // Once the WebSocket is open,

            // Ask it for all the properties
            self.ws.send(JSON.stringify({type: "request", data: {action: "listProperties"}}));

            sleep(100).then(() => {
                // Subscribe to all available events
                this.availableProperties.forEach((str) => {
                    self.ws.send(JSON.stringify({type: "request", data: {action: "subscribe", properties: [str]}}));
                });
            });
        }
    }

    // Returns a JSON Object of data we got from the device
    GETdata(endpoint) {
        // Just call sendRequest
        return sendRequest("GET", this.APIAddress+endpoint);
    }

    // Send JSON Object data to the device
    PUTdata(endpoint, data) {
        // Just call sendRequest
        return sendRequest("PUT", this.APIAddress+endpoint, data);
    }
    
    // ================= SETTERS =================
    // Basically just wrappers for PUT requests to specific endpoints

    // If the optional parameter is set to false, it will stop recording 
    record(state = true) {
        this.PUTdata("/transports/0/record",{recording: state});
    }

    toggleRecord() {
        let recordState = this.propertyData['/transports/0/record'].recording;

        this.PUTdata("/transports/0/record",{recording: !recordState});
    }

    play() {
        this.PUTdata("/transports/0/play");
    }

    stop() {
        this.PUTdata("/transports/0/stop");
    }

    // Boolean parameter, true = forward, false = backwards
    seek(direction) {
        let clips = this.GETdata("/timelines/0")?.clips;
        let playbackData = this.GETdata("/transports/0/playback");

        let runningSum = 0;
        let currentClipFound = false;
        let currentClipIndex = 0;
        let clipStartingTimecodes = [];
        let i = 0;

        clips.forEach((clip) => {
            if ((runningSum+clip.frameCount > playbackData.position) && !currentClipFound) {
                currentClipIndex = i;
                currentClipFound = true;
            }
            clipStartingTimecodes[i] = runningSum;
            runningSum += clip.frameCount;
            i++;
        });

        let newClipIndex = Math.min(Math.max(0,(direction ? currentClipIndex+1 : currentClipIndex-1)), clips.length-1);

        playbackData.position = clipStartingTimecodes[newClipIndex];

        this.PUTdata("/transports/0/playback", playbackData);
    }

    // Sets Timeline / Clip Looping 
    // Argument can be either "None", "Loop", or "Loop Clip"
    setLoopMode(modeString) {
        let newStateObj = this.propertyData['/transports/0/playback'];

        if (modeString === "None") {
            newStateObj.loop = false;
            newStateObj.singleClip = false;
        } else if (modeString === "Loop") {
            newStateObj.loop = true;
            newStateObj.singleClip = false;
        } else if (modeString === "Loop Clip") {
            newStateObj.loop = true;
            newStateObj.singleClip = true;
        }

        this.PUTdata("/transports/0/playback", newStateObj);
    }
}

// Child Class Specifically for Cameras
class BMCamera extends BMDevice {
    // Child class constructor
    // Just passing the hostname and security to the superclass's constructor
    constructor(hostname, secure=false) {
        super(hostname, secure);
    }

    // Sets the white balance and tint based on the following preset:
    // 0: Sunlight, 1: Tungsten, 2: Fluorescent, 3: Shade, 4: Cloudy
    // Any other value will not affect the WB setting
    setWhiteBalancePreset(presetIndex) {
        let newWhiteBalance;
        let newWhiteBalanceTint;
        
        switch (presetIndex) {
            case 0:
                // Sunlight
                newWhiteBalance = 5600;
                newWhiteBalanceTint = 10;
                break;
            case 1:
                // Tungsten
                newWhiteBalance = 3200;
                newWhiteBalanceTint = 0;
                break;
            case 2:
                // Fluorescent
                newWhiteBalance = 4000;
                newWhiteBalanceTint = 15;
                break;
            case 3:
                // Shade
                newWhiteBalance = 4500;
                newWhiteBalanceTint = 15;
                break;
            case 4:
                // Cloudy
                newWhiteBalance = 6500;
                newWhiteBalanceTint = 10;
                break;
            default:
                // If any other value is set, don't change anything
                newWhiteBalance = this.GETdata("/video/whiteBalance").whiteBalance;
                newWhiteBalanceTint = this.GETdata("/video/whiteBalanceTint").whiteBalanceTint;
        }

        this.PUTdata("/video/whiteBalance",{whiteBalance: newWhiteBalance});
        this.PUTdata("/video/whiteBalanceTint",{whiteBalanceTint: newWhiteBalanceTint});
    }

    doAutoFocus() {
        this.PUTdata("/lens/focus/doAutoFocus");
    }

    doAutoWhitebalance() {
        this.PUTdata("/video/whiteBalance/doAuto");
    }
}

/* Helper Functions */

// Send request with other method type
function sendRequest(method, url, data) {
    // Instantiate the XMLHttpRequest object
    let xhr = new XMLHttpRequest();

    // Create an object to store and return the response
    let responseObject = {};

    // Define the onload function
    xhr.onload = function() {
        if (this.status < 300) {                            // If the operation is successful
            if (this.responseText)
                responseObject = JSON.parse(this.responseText);     // Give the data to the responseObject
            responseObject.status = this.status;                // Also pass along the status code for error handling
        } else {                                            // If there has been an error
            responseObject = this;                              // Give the XMLHttpRequest data to the responseObject
            console.error("Error ", this.status, ": ", this.statusText);    // Log the error in the console
        }
    };

    // Open the connection
    // The "false" here specifies that we want to wait for the response to come back before returning from xhr.send()
    xhr.open(method, url, false);

    // Send the request with data
    xhr.send(JSON.stringify(data));

    // Return response data
    return responseObject;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* (c) Dylan Speiser 2024              
   github.com/DylanSpeiser */