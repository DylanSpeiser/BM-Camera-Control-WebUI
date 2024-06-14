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

class BMDCamera {
    // Pretty name and network hostname (strings)
    name;
    hostname;
    APIAddress;

    // Codec and Video Format (JSON object)
    format;

    // Current Transport Mode (string)
    transportMode;

    // Current Playback state (JSON object)
    playbackState;

    // Current Record state (JSON object)
    recordState;

    // Timecode (JSON Object)
    timecode;

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

    // Keep track of unimplemented functions on the camera (array of endpoint strings)
    UnimplementedFunctionality = [];

    // UI refreshing functions, will get called after every get method to keep the UI updated,
    // For BYOUI purposes (Bring-Your-Own-UI). If you're using this class for your own UI, 
    //  set this function to point to your UI updater.
    static updateUIAll() {};
    static updateUIname() {};
    static updateUIhostname() {};
    static updateUIFormat() {};
    static updateUITransportMode() {};
    static updateUIPlaybackState() {};
    static updateUIRecordState() {};
    static updateUITimecode() {};
    static updateUIPresets() {};
    static updateUIActivePreset() {};
    static updateUIAperture() {};
    static updateUIZoom() {};
    static updateUIFocus() {};
    static updateUIISO() {};
    static updateUIgain() {};
    static updateUIWhiteBalance() {};
    static updateUINDStop() {};
    static updateUIshutter() {};
    static updateUIAutoExposureMode() {};
    static updateUIColorCorrection() {};
    static updateUILinks() {};

    // ============= CONSTRUCTOR ================
    constructor(hostname) {
        this.hostname = hostname;
        this.APIAddress = "http://"+hostname+"/control/api/v1";
        this.name = this.hostname.replace(".local","").replaceAll("-"," ");
    }

