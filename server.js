var fs = require('fs');
var path = require('path');
var express = require('express');
var people = require('./people');
var app = express();
var port = process.env.PORT || 8000;

var personTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'person.html'), 'utf8');

// Serve static files from public/.
app.use(express.static(path.join(__dirname, 'public')));

/*
 * For the /people route, we dynamically build the content of the page using
 * the set of all available people by looping over the people and inserting
 * an HTML element representing each one.
 */
app.get('/people', function (req, res) {

  var content = "<html>";
  content += "<head>"
  content += "<meta charset='utf-8'>"
  content += "<title>Express Dynamic Content Demo - People</title>"
  content += "<link rel='stylesheet' href='/style.css'>"
  content += "</head>"
  content += "<body>"
  content += "<header>"
  content += "<h1>Famous People</h1>"
  content += "</header>"
  content += "<main>"

  Object.keys(people).forEach(function (person) {
    content += "<div class='person'>";
    content += "<p><a href='/people/" + person + "'>" + people[person].name + "</p>";
    content += "</div>";
  });

  content += "</main>"
  content += "</body>"
  content += "</html>";

  res.send(content);

});

/*
 * Here, we use a dynamic route to create a page for each person.  We use
 * Express machinery to get the requested person from the URL and then fill
 * in a template with that person's info.
 */
app.get('/people/:person', function (req, res, next) {

  var person = people[req.params.person];

  if (person) {

    var content = personTemplate;

    /*
     * Use regular expressions to replace our template patterns with the
     * actual info associated with the given person.
     */
    content = content.replace(new RegExp('{{{NAME}}}', 'g'), person.name);
    content = content.replace(new RegExp('{{{JOB}}}', 'g'), person.job);
    content = content.replace(new RegExp('{{{AGE}}}', 'g'), person.age);

    res.send(content);

  } else {

    // If we don't have info for the requested person, fall through to a 404.
    next();

  }

});

// If we didn't find the requested resource, send a 404 error.
app.get('*', function(req, res) {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Listen on the specified port.
app.listen(port, function () {
  console.log("== Listening on port", port);
});
