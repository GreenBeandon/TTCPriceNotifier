const https = require('https');
const fs = require('fs');
const extract = require('extract-zip');
const path = require('path');
var target = "downloads";
var gfiles = ['ItemLookUpTable_EN.lua', 'PriceTable.lua'];
module.exports = {
	name: 'testfulldownload',
	description: 'This command is for testing downloading, extracting, and removing un-needed files',
	async execute(message, args) {

    const file = fs.createWriteStream(target + "/test.zip");
    const request = https.get('https://us.tamrieltradecentre.com/download/PriceTable', async function(response){
			try{
				await response.pipe(file);
				file.on('finish', async function() {
      		file.close();  // close() is async, call cb after close completes.
					try{
						var toRemove = [];
						await extract (file.path, {dir: path.resolve(target), onEntry: function(entry, zipfile){
							if(!gfiles.includes(entry.fileName) )
								toRemove.push(path.resolve(target + "/" + entry.fileName));
						}});
						toRemove.push(file.path);
						try{

							toRemove.forEach(element => {
								fs.unlinkSync(element);

							})
						}
						catch (e3){
							message.reply ("Something went wrong when trying to delete files")
							message.reply(e3.message);
						}
					}
					catch (e2){
						message.reply ("Something went wrong when trying to extract file")
						message.reply(e2.message);
					}
    		});
			}
      catch(e1){
				message.reply ("Something went wrong when trying to download file")
				message.reply(e1.message);
			}


    });



	},
};
