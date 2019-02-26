// Do not change lines 1-26
var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
var listener = app.listen(8081, function() {
  console.log('Your app is listening on port 8081');
});
app.get("/", function (request, response) {
  var fileContents = fs.readFileSync(__dirname +'/private/index.html', 'utf8');
  fileContents = fileContents.replace('$titleValue', '');
  fileContents = fileContents.replace('$dueDateValue', '');
  fileContents = fileContents.replace('$priorityValue', '');
  fileContents = fileContents.replace('$addName', 'add');
  fileContents = fileContents.replace('$addIcon', iconPlus);
  fileContents = fileContents.replace("$toDoList", showList());
  response.send(fileContents);
});
   
var databaseFile = fs.readFileSync(__dirname +'/database.json', 'utf8');
var toDoList = JSON.parse(databaseFile);

// -------------------------

app.post("/action", function (request, response) {
  var fileContents = fs.readFileSync(__dirname +'/private/index.html', 'utf8');
  var command = Object.keys(request.body)[3];
  var action = command.split('.')[0];
  if(action == 'add'){
    var title = request.body.title;
    var dueDate = request.body.dueDate;
    var priority = request.body.priority;
    toDoList.push({title:title,dueDate:dueDate,priority:priority,completed:false});
  }else if(action == 'delete'){
    var index = Number(command.split('.')[1]);
    toDoList.splice(index, 1);
    console.log(command.split('.')[1]);
  }else if(action == 'edit'){
    var index = Number(command.split('.')[1]);
    var tempItem = toDoList[index];
    var tempTitle = tempItem.title;
    var tempDueDate = tempItem.dueDate;
    var tempPriority = tempItem.priority;
    fileContents = fileContents.replace('$titleValue', tempTitle);
    fileContents = fileContents.replace('$dueDateValue', tempDueDate);
    fileContents = fileContents.replace('$priorityValue', tempPriority);
    fileContents = fileContents.replace('$addName', 'change.'+index);
  fileContents = fileContents.replace('$addIcon', iconEdit);
  }else if(action == 'change'){
    var index = Number(command.split('.')[1]);
    var title = request.body.title;
    var dueDate = request.body.dueDate;
    var priority = request.body.priority;
    toDoList[index].title = title;
    toDoList[index].dueDate = dueDate;
    toDoList[index].priority = priority;
  }else if(action == 'complete'){
    var index = Number(command.split('.')[1]);
    toDoList[index].completed = !toDoList[index].completed;
  }
  fs.writeFile(__dirname +'/database.json', JSON.stringify(toDoList), function(err) {});
  fileContents = fileContents.replace('$titleValue', '');
  fileContents = fileContents.replace('$dueDateValue', '');
  fileContents = fileContents.replace('$priorityValue', '');
  fileContents = fileContents.replace('$addName', 'add');
  fileContents = fileContents.replace('$addIcon', iconPlus);
  fileContents = fileContents.replace('$toDoList', showList());
  response.send(fileContents);
});

var iconPlus = 'https://cdn.glitch.com/2393a83b-f9b6-4274-80f8-abfe2354b684%2Fplus.png?1518996598274';
var iconMinus = 'https://cdn.glitch.com/2393a83b-f9b6-4274-80f8-abfe2354b684%2Fminus.png?1518996598280';
var iconChecked = 'https://cdn.glitch.com/2393a83b-f9b6-4274-80f8-abfe2354b684%2Fckecked.png?1518996598345';
var iconUnchecked = 'https://cdn.glitch.com/2393a83b-f9b6-4274-80f8-abfe2354b684%2Funchecked.png?1518996598351';
var iconEdit = 'https://cdn.glitch.com/2393a83b-f9b6-4274-80f8-abfe2354b684%2Fedit.png?1518996829823';

function showList(){
  var length = toDoList.length;
  var ul = '<table>';
  for(var i = 0 ; i < length; i++){
    var color='';
    var icon = iconUnchecked;
    switch(toDoList[i].priority){
      case '1': color = '#ffabab'; break;
      case '2': color = '#ffecab'; break;
      case '3': color = '#abffac'; break;
      case '4': color = '#abfff9'; break;
    }
    if(toDoList[i].completed){
      color = '#cccccc';
      icon = iconChecked;
    }
    ul += '<tr style="background-color:'+color+'"><td><input type="image" name="complete.'+i+'" src="'+icon+'"><input type="image" name="edit.'+i+'" src="'+iconEdit+'"></td><td>'+toDoList[i].title+'</td><td>'+toDoList[i].dueDate+'</td><td><input type="image" name="delete.'+i+'" src="'+iconMinus+'"></button></tr>';
  }
  ul += '</table>';
  return ul;
}