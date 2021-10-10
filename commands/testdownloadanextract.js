const https = require('https');
const fs = require('fs');
const extract = require('extract-zip');
const path = require('path');
var target = "downloads";
module.exports = {
	name: 'testdownloadandextract',
	description: 'This command is for testing downloading and extracting files',
	async execute(message, args) {

    const file = fs.createWriteStream(target + "/test.zip");
    const request = https.get('https://us.tamrieltradecentre.com/download/PriceTable', async function(response){
			try{
				await response.pipe(file);
				file.on('finish', async function() {
      		file.close();  // close() is async, call cb after close completes.
					try{
						await extract (file.path, {dir: path.resolve(target)})
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
