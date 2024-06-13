class BMDCamera {
    // Pretty name and network hostname (strings)
    name;
    hostname;
    APIAddress;

    // Camera index, used for muticam support
    index;

    // == TODO: Having trouble with the codec and video formats on the SC 6K Pro ==
    // Codec and Video Formats (JSON objects)
    codecFormat;
    videoFormat;

    // Supported Codecs/Videos (arrays)
    supportedCodecFormats;
    supportedVideoFormats;
    // ============================================================================

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
        this.getAllInfo();
        sleep(500).then(() => 
            this.updateUIAll()
        ); 
    }

    // Wrapper for API call, returns the JSON object from the camera
    async pullData(endpoint) {
        return await sendRequest("GET",this.APIAddress+endpoint,"");
    }

    // Wrapper for API call, returns whatever the camera sent back in response
    async pushData(endpoint, data) {
        return await sendRequest("PUT",this.APIAddress+endpoint,data);
    }

    // ======= UI Updaters ==========
    updateUIAll() {
        this.updateUIname();
        this.updateUIhostname();
        this.updateUICodecFormat();
        this.updateUIVideoFormat();
        this.updateUISupportedCodecFormats();
        this.updateUISupportedVideoFormats();
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

    updateUICodecFormat() {
        //TBD
    }

    updateUIVideoFormat() {
        //TBD
    }

    updateUISupportedCodecFormats() {
        //TBD
    }

    updateUISupportedVideoFormats() {
        //TBD
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
        // Redo this to work with no leading 0
        var tcString = parseInt(this.timecode.timecode.toString(16),10).toString().match(/.{1,2}/g).join(':');

        document.getElementById("timecodeLabel").innerHTML = tcString;
    }

    updateUIPresets() {
        //TBD
    }

    updateUIActivePreset() {
        //TBD
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
        //TBD
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
    }

    updateUILinks() {
        document.getElementById("documentationLink").href = "http://"+this.hostname+"/control/documentation.html";
        document.getElementById("mediaManagerLink").href = "http://"+this.hostname;
    }

    // =============== GETTERS ==================

    // name, hostname, APIaddress, index handled by constructor

    getCodecFormat() {
        this.pullData("/system/codecFormat").then((value) => {this.codecFormat = value; this.updateUICodecFormat()});
    }

    getVideoFormat() {
        this.pullData("/system/videoFormat").then((value) => {this.videoFormat = value; this.updateUIVideoFormat()});
    }

    getSupportedCodecFormats() {
        this.pullData("/system/supportedCodecFormats").then((value) => {this.supportedCodecFormats = value; this.updateUISupportedCodecFormats()});
    }

    getSupportedVideoFormats() {
        this.pullData("/system/supportedVideoFormats").then((value) => {this.supportedVideoFormats = value; this.updateUISupportedVideoFormats()});
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
        this.getCodecFormat();
        this.getVideoFormat();
        this.getSupportedCodecFormats();
        this.getSupportedVideoFormats();
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
        this.pushData("/presets/active",{"preset": presetString}).then(() => sleep(1000).then(() => this.getActivePreset()));
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

    // TODO: Add error code handling
    xhttp.onload = function() {
        if (this.responseText) {
            responseObject = JSON.parse(this.responseText);
        } else {
            responseObject = {"status": this.statusText};
        }
    }

    // Don't keep making API calls for unimplemented features
    if (cameras[ci]) {
        // First check if the camera exists.
        if (cameras[ci].UnimplementedFunctionality.indexOf(url) < 0) {
            // If everything is honky dory
    
            xhttp.open(method, url, false);
            xhttp.send(JSON.stringify(data));
        } else {
            // If everything is not honky dory
            // do nothing
        }

        if ((!responseObject) || (Object.hasOwn(responseObject,'error') && responseObject.error == "Not implemented for this device")) {
            cameras[ci].UnimplementedFunctionality.push(url);
        }

    } else {
        xhttp.open(method, url, false);
        xhttp.send(JSON.stringify(data));
    }

    return responseObject;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}