const fs = require("fs");
const path = require("path");

/*
settingsBlueprint
{
    key: {
        type: "string" / "boolean" / "number",
        allowed_values: [... val: string], (array containing all allowed values for type: "string")
        range: [min: number, max: number, step: number], (for type: number)
        default: number (index of value in allowed_values)
    }
}
*/
const settingsBlueprint = require("../settings_blueprint.json");

// extract {settingname: value} from blueprint
const defaultSettings = Object.fromEntries(Object.entries(settingsBlueprint).map(([key,data])=>{
    let d4ltval = data.default;
    if(data.type === "string"){
        d4ltval = data.allowed_values[d4ltval]
    } else if(data.type === "boolean"){
        d4ltval = d4ltval == 1; // type-coercive equality (can use 1/0 or true/false in the default value)
    }
    return [key, d4ltval];
}));

class SettingsManager {
    settings = {};
    settingsFilePath = null;
    
    set = (key, val) => {
        this.settings[key] = val;
        this.updateFile();
    }

    get = (key) => {
        return this.settings[key];
    }

    updateFile = () => {
        if(this.settingsFilePath){
            try {
                fs.writeFileSync(this.settingsFilePath, JSON.stringify(this.settings));
                console.log("settings write complete")
            } catch (e) {
                console.log("settings write error,", e);
            }
        } else {
            console.log("settings write error!", "where is settingsFilePath :wilted_rose:");
        }
    }

    checkValues = () => {
        let requiresRewrite = false;
        for(const [key, value] of Object.entries(this.settings)){
            if(settingsBlueprint[key]){
                const type = settingsBlueprint[key].type;
                if(type === "string"){
                    if(!(settingsBlueprint[key].allowed_values.includes(value))){
                        this.settings[key] = settingsBlueprint[key].allowed_values[settingsBlueprint[key].default];
                        requiresRewrite = true;
                    }
                } else if(type === "boolean"){
                    if(typeof value != "boolean"){
                        this.settings[key] = settingsBlueprint[key].default == 1; // type-coercive equality (can use 1/0 or true/false in the default value)
                        requiresRewrite = true;
                    }
                } else if(type === "number"){
                    if(typeof value != "number"){
                        this.settings[key] = settingsBlueprint[key].default;
                        requiresRewrite = true;
                    }
                }
            }
        }
        if(requiresRewrite){
            this.updateFile();
        }
    }

    constructor(data, settingsFilePath) {
        let parsed = null;
        let requiresRewrite = false;

        // handle case where data was null / invalid, to use default settings, and save if required
        // also handles first run case
        if(!data || !(typeof data === "string") || !data.length || data.length < 1){
            console.log("settings error!", "invalid data read");
            parsed = defaultSettings;
            requiresRewrite = true;
        } else {
            try {
                parsed = JSON.parse(data);
                if(Array.isArray(data)){
                    throw "data json was an array";
                }
            } catch (e) {
                console.log("settings error,", e);
                parsed = defaultSettings;
                requiresRewrite = true;
            }
        }
        
        this.settings = parsed;
        this.settingsFilePath = settingsFilePath;
        if(requiresRewrite){
            this.updateFile();
        }
        this.checkValues();
    }
}

module.exports = (app) => {
    // SettingsManager handles cases of file not existing or invalid stored data
    let readConfigData = null;
    const settingsFilePath = path.join(app.getPath("userData"), "client_settings.json");
    try{
        if(fs.existsSync(settingsFilePath)){
            readConfigData = fs.readFileSync(settingsFilePath).toString();
        }
    }catch(e){
        console.log("settings error,", e);
    }
    return new SettingsManager(readConfigData, settingsFilePath);
}