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
    
    // Whether the transport is playing or not (boolean)
    isPlaying;

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
        this.updateUIisPlaying();
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
    }

    updateUIname() {
        document.getElementsByClassName("cameraName")[this.index].innerHTML = this.name;
    }

    updateUIhostname() {
        //TBD
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

    updateUIisPlaying() {
        //TBD
    }

    updateUIPlaybackState() {
        //TBD
    }

    updateUIRecordState() {
        if (this.recordState.recording) {
            document.getElementsByClassName("cameraControlsContainer")[this.index].classList.add("liveCam");
        } else {
            document.getElementsByClassName("cameraControlsContainer")[this.index].classList.remove("liveCam");
        }
    }

    updateUITimecode() {
        var tcString = parseInt(this.timecode.timecode.toString(16),10).toString().match(/.{1,2}/g).join(':');

        document.getElementsByClassName("timecodeLabel")[this.index].innerHTML = tcString;
    }

    updateUIPresets() {
        //TBD
    }

    updateUIActivePreset() {
        //TBD
    }

    updateUIAperture() {
        document.getElementsByClassName("irisRange")[this.index].value = this.apertureNormalised;
        document.getElementsByClassName("apertureStopsLabel")[this.index].innerHTML = this.apertureStop.toFixed(1);
    }

    updateUIZoom() {
        document.getElementsByClassName("zoomRange")[this.index].value = this.zoomNormalised;
        document.getElementsByClassName("zoomMMLabel")[this.index].innerHTML = this.zoomMM;
    }

    updateUIFocus() {
        document.getElementsByClassName("focusRange")[this.index].value = this.focusNormalised;
    }

    updateUIISO() {
        // TBD
    }

    updateUIgain() {
        var gainString = "";

        if (this.gain >= 0) {
            gainString = "+"+this.gain+"db"
        } else {
            gainString = this.gain+"db"
        }

        document.getElementsByClassName("gainSpan")[this.index].innerHTML = gainString;
    }

    updateUIWhiteBalance() {
        document.getElementsByClassName("whiteBalanceSpan")[this.index].innerHTML = this.WhiteBalance+"K";
    }

    updateUINDStop() {
        document.getElementsByClassName("ndFilterSpan")[this.index].innerHTML = this.NDStop;
    }

    updateUIshutter() {
        var shutterString = ""

        if ('shutterSpeed' in this.shutter) {
            shutterString = "1/"+this.shutter.shutterSpeed
        } else {
            var shangleString = this.shutter.shutterAngle.toString();
            shutterString = shangleString.slice(0,3)+(shangleString.slice(3,4) == '0' ? '' : "."+shangleString.slice(3,4))+"°"
        }

        document.getElementsByClassName("shutterSpan")[this.index].innerHTML = shutterString;
    }

    updateUIAutoExposureMode() {
        //TBD
    }

    updateUIColorCorrection() {
        //TBD
    }

    // =============== GETTERS ==================

    // name, hostname, APIaddress, index handled by constructor

    getCodecFormat() {
        this.pullData("/system/codecFormat").then((value) => {this.codecFormat = value});
    }

    getVideoFormat() {
        this.pullData("/system/videoFormat").then((value) => {this.videoFormat = value});
    }

    getSupportedCodecFormats() {
        this.pullData("/system/supportedCodecFormats").then((value) => {this.supportedCodecFormats = value});
    }

    getSupportedVideoFormats() {
        this.pullData("/system/supportedVideoFormats").then((value) => {this.supportedVideoFormats = value});
    }

    getTransportMode() {
        this.pullData("/transports/0").then((value) => {this.transportMode = value});
    }

    getIsPlaying() {
        this.pullData("/transports/0/play").then((value) => {this.isPlaying = value});
    }

    getPlaybackState() {
        this.pullData("/transports/0/playback").then((value) => {this.playbackState = value});
    }

    getRecordState() {
        this.pullData("/transports/0/record").then((value) => {this.recordState = value});
    }

    getTimecode() {
        this.pullData("/transports/0/timecode").then((value) => {this.timecode = value});
        this.pullData("/transports/0/timecode/source").then((value) => {this.timecode.source = value.source});
    }

    getPresets() {
        this.pullData("/presets").then((value) => {this.presets = value.presets});
    }

    getActivePreset() {
        this.pullData("/presets/active").then((value) => {this.activePreset = value});
    }

    getAperture() {
        this.pullData("/lens/iris").then((value) => {this.apertureStop = value.apertureStop; this.apertureNormalised = value.normalised});
    }

    getZoom() {
        this.pullData("/lens/zoom").then((value) => {this.zoomMM = value.focalLength; this.zoomNormalised = value.normalised});
    }

    getFocus() {
        this.pullData("/lens/focus").then((value) => {this.focusNormalised = value.normalised});
    }

    getISO() {
        this.pullData("/video/iso").then((value) => {this.ISO = value.iso});
    }

    getGain() {
        this.pullData("/video/gain").then((value) => {this.gain = value.gain});
    }

    getWhiteBalance() {
        this.pullData("/video/whiteBalance").then((value) => {this.WhiteBalance = value.whiteBalance});
        this.pullData("/video/whiteBalanceTint").then((value) => {this.WhiteBalanceTint = value.whiteBalanceTint});
    }

    getND() {
        this.pullData("/video/ndFilter").then((value) => {this.NDStop = value.stop});
        this.pullData("/video/ndFilter/displayMode").then((value) => {this.NDMode = value.displayMode});
    }

    getShutter() {
        this.pullData("/video/shutter").then((value) => {this.shutter = value});
    }

    getAutoExposureMode() {
        this.pullData("/video/autoExposure").then((value) => {this.AutoExposureMode = value});
    }

    getColorCorrection() {
        this.pullData("/colorCorrection/lift").then((value) => {this.CClift = value});
        this.pullData("/colorCorrection/gamma").then((value) => {this.CCgamma = value});
        this.pullData("/colorCorrection/gain").then((value) => {this.CCgain = value});
        this.pullData("/colorCorrection/offset").then((value) => {this.CCoffset = value});
        this.pullData("/colorCorrection/contrast").then((value) => {this.CCcontrast = value});
        this.pullData("/colorCorrection/color").then((value) => {this.CCcolor = value});
        this.pullData("/colorCorrection/lumaContribution").then((value) => {this.CClumacontribution = value});
    }

    getAllInfo() {
        this.getCodecFormat();
        this.getVideoFormat();
        this.getSupportedCodecFormats();
        this.getSupportedVideoFormats();
        this.getTransportMode();
        this.getIsPlaying();
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

    // =============== Other Commands =======================
    doAutoFocus() {
        this.pushData("/lens/focus/doAutoFocus")
    }

    /* Timer Stuff */
    everySecond() {
        this.refresh();
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

    xhttp.open(method, url, false);
    xhttp.send(JSON.stringify(data));

    return responseObject;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}