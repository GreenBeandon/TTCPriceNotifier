const https = require('https');
const fs = require('fs');


module.exports = {
	name: 'testdownload',
	description: 'This command is for testing downloading files',
	execute(message, args) {

    const file = fs.createWriteStream("downloads/test.zip");
    const request = https.get('https://us.tamrieltradecentre.com/download/PriceTable', function(response){
      response.pipe(file);
      message.reply(response.statusCode);
    });


	},
};
