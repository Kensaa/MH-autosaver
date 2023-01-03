import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'

const homeFolder = os.homedir()
const softwareFolder = os.platform() === 'win32' ? path.join(homeFolder, 'AppData', 'Roaming', 'mh-autosave') : path.join(homeFolder, '.mh-autosave')
const steamFolder = os.platform() === 'win32' ? path.join('C:', 'Program Files (x86)', 'Steam', 'userdata') : path.join(homeFolder, '.steam', 'steam', 'userdata')
const configPath = path.join(softwareFolder, 'config.json')

const defaultConfig: Config = {
    saveLocation: path.join(softwareFolder, 'saves'),
    steamLocation: steamFolder
}

checkFolder(softwareFolder)
let config: Config;
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4))
    config = defaultConfig
} else {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Config
}

checkFolder(config.saveLocation)

function checkFolder(folder: string) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
    }
}

const gameID = {
    'mhw': '582010',
    'mhr': '1446780',
}

const date = new Date()
const dayString = `${date.getDay()}-${date.getMonth()+1}-${date.getFullYear()}`

for(const weirdFolder of fs.readdirSync(config.steamLocation)){
    //if file is not a folder, skip
    if(!fs.statSync(path.join(config.steamLocation, weirdFolder)).isDirectory()) continue
    for(const [name, id] of Object.entries(gameID)){
        if(!fs.existsSync(path.join(config.steamLocation, weirdFolder, id))) continue
        //game exists in steam folder
        //copy it to save folder
        const saveFolder = path.join(config.saveLocation, dayString)
        checkFolder(saveFolder)
        const gameSaveFolder = path.join(saveFolder, name)
        checkFolder(gameSaveFolder)
        copyFolder(path.join(config.steamLocation, weirdFolder, id), gameSaveFolder)        
    }
}

function copyFolder(from: string, to: string) {
    if(!fs.existsSync(from)) return
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to)
    }
    
    for (const file of fs.readdirSync(from)) {
        const fromPath = path.join(from, file)
        const toPath = path.join(to, file)
        console.log('file : ' + fromPath + ' to ' + toPath)
        console.log(fs.statSync(fromPath).isDirectory() ? 'is dir' : 'is file')
        console.log()
        if(fs.statSync(fromPath).isDirectory()){
            copyFolder(fromPath, toPath)
        }else {
            fs.copyFileSync(fromPath, toPath)
        }
    }
}