    // Wrapper for API call, returns the JSON object from the camera
    async pullData(endpoint) {
        // Ask the camera a question
        let response;
        
        // Only send the request if it's not an Unimplemented Function
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

    // Wrapper for API call, sends data to the camera.
    async pushData(endpoint, data) {
        return await sendRequest("PUT",this.APIAddress+endpoint,data);
    }

    // =============== GETTERS ==================

    // name, hostname, APIaddress handled by constructor
    // since these are all asynchronous, they will return promises to use with await or .then()

    async getFormat() {
       this.format = await this.pullData("/system/format");
       BMDCamera.updateUIFormat();
       return this.format;
    }

    async getTransportMode() {
        this.transportMode = await this.pullData("/transports/0");
        BMDCamera.updateUITransportMode();
        return this.transportMode;
    }

    async getPlaybackState() {
        this.playbackState = await this.pullData("/transports/0/playback");
        BMDCamera.updateUIPlaybackState();
        return this.playbackState;
    }

    async getRecordState() {
        this.recordState = await this.pullData("/transports/0/record");
        BMDCamera.updateUIRecordState();
        return this.recordState;
    }

    async getTimecode() {
        this.timecode = await this.pullData("/transports/0/timecode");
        BMDCamera.updateUITimecode();
        return this.timecode;
    }

    async getPresets() {
        this.pullData("/presets").then((value) => {this.presets = value.presets; BMDCamera.updateUIPresets();});
        return this.presets;
    }

    async getActivePreset() {
        this.activePreset = await this.pullData("/presets/active");
        BMDCamera.updateUIActivePreset();
        return this.activePreset;
    }

    async getAperture() {
        this.pullData("/lens/iris").then((value) => {this.apertureStop = value.apertureStop; this.apertureNormalised = value.normalised; BMDCamera.updateUIAperture();});
        return this.apertureNormalised;
    }

    async getZoom() {
        this.pullData("/lens/zoom").then((value) => {this.zoomMM = value.focalLength; this.zoomNormalised = value.normalised; BMDCamera.updateUIZoom();});
        return this.zoomNormalised;
    }

    async getFocus() {
        this.pullData("/lens/focus").then((value) => {this.focusNormalised = value.normalised; BMDCamera.updateUIFocus();});
        return this.focusNormalised;
    }

    async getISO() {
        this.pullData("/video/iso").then((value) => {this.ISO = value.iso; BMDCamera.updateUIISO();});
        return this.ISO;
    }

    async getGain() {
        this.pullData("/video/gain").then((value) => {this.gain = value.gain; BMDCamera.updateUIgain();});
        return this.gain;
    }

    async getWhiteBalance() {
        this.pullData("/video/whiteBalance").then((value) => {this.WhiteBalance = value.whiteBalance});
        this.pullData("/video/whiteBalanceTint").then((value) => {this.WhiteBalanceTint = value.whiteBalanceTint; BMDCamera.updateUIWhiteBalance();});
        return this.WhiteBalance;
    }

    async getND() {
        this.pullData("/video/ndFilter").then((value) => {this.NDStop = value.stop});
        this.pullData("/video/ndFilter/displayMode").then((value) => {this.NDMode = value.displayMode; BMDCamera.updateUINDStop();});
        return this.NDStop;
    }

    async getShutter() {
        this.shutter = await this.pullData("/video/shutter");
        BMDCamera.updateUIshutter();
        return this.shutter;
    }

    async getAutoExposureMode() {
        this.AutoExposureMode = await this.pullData("/video/autoExposure");
        BMDCamera.updateUIAutoExposureMode();
        return this.AutoExposureMode;
    }

    // This one just fetches the data and stores it in the normal objects. No return value.
    async getColorCorrection() {
        this.CClift = await this.pullData("/colorCorrection/lift");
        this.CCgamma = await this.pullData("/colorCorrection/gamma");
        this.CCgain = await this.pullData("/colorCorrection/gain");
        this.CCoffset = await this.pullData("/colorCorrection/offset");
        this.CCcontrast = await this.pullData("/colorCorrection/contrast");
        this.CCcolor = await this.pullData("/colorCorrection/color");
        this.CClumacontribution = await this.pullData("/colorCorrection/lumaContribution");
        BMDCamera.updateUIColorCorrection();
    }

    // This method usually takes 200-250 ms
    async getAllInfo() {
        await this.getFormat();
        await this.getTransportMode();
        await this.getPlaybackState();
        await this.getRecordState();
        await this.getTimecode();
        await this.getPresets();
        await this.getActivePreset();
        await this.getAperture();
        await this.getZoom();
        await this.getFocus();
        await this.getISO();
        await this.getGain();
        await this.getWhiteBalance();
        await this.getND();
        await this.getShutter();
        await this.getAutoExposureMode();
        await this.getColorCorrection();
    }

    // =============== SETTERS ==================

    // name, hostname, APIaddress should never have to be set

    async setCodecFormat(newCodecFormatObject) {
        await this.pushData("/system/codecFormat",newCodecFormatObject);
        await sleep(500);
        await this.getCodecFormat();
    }

    async setVideoFormat(newVideoFormatObject) {
        await this.pushData("/system/videoFormat",newVideoFormatObject);
        await sleep(500);
        await this.getCodecFormat();
    }

    async setTransportMode(newTransportModeString) {
        await this.pushData("/transports/0",{"mode": newTransportModeString});
        await sleep(500);
        await this.getTransportMode();
    }

    async setPlaybackState(playbackStateObject) {
        await this.pushData("/transports/0/playback",playbackStateObject);
        await sleep(500);
        await this.getPlaybackState();
    }

    async sendPresetFile(file) {
        await sendRequest("POST",this.APIAddress+"/presets",file);
    }

    async setActivePreset(presetString) {
        await this.pushData("/presets/active",{"preset": presetString});
        await sleep(500);
        await this.getAllInfo();
    }

    async updatePreset(presetString) {
        await this.pushData("/presets/active",{"preset": presetString});
        await sleep(500);
        await this.getPresets();
    }

    async setAperture(apertureNormalisedFloat) {
        await this.pushData("/lens/iris",{"normalised": apertureNormalisedFloat});
        await sleep(1500);
        await this.getAperture();
    }

    async setZoom(zoomNormalisedFloat) {
        await this.pushData("/lens/zoom",{"normalised": zoomNormalisedFloat});
        await sleep(1500);
        await this.getZoom();
    }

    async setFocus(focusNormalisedFloat) {
        await this.pushData("/lens/focus",{"normalised": focusNormalisedFloat});
        await sleep(1500);
        await this.getFocus();
    }

    async setISO(ISOint) {
        await this.pushData("/video/iso",{"iso":ISOint});
        await sleep(500);
        await this.getISO();
        await this.getGain();
    }

    async setGain(gainInt) {
        await this.pushData("/video/gain",{"gain":gainInt});
        await sleep(500);
        await this.getGain();
        await this.getISO();
    }

    async setWhiteBalance(whiteBalanceInt, whiteBalanceTintInt) {
        await this.pushData("/video/whiteBalance",{"whiteBalance": whiteBalanceInt});
        await this.pushData("/video/whiteBalanceTint",{"whiteBalanceTint": whiteBalanceTintInt});
        await sleep(500);
        await this.getWhiteBalance();
    }

    async setND(NDstopInt) {
        await this.pushData("/video/ndFilter",{"stop": NDstopInt});
        await sleep(500);
        await this.getND();
    }

    async setNDDisplayMode(displayModeString) {
        await this.pushData("/video/ndFilter/displayMode",{"displayMode": displayModeString});
        await sleep(500);
        await this.getND();
    }

    // Accepts JSON obejcts with either shutterSpeed or shutterAngle properties
    // Note that the shutterAngle value returned by the API is 100x the actual value
    async setShutter(shutterObject) {
        await this.pushData("/video/shutter",shutterObject);
        await sleep(500);
        await this.getShutter();
    }

    async setAutoExposureMode(AEmodeObject) {
        await this.pushData("/video/autoExposure",AEmodeObject);
        await sleep(500);
        await this.getAutoExposureMode();
    }

    async setCCLift(CCliftObject) {
        await this.pushData("/colorCorrection/lift",CCliftObject);
        await sleep(500);
        await this.getColorCorrection();
    }

    async setCCGamma(CCgammaObject) {
        await this.pushData("/colorCorrection/gamma",CCgammaObject);
        await sleep(500);
        await this.getColorCorrection();
    }

    async setCCGain(CCgainObject) {
        await this.pushData("/colorCorrection/gain",CCgainObject);
        await sleep(500);
        await this.getColorCorrection();
    }

    async setCCOffset(CCoffsetObject) {
        await this.pushData("/colorCorrection/offset",CCoffsetObject);
        await sleep(500);
        await this.getColorCorrection();
    }

    async setCCContrast(CCcontrastObject) {
        await this.pushData("/colorCorrection/contrast",CCcontrastObject);
        await sleep(500);
        await this.getColorCorrection();
    }

    async setCCColor(CCcolorObject) {
        await this.pushData("/colorCorrection/color",CCcolorObject);
        await sleep(500);
        await this.getColorCorrection();
    }

    async setCCLumaContribuion(CClumacontributionObject) {
        await this.pushData("/colorCorrection/lumaContribution",CClumacontributionObject);
        await sleep(500);
        await this.getColorCorrection();
    }

    // =============== Other Commands =======================
    async doAutoFocus() {
        await this.pushData("/lens/focus/doAutoFocus");
        sleep(1500).then(() => this.getFocus());
    }

    async play() {
        await this.pushData("/transports/0/play");
        await sleep(500);
        await this.getPlaybackState();
    }

    async record() {
        await this.pushData("/transports/0/record",{"recording": true});
        await sleep(1000);
        await this.getRecordState();
    }

    async stopTransport() {
        await this.pushData("/transports/0/stop");
        await sleep(1000);
        await this.getPlaybackState();
    }

    async stopRecord() {
        await this.pushData("/transports/0/record",{"recording": false});
        await sleep(1000);
        await this.getRecordState();
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

/* (c) Dylan Speiser 2024              
   github.com/DylanSpeiser */