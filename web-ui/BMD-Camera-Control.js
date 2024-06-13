class BMDCamera {
    // Pretty name and network hostname (strings)
    name;
    hostname;
    APIAddress;

    // Camera index, used for muticam support
    index;

    // Codec and Video Formats (JSON object)
    format;

    // Current Transport Mode (string)
    transportMode;

    // Playback state (JSON object)
    playbackState;

    // Record state (JSON object)
    recordState;

    // Timecode (JSON Object)
    timecode;
    // (pack the source into here also)

    // Presets (JSON object)
    presets;
    activePreset;

    // Iris (floats)
    apertureStop;
    apertureNormalised;

    // Zoom (floats)
    zoomMM;
    zoomNormalised;

    // Focus (float)
    focusNormalised;

    // ISO (int)
    ISO;

    // Gain (int)
    gain;

    // White Balance (ints)
    WhiteBalance;
    WhiteBalanceTint;

    // ND Filter (int, string)
    NDStop;
    NDMode;

    // Shutter (JSON object)
    shutter;
    // has to be an object because it either returns with shutterSpeed or shutterAngle

    // AE Mode (JSON Object)
    AutoExposureMode;

    // Basic Color Correction (JSON objects w/ RGBL)
    CClift;
    CCgamma;
    CCgain;
    CCoffset;

    // Other Color Correction (JSON objects w/ 2 numbers)
    CCcontrast;
    CCcolor;
    CClumacontribution;

    // Keep track of unimplemented functions on the camera (array of strings)
    UnimplementedFunctionality = [];

    // ============= CONSTRUCTOR ================
    constructor(hostname, index) {
        this.hostname = hostname;
        this.index = index;
        this.APIAddress = "http://"+hostname+"/control/api/v1";
        this.name = this.hostname.replace(".local","").replaceAll("-"," ");

        this.refresh();
    }

    // Important refreshing function
    refresh() {
        document.getElementById("refreshingText").classList.add("refreshing");
        this.getAllInfo();
        sleep(200).then(() => {
                this.updateUIAll();
                document.getElementById("refreshingText").classList.remove("refreshing");
            }
        ); 
    }

    // Wrapper for API call, returns the JSON object from the camera
    async pullData(endpoint) {
        // Ask the camera a question
        let response;
        
        if (this.UnimplementedFunctionality.indexOf(endpoint) < 0) {
            response = await sendRequest("GET",this.APIAddress+endpoint,"");
        } else {
            response = "Unimplemented";
        }

        // Check for unimplemented features
        if (response.status == 501) {
            this.UnimplementedFunctionality.push(endpoint);
            response = "Unimplemented";
        }

        return response
    }

    // Wrapper for API call, returns whatever the camera sent back in response
    async pushData(endpoint, data) {
        return await sendRequest("PUT",this.APIAddress+endpoint,data);
    }

    // ======= UI Updaters ==========
    updateUIAll() {
        this.updateUIname();
        this.updateUIhostname();
        this.updateUIFormat();
        this.updateUITransportMode();
        this.updateUIPlaybackState();
        this.updateUIRecordState();
        this.updateUITimecode();
        this.updateUIPresets();
        this.updateUIActivePreset();
        this.updateUIAperture();
        this.updateUIZoom();
        this.updateUIFocus();
        this.updateUIISO();
        this.updateUIgain();
        this.updateUIWhiteBalance();
        this.updateUINDStop();
        this.updateUIshutter();
        this.updateUIAutoExposureMode();
        this.updateUIColorCorrection();
        this.updateUILinks();
    }

    updateUIname() {
        document.getElementById("cameraName").innerHTML = this.name;
    }

    updateUIhostname() {
        document.getElementById("hostnameInput").value = this.hostname;
    }

    updateUIFormat() {
        document.getElementById("formatCodec").innerHTML = this.format.codec.toUpperCase().replace(":"," ").replace("_",":");
        
        let resObj = this.format.recordResolution;
        document.getElementById("formatResolution").innerHTML = resObj.width + "x" + resObj.height;
        document.getElementById("formatFPS").innerHTML = this.format.frameRate+" fps";
    }

    updateUITransportMode() {
        //TBD
    }

    updateUIPlaybackState() {
        //TBD
    }

    updateUIRecordState() {
        if (this.recordState.recording) {
            document.getElementById("cameraControlHeadContainer").classList.add("liveCam");
            document.getElementById("cameraControlExpandedHeadContainer").classList.add("liveCam");
        } else {
            document.getElementById("cameraControlHeadContainer").classList.remove("liveCam");
            document.getElementById("cameraControlExpandedHeadContainer").classList.remove("liveCam");
        }
    }

    updateUITimecode() {
        var tcString = parseInt(this.timecode.timecode.toString(16),10).toString().padStart(8,'0').match(/.{1,2}/g).join(':');

        document.getElementById("timecodeLabel").innerHTML = tcString;
    }

    updateUIPresets() {
        var presetsList = document.getElementById("presetsDropDown");

        this.presets.forEach((presetItem) => {
            let presetName = presetItem.split('.', 1);

            if (!presetsList.contains(document.getElementsByName("presetOption"+presetName)[0])) {
                let textNode = document.createTextNode(presetName);
                let optionNode = document.createElement("option");
                optionNode.setAttribute("name", "presetOption"+presetName);
                optionNode.appendChild(textNode);
                document.getElementById("presetsDropDown").appendChild(optionNode);
            }
        });
    }

    updateUIActivePreset() {
        var presetsList = document.getElementById("presetsDropDown");

        presetsList.childNodes.forEach((child) => {
            if (child.nodeName == 'OPTION' && child.value == cameras[ci].activePreset) {
                child.selected=true
            } else {
                child.selected=false
            }
        })
    }

    updateUIAperture() {
        document.getElementById("irisRange").value = this.apertureNormalised;
        document.getElementById("apertureStopsLabel").innerHTML = this.apertureStop.toFixed(1);
    }

    updateUIZoom() {
        document.getElementById("zoomRange").value = this.zoomNormalised;
        document.getElementById("zoomMMLabel").innerHTML = this.zoomMM;
    }

    updateUIFocus() {
        document.getElementById("focusRange").value = this.focusNormalised;
    }

    updateUIISO() {
        document.getElementById("ISOInput").value = this.ISO;
    }

    updateUIgain() {
        var gainString = "";

        if (this.gain >= 0) {
            gainString = "+"+this.gain+"db"
        } else {
            gainString = this.gain+"db"
        }

        document.getElementById("gainSpan").innerHTML = gainString;
    }

    updateUIWhiteBalance() {
        document.getElementById("whiteBalanceSpan").innerHTML = this.WhiteBalance+"K";
        document.getElementById("whiteBalanceTintSpan").innerHTML = this.WhiteBalanceTint;
    }

    updateUINDStop() {
        document.getElementById("ndFilterSpan").innerHTML = this.NDStop;
    }

    updateUIshutter() {
        var shutterString = ""

        if ('shutterSpeed' in this.shutter) {
            shutterString = "1/"+this.shutter.shutterSpeed
        } else {
            var shangleString = (this.shutter.shutterAngle / 100).toFixed(1).toString()
            if (shangleString.indexOf(".0") > 0) {
                shutterString = parseFloat(shangleString).toFixed(0)+"°";
            } else {
                shutterString = shangleString+"°";
            }
        }

        document.getElementById("shutterSpan").innerHTML = shutterString;
    }

    updateUIAutoExposureMode() {
        let AEmodeSelect = document.getElementById("AEmodeDropDown");
        let AEtypeSelect = document.getElementById("AEtypeDropDown");

        AEmodeSelect.value = cameras[ci].AutoExposureMode.mode;
        AEtypeSelect.value = cameras[ci].AutoExposureMode.type;
    }

    updateUIColorCorrection() {
        // Lift
        document.getElementsByClassName("CClumaLabel")[0].innerHTML = this.CClift.luma.toFixed(2);
        document.getElementsByClassName("CCredLabel")[0].innerHTML = this.CClift.red.toFixed(2);
        document.getElementsByClassName("CCgreenLabel")[0].innerHTML = this.CClift.green.toFixed(2);
        document.getElementsByClassName("CCblueLabel")[0].innerHTML = this.CClift.blue.toFixed(2);

        // Gamma
        document.getElementsByClassName("CClumaLabel")[1].innerHTML = this.CCgamma.luma.toFixed(2);
        document.getElementsByClassName("CCredLabel")[1].innerHTML = this.CCgamma.red.toFixed(2);
        document.getElementsByClassName("CCgreenLabel")[1].innerHTML = this.CCgamma.green.toFixed(2);
        document.getElementsByClassName("CCblueLabel")[1].innerHTML = this.CCgamma.blue.toFixed(2);

        // Gain
        document.getElementsByClassName("CClumaLabel")[2].innerHTML = this.CCgain.luma.toFixed(2);
        document.getElementsByClassName("CCredLabel")[2].innerHTML = this.CCgain.red.toFixed(2);
        document.getElementsByClassName("CCgreenLabel")[2].innerHTML = this.CCgain.green.toFixed(2);
        document.getElementsByClassName("CCblueLabel")[2].innerHTML = this.CCgain.blue.toFixed(2);

        // Offset
        document.getElementsByClassName("CClumaLabel")[3].innerHTML = this.CCoffset.luma.toFixed(2);
        document.getElementsByClassName("CCredLabel")[3].innerHTML = this.CCoffset.red.toFixed(2);
        document.getElementsByClassName("CCgreenLabel")[3].innerHTML = this.CCoffset.green.toFixed(2);
        document.getElementsByClassName("CCblueLabel")[3].innerHTML = this.CCoffset.blue.toFixed(2);
    
        // Contrast
        document.getElementById("CCcontrastPivotRange").value = this.CCcontrast.pivot;
        document.getElementById("CCcontrastPivotLabel").innerHTML = this.CCcontrast.pivot.toFixed(2);
        document.getElementById("CCcontrastAdjustRange").value = this.CCcontrast.adjust;
        document.getElementById("CCcontrastAdjustLabel").innerHTML = this.CCcontrast.adjust.toFixed(2);
        
        // Color
        document.getElementById("CChueRange").value = this.CCcolor.hue;
        document.getElementById("CCcolorHueLabel").innerHTML = this.CCcolor.hue.toFixed(2);
        
        document.getElementById("CCsaturationRange").value = this.CCcolor.saturation;
        document.getElementById("CCcolorSatLabel").innerHTML = this.CCcolor.saturation.toFixed(2);

        document.getElementById("CClumaContributionRange").value = this.CClumacontribution.lumaContribution;
        document.getElementById("CCcolorLCLabel").innerHTML = this.CClumacontribution.lumaContribution.toFixed(2);
    }

    updateUILinks() {
        document.getElementById("documentationLink").href = "http://"+this.hostname+"/control/documentation.html";
        document.getElementById("mediaManagerLink").href = "http://"+this.hostname;
    }

    // =============== GETTERS ==================

    // name, hostname, APIaddress, index handled by constructor

    getFormat() {
        this.pullData("/system/format").then((value) => {this.format = value; this.updateUIFormat()});
    }

    getTransportMode() {
        this.pullData("/transports/0").then((value) => {this.transportMode = value; this.updateUITransportMode()});
    }

    getPlaybackState() {
        this.pullData("/transports/0/playback").then((value) => {this.playbackState = value; this.updateUIPlaybackState()});
    }

    getRecordState() {
        this.pullData("/transports/0/record").then((value) => {this.recordState = value; this.updateUIRecordState()});
    }

    getTimecode() {
        this.pullData("/transports/0/timecode").then((value) => {this.timecode = value; this.updateUITimecode()});
        this.pullData("/transports/0/timecode/source").then((value) => {this.timecode.source = value.source});
    }

    getPresets() {
        this.pullData("/presets").then((value) => {this.presets = value.presets; this.updateUIPresets()});
    }

    getActivePreset() {
        this.pullData("/presets/active").then((value) => {this.activePreset = value; this.updateUIActivePreset()});
    }

    getAperture() {
        this.pullData("/lens/iris").then((value) => {this.apertureStop = value.apertureStop; this.apertureNormalised = value.normalised; this.updateUIAperture()});
    }

    getZoom() {
        this.pullData("/lens/zoom").then((value) => {this.zoomMM = value.focalLength; this.zoomNormalised = value.normalised; this.updateUIZoom()});
    }

    getFocus() {
        this.pullData("/lens/focus").then((value) => {this.focusNormalised = value.normalised; this.updateUIFocus()});
    }

    getISO() {
        this.pullData("/video/iso").then((value) => {this.ISO = value.iso; this.updateUIISO()});
    }

    getGain() {
        this.pullData("/video/gain").then((value) => {this.gain = value.gain; this.updateUIgain()});
    }

    getWhiteBalance() {
        this.pullData("/video/whiteBalance").then((value) => {this.WhiteBalance = value.whiteBalance});
        this.pullData("/video/whiteBalanceTint").then((value) => {this.WhiteBalanceTint = value.whiteBalanceTint; this.updateUIWhiteBalance()});
    }

    getND() {
        this.pullData("/video/ndFilter").then((value) => {this.NDStop = value.stop; this.updateUINDStop()});
        this.pullData("/video/ndFilter/displayMode").then((value) => {this.NDMode = value.displayMode});
    }

    getShutter() {
        this.pullData("/video/shutter").then((value) => {this.shutter = value; this.updateUIshutter()});
    }

    getAutoExposureMode() {
        this.pullData("/video/autoExposure").then((value) => {this.AutoExposureMode = value; this.updateUIAutoExposureMode()});
    }

    getColorCorrection() {
        this.pullData("/colorCorrection/lift").then((value) => {this.CClift = value});
        this.pullData("/colorCorrection/gamma").then((value) => {this.CCgamma = value});
        this.pullData("/colorCorrection/gain").then((value) => {this.CCgain = value});
        this.pullData("/colorCorrection/offset").then((value) => {this.CCoffset = value});
        this.pullData("/colorCorrection/contrast").then((value) => {this.CCcontrast = value});
        this.pullData("/colorCorrection/color").then((value) => {this.CCcolor = value});
        this.pullData("/colorCorrection/lumaContribution").then((value) => {this.CClumacontribution = value; this.updateUIColorCorrection()});
    }

    getAllInfo() {
        this.getFormat();
        this.getTransportMode();
        this.getPlaybackState();
        this.getRecordState();
        this.getTimecode();
        this.getPresets();
        this.getActivePreset();
        this.getAperture();
        this.getZoom();
        this.getFocus();
        this.getISO();
        this.getGain();
        this.getWhiteBalance();
        this.getND();
        this.getShutter();
        this.getAutoExposureMode();
        this.getColorCorrection();
    }

    // =============== SETTERS ==================

    // name, hostname, APIaddress, index should never have to be set

    setCodecFormat(newCodecFormatObject) {
        this.pushData("/system/codecFormat",newCodecFormatObject).then(() => sleep(1000).then(() => this.getCodecFormat()));
    }

    setVideoFormat(newVideoFormatObject) {
        this.pushData("/system/videoFormat",newVideoFormatObject).then(() => sleep(1000).then(() => this.getCodecFormat()));
    }

    setTransportMode(newTransportModeString) {
        this.pushData("/transports/0",{"mode": newTransportModeString}).then(() => sleep(1000).then(() => this.getTransportMode()));
    }

    setPlaybackState(playbackStateObject) {
        this.pushData("/transports/0/playback",playbackStateObject).then(() => sleep(1000).then(() => this.getPlaybackState()));
    }

    sendPresetFile(file) {
        sendRequest("POST",this.APIAddress+"/presets",file)
    }

    setActivePreset(presetString) {
        this.pushData("/presets/active",{"preset": presetString}).then(() => sleep(1000).then(() => this.refresh()));
    }

    updatePreset(presetString) {
        this.pushData("/presets/active",{"preset": presetString}).then(() => sleep(1000).then(() => this.getPresets()));
    }

    setAperture(apertureNormalisedFloat) {
        this.pushData("/lens/iris",{"normalised": apertureNormalisedFloat}).then(() => sleep(1000).then(() => this.getAperture()));
    }

    setZoom(zoomNormalisedFloat) {
        this.pushData("/lens/zoom",{"normalised": zoomNormalisedFloat}).then(() => sleep(1000).then(() => this.getZoom()));
    }

    setFocus(focusNormalisedFloat) {
        this.pushData("/lens/focus",{"normalised": focusNormalisedFloat}).then(() => sleep(1000).then(() => this.getFocus()));
    }

    setISO(ISOint) {
        this.pushData("/video/iso",{"iso":ISOint}).then(() => sleep(1000).then(() => this.getISO()));
    }

    setGain(gainInt) {
        this.pushData("/video/gain",{"gain":gainInt}).then(() => sleep(1000).then(() => this.getGain()));
    }

    setWhiteBalance(whiteBalanceInt, whiteBalanceTintInt) {
        this.pushData("/video/whiteBalance",{"whiteBalance": whiteBalanceInt});
        this.pushData("/video/whiteBalanceTint",{"whiteBalanceTint": whiteBalanceTintInt}).then(() => sleep(1000).then(() => this.getWhiteBalance()));
    }

    setND(NDstopInt) {
        this.pushData("/video/ndFilter",{"stop": NDstopInt}).then(() => sleep(1000).then(() => this.getND()));
    }

    setNDDisplayMode(displayModeString) {
        this.pushData("/video/ndFilter/displayMode",{"displayMode": displayModeString}).then(() => sleep(1000).then(() => this.getND()));
    }

    // Accepts JSON obejcts with either shutterSpeed or shutterAngle properties
    // Note that shutterAngle is 100x the displayed value
    setShutter(shutterObject) {
        this.pushData("/video/shutter",shutterObject).then(() => sleep(1000).then(() => this.getShutter()));
    }

    setAutoExposureMode(AEmodeObject) {
        this.pushData("/video/autoExposure",AEmodeObject).then(() => sleep(1000).then(() => this.getAutoExposureMode()));
    }

    setCCLift(CCliftObject) {
        this.pushData("/colorCorrection/lift",CCliftObject).then(() => sleep(1000).then(() => this.getColorCorrection()));
    }

    setCCGamma(CCgammaObject) {
        this.pushData("/colorCorrection/gamma",CCgammaObject).then(() => sleep(1000).then(() => this.getColorCorrection()));
    }

    setCCGain(CCgainObject) {
        this.pushData("/colorCorrection/gain",CCgainObject).then(() => sleep(1000).then(() => this.getColorCorrection()));
    }

    setCCOffset(CCoffsetObject) {
        this.pushData("/colorCorrection/offset",CCoffsetObject).then(() => sleep(1000).then(() => this.getColorCorrection()));
    }

    setCCContrast(CCcontrastObject) {
        this.pushData("/colorCorrection/contrast",CCcontrastObject).then(() => sleep(1000).then(() => this.getColorCorrection()));
    }

    setCCColor(CCcolorObject) {
        this.pushData("/colorCorrection/color",CCcolorObject).then(() => sleep(1000).then(() => this.getColorCorrection()));
    }

    setCCLumaContribuion(CClumacontributionObject) {
        this.pushData("/colorCorrection/lumaContribution",CClumacontributionObject).then(() => sleep(1000).then(() => this.getColorCorrection()));
    }

    // =============== Other Commands =======================
    doAutoFocus() {
        this.pushData("/lens/focus/doAutoFocus").then(() => sleep(1500).then(() => this.getFocus()));
    }

    play() {
        this.pushData("/transports/0/play").then(() => sleep(1000).then(() => this.getPlaybackState()));
    }

    record() {
        this.pushData("/transports/0/record",{"recording": true}).then(() => {
            sleep(2000).then(() => this.getRecordState());
        });
    }

    stopTransport() {
        this.pushData("/transports/0/stop").then(() => {
            sleep(2000).then(() => this.getPlaybackState());
        });
    }

    stopRecord() {
        this.pushData("/transports/0/record",{"recording": false}).then(() => {
            sleep(2000).then(() => this.getRecordState());
        });
    }
}

/* Helper Functions */
async function sendRequest(method, url, data) {
    const xhttp  = new XMLHttpRequest();
    var responseObject;

    xhttp.onload = function() {
        if (this.status == 200) {
            // Success w/ Data
            responseObject = JSON.parse(this.responseText);
        } else {
            // Pass along response data and stuff
            responseObject = this;
        }
    }

    xhttp.open(method, url, false);
    xhttp.send(JSON.stringify(data));

    return responseObject;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}