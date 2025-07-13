const fs = require("fs");
const path = require("path");

/*
{
	item_name: {
		isDirectory: boolean - if item is a directory
		content: string - if file, file content
		id: string - id for reference
		path: string - absolute file path assigned AFTER main export function runs
		subitems: object {..., items} - if directory, items inside it
	}
}
*/
const files = {
	"Resource Swapper": {
		isDirectory: true,
		id: "swapperPath",
		subitems: {
			"css": {
				isDirectory: true,
				id: "swapperPath_css"
			}
		}
	}
}

module.exports = function(app, settings) {
	// directory path where all the aforementioned files/folders will be stored.
	const userConfigPath = app.getPath(settings.get("userConfigPath") || "userData");

	(function checkUpdatePathsRecursive(entryObj, cwd=""){
		for(const fileitem of Object.entries(entryObj)){
			const [fname, data] = fileitem;

			// assign the absolute path to the object
			data.path = path.join(userConfigPath, cwd, fname);

			// create only if it does not exist
			if(!(fs.existsSync(data.path))){
				let wasSuccess = true;
				if(data.isDirectory){
					try {
						fs.mkdirSync(data.path);
					} catch (e) {
						console.log("error", e);
						wasSuccess = false;
					}
				} else {
					try {
						fs.writeFileSync(data.path, data.content || "");
					} catch (e) {
						console.log("error", e);
						wasSuccess = false;
					}
				}
				console.log(wasSuccess ? "successfully created" : "failed to create", data.path);
			}

			// run this function again with subitems and cwd if needed
			if(data.isDirectory && data.subitems && Object.keys(data.subitems).length > 0){
				checkUpdatePathsRecursive(data.subitems, path.join(cwd, fname));
			}
		}
	})(files);

	return files;
};