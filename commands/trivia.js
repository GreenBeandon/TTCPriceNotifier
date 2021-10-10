const fs = require('fs');
const path = require('path');
const TIME_IN_SECONDS_FOR_QUESTION = 5

let channelID = "778743468964708352";
let questionAmount = 50;
let currentIndex = 0;
let selectedQuestions = []
let channel = null
let CanStart = true;
let scores = [];
var questionEnded = false;

module.exports = {
	name: 'trivia',
	description: 'This command begins trivia mode',
	execute(message, args) {
		if (message.channel.id === channelID) {
			 if(CanStart){
				 CanStart = false;
				 channel = message.channel;
				 channel.send('Beginning trivia!');
          /*********************************************************/
					/*THE COMMENTED OUT LINE IS THE REAL QUESTIONS*/
					/*********************************************************/
				 let allTriviaQuestions = readTriviaFile();
				  //selectedQuestions = selectTriviaQuestions(allTriviaQuestions);
			 		selectedQuestions = [
				 	{
						question: "This is the first test?",
						answer: "test"
					},
					{
						question: "This is the second test?",
						answer: "test"
					},
					{
						question: "This is the third test?",
						answer: "test"
					},
				]
				/*********************************************************/
					NextQuestion();
			 }

			 return null;
    }
    else //if (message.channel.id !== '778743468964708352')
      return message.channel.send('This is not an appropriate channel for trivia.');
    },
};
//RESET ALL TRIVIA VALUES
function EndTrivia(){
	DetermineWinner();
	currentIndex = 0;
	selectedQuestions = [];
	CanStart = true;
	scores = [];
	channel.send("End of Trivia")
}

function DetermineWinner(){

var max = 0;
var winners = [];
var winnerstext = "";
var scoresplural = "points";

//If no one scored, end before doing anything else
if(scores === []){
	channel.send("Uh oh... Nobody scored anything. Oh well! Better luck next time!");
	return;
}

//Iterate through the scores to get the max possible value
for ( k in scores){
	if(scores[k].points > max) max = scores[k].points;
}
//Simple formatting check for the "THIS PERSON WON YAY" section
if(max === 1) scoresplural = "point";

//Iterate through the scores again and check the score against the max and add all the winners to a list
for (j in scores){
	var current = scores[j];
	if(current.points === max){
		winners.push(current.username);
	}
}
//iterate through the winners to create the proper formatting for the text
for(var i = 0;i<winners.length; i++){
	if(i === 0) winnerstext = winners[i];
	else if(i=== winners.length -1){
		if(winners.length > 2) winnerstext += ", and " + winners[i];
		else winnerstext += " and " + winners[i];
	}
	else winnerstext += ", " + winners[i];
}

//if theres more than one winner
if(winners.length > 1){
	channel.send(`${winnerstext} are the winners with ${max} ${scoresplural} each!`);
} //Otherwise theres only one winner
else channel.send(`${winnerstext} is the winner with ${max} ${scoresplural}!`);
}


function Score(id, username, points){
	//if this user already has a point, add one
	if (scores[id] !== undefined){
		scores[id].points += points;
	}
	//otherwise create the entry
	else{
		scores[id] = {username: username, points: points};
	}
	console.log(scores);
}
function NextQuestion(){
	//if there are no more questions, end
	if(currentIndex >= selectedQuestions.length){
		EndTrivia();
		return;
	}
	//ask the next quesiton
	AskQuestion(selectedQuestions[currentIndex], channel);
	currentIndex += 1;
}
function AskQuestion(q, channel){
	questionEnded = false;
	//ask the question
	channel.send(q.question);
	//get rid of case and spaces, and set the answer
	const filter = m => m.content.toLowerCase().trim() === q.answer.toLowerCase().trim();
	//create a message filter for everytime a user types "filter" until the time is up
	const collector = channel.createMessageCollector(filter, { time: TIME_IN_SECONDS_FOR_QUESTION * 1000 });

	//event handler for everytime someone gets the answer right
	collector.on('collect', m => {
		//console.log(`Collected ${m.content}`);
	});
  //when the question is over
	collector.on('end', collected => {
		questionEnded = true;
		//get everyone who has answered correctly and remove all duplicates
		const unique = (value, index, self) => {
  		return self.indexOf(value) === index
		}
		var cn = collected.map(function(entry){
			return { username: entry.author.username, id: entry.author.id};
		}).filter(unique);
		//make a full copy of the winners to try and combat "last second answers"
		var collectedNames = JSON.parse(JSON.stringify(cn));
		var collectedNamesString = "";
		var length = collectedNames.length;
		//Create the formatted string for winners
		for(var j = 0; j < length; j++){
			var user = collectedNames[j].username;
			if(j === 0){
				collectedNamesString = user
			}
			else if(j === length -1){
				if(j > 2){
					collectedNamesString += ", and " + user;
				}
				else{
					collectedNamesString += " and " + user;
				}

			}
			else collectedNamesString += ", " + user;
		}

		//console.log(collectedNamesString)
		//console.log(`Collected ${collectedNames.length} items`);

		//if there are winners
		if(collectedNames.length > 0){
			//if there is more than 1 winner
			if(collectedNames.length > 1){
				channel.send(`Congrats! ${collectedNames.length} people correctly guessed '${q.answer}': ${collectedNamesString}!`);
			} //otherwise only one winner
			else{
				channel.send(`Congrats! ${collectedNamesString} was the only one to correctly guess '${q.answer}'!`);
			}
			//score!
			for(var i = 0; i < collectedNames.length; i++){
				Score(collectedNames[i].id, collectedNames[i].username, 1);
			}
		}
		else{ //nobody guessed it right :(
			channel.send(`No one guessed it right... Moving on!`);

		}
		//Next question
		NextQuestion();
	});
}

//Get a number between 1 and MAX
function GetTriviaIndexNumber(max){
	return Math.floor((Math.random() * max) + 1);
}
function selectTriviaQuestionIndex(selectedNumbers, max){
	//get rand num
	var num = GetTriviaIndexNumber(max)
	if(selectedNumbers.includes(num)) //if the num has been selected
		return selectTriviaQuestionIndex(selectedNumbers, max); //retry
	return num; //return rand num
}
function selectTriviaQuestions(allquestions){
	var max = allquestions.length; //get total questions
	let selectedtriviaindex = [];
	returnQuestions = [];
	for(var j = 0; j < questionAmount; j++){
		//Select question
		var cnum = selectTriviaQuestionIndex(selectedtriviaindex, max);
		returnQuestions.push(allquestions[cnum]);
		selectedtriviaindex.push(cnum);
	}
	return returnQuestions;
}
function readTriviaFile(){
	//Read the trivia file and separate all each entry. Return list of {question, answer}
	let filename = "Trivia.txt"
	var returnQuestions = [];
	var test;
	var trivia = fs.readFileSync(filename).toString();
	//Convert the text to a string and remove all tabs and new lines before spliting each question up.
  let questions = trivia.toString().replace(/\r/g, "").replace(/\n/g, "").split(']');
	for(var i = 0; i < questions.length - 1; i++){
		var q = questions[i];
		//split up the question and answer
		var q_split = q.split("|");

		//Create the question object that we'll add to the return list
		var qo = {
			question: q_split[0].trim(),
			answer: q_split[1].trim()
		};

		returnQuestions.push(qo)

	}
	return returnQuestions;
}
