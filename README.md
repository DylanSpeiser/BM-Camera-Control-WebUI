# BM Camera Control WebUI
This web app is a demonstration of the [Blackmagic Design](https://blackmagicdesign.com) Camera Control REST API via an extensible web interface. Modeled after the interface of ATEM Software Control, most of the major functions of the camera that can be controlled by the API are available here.

>This program was written based on the official REST API documentation from Blackmagic, which can be found [here](https://documents.blackmagicdesign.com/DeveloperManuals/RESTAPIforBlackmagicCameras.pdf)

Using this tool, you can control many features of your Blackmagic studio and cinema cameras *without any extra hardware!* Use it for remote monitoring, color correction, focus pulling, or keeping tabs on your eqiupment. The `BMD-Camera-Control.js` file is also useful if you want to write your own web app using the REST API.

![Screenshot 1](screenshots/WebUI1.png)

# Getting Started

## Camera Setup
In order for the camera's API to be active, network connectivity must be enabled in **Blackmagic Camera Setup**, and the camera should be connected to the same network as your computer with an ethernet cable.
<br>
If your camera does not have an ethernet port, use a USB-C to ethernet adapter.

>Make sure that your camera has been updated to the latest firmware! (8.6+)

![BM Camera Setup](screenshots/BMCameraSetup2.png)

## Launching the App
The app is a self-contained, offline web page. (No installation, dependencies, or Node.js installations to worry about!) Simply open the `index.html` file in your browser of choice, enter the hostname of your camera, and press "Connect".
<br><br>
If you don't know the hostname of your camera, you can find and/or change it in **Blackmagic Camera Setup**.
<br>
(The hostname is the camera's name with spaces replaced with dashes, and `.local` appended to the end)
<br><br>
Not all camera and lens combinations are supported by the API (Some cameras have ND filters, some don't. Some electronic zoom lenses work, some don't.)

# Using the App

### Data Synchronization
The app polls data from the camera every ten seconds (you'll see "Refreshing..." in the corner). When you change a setting in the browser, it relays that to the camera and verifies the change. If you make a change that reverts after a few seconds, that means the camera rejected it. The page can be manually refreshed with the button in the bottom left corner.

### Arrows, Buttons, and Text Boxes
Many controls work both with sliders/buttons, but if you want to enter a specific value then click on the number and enter the value manually.
<br>
(Sometimes this might take a couple of tries).
<br>

### Media Management
To view files on the drives of your camera, follow the link in the bottom-right corder for the **Web Media Manager**. This will take you to *your camera's* internal web server where you can view, download, and upload video files over the network.

### Manual API Calls
The page allows for the sending of manual API calls to the camera. Use the text boxes to do that, after consulting the documentation.

### Layout
I have done my best to make the page responsive, but every screen is different. If something looks off, adjust the zoom/scale of the window in your browser and that should fix things.

# Compatibility
This app (as of June 2024), should be compatible with the following Blackmagic cameras:
| Camera Name | Default Hostname | Notes |
|-|-|-|
| Pocket Cinema Camera 4K | `Pocket-Cinema-Camera-4K.local` | FW 8.6+ Required |
| Pocket Cinema Camera 6K | `Pocket-Cinema-Camera-6K.local` | FW 8.6+ Required |
| Pocket Cinema Camera 6K Pro | `Pocket-Cinema-Camera-6K-Pro.local` | FW 8.6+ Required |
| Cinema Camera 6K | `Cinema-Camera-6K.local` | |
| URSA Broadcast G2 | `URSA-Broadcast-G2.local`$^1$ | |
| Micro Studio Camera 4K G2 | `Micro-Studio-Camera-4K-G2.local`$^1$ | |
| Studio Camera 4K Plus | `Studio-Camera-4K-Plus.local` | |
| Studio Camera 4K Pro | `Studio-Camera-4K-Pro.local` | |
| Studio Camera 4K Plus G2 | `Studio-Camera-4K-Plus-G2.local`$^1$ | |
| Studio Camera 4K Pro G2 | `Studio-Camera-4K-Pro-G2.local`$^1$ | |
| Studio Camera 6K Pro | `Studio-Camera-6K-Pro.local` | |

$^1:$ Unverified best guess <br>
If any of this information is incorrect, please let me know in the Issues section of this repository.

# Issues and To-Dos
## Known Issues
- Page responsiveness
- Editable spans are hard to use

## Unknown Issues
Please report issues to the repo's issue tracker so I can fix them!
<br>
If you're having trouble and don't know why, check the browser console.

## To-Do
- Use WebSockets instead of polling to keep the page in sync
- Make a better UI for color correction
- Add audio settings
- Add codec/format switching settings
- Improve responsiveness
- Improved error handling