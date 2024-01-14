# MH Autosaver

A little software used to autosave Monster Hunter saves because steam cloud is kinda cringe sometimes

## Supported Games:

-   Monster Hunter World
-   Monster Hunter Rise

## Installation

-   Download the latest binary from the [release](https://github.com/Kensaa/MH-autosaver/releases/latest) page.
-   Place it wherever you want, the location will be referred as `[binary_folder]`
-   Open steam, right-click on the Monster Hunter game you want to autosave and click `Properties`
-   Change `Launch Options` to `[binary_folder]\mh-autosaver-win.exe %command%` \
    For example, if you placed the binary in `C:\Games`, the Launch Options will be `C:\Games\mh-autosaver-win.exe %command%`

Note: if you are using this on Linux, don't forget to replace `\` by `/`

## How does it work ?

Every time you close the game, the software will make a zip archive of the save in this folder:

-   **Windows** : `%appdata%\mh-autosaver\saves\[date]\[game]\[time].zip`
-   **Linux** : `~/.mh-autosaver/saves/[date]/[game]/[time].zip`

## Config

The software should work out of the box, but if you can edit the config in :

-   **Windows** : `%appdata%\mh-autosaver\config.json`
-   **Linux** : `~/.mh-autosaver/config.json`

Config fields:

-   **saveLocation** : The save folder
-   **steamLocation** : path to your `userdata` folder inside the steam folder (used to get save files)

Note: If You force exit the game from steam, the software won't be able to copy your save. \
Note 2: This hasn't been tested on Linux yet.
