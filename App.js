var express = require('express');
const libraries = require("./ITSM_lib");
const swaggerDoc = require("swagger-ui-express");
const swaggerDocumentation = require ("./documentation")
const axios = require('axios');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

const PORT = 7777;


app.use("/documentations", swaggerDoc.serve);
app.use("/documentations", swaggerDoc.setup(swaggerDocumentation));

// configure the welcome page
app.get('/', function(req, res){
    //res.status(200);
    res.send('JIRA SERVER HOMEPAGE');
});

app.post('/Ticket/API/Create_Ticket', jsonParser, function(req, res) {
    var sapInputdata = req.body;
    const credentials = require("./creds.json");
    const auth = require("./jiraAuth.json");
    const jiraUrl = credentials.jira_url;
    const issueEndpoint = credentials.jira_issueEndpoint;
    var jiraMainurl = jiraUrl + issueEndpoint;
    var arrayLength = sapInputdata.length;
    console.log(`Array received length is ${arrayLength}`);
    var errors = []; // create an array to hold any errors
    for(var i = 0; i < arrayLength; i++){
      var currentSap = sapInputdata[i];
      var sap_severity = libraries.severityMapper(currentSap.SEVERITY);
      console.log(`Updated Jira Severity is : ${sap_severity}`);
      const jira_ticket = libraries.jiraTicket(currentSap, sap_severity);
      console.log(jira_ticket);
      // call the jira_postRequest function and handle errors
      jira_postRequest(jira_ticket, jiraMainurl, auth)
        .then(status => {
          if (status === 200) {
            console.log(`Jira ticket created successfully`);
          } else {
            //console.log(`Jira ticket creation failed with status ${status}`);
            errors.push(status); // add the error status code to the errors array
          }
          if (i === arrayLength) {
            if (errors.length > 0) {
              res.status(errors[0]).send(errors); // return the first error status code to the client
            } else {
              res.status(200).send('200');
            }
          }
        })
        .catch(error => {
          console.log(`Error in posting Jira request: ${error}`);
          errors.push(500); // add a generic server error status code to the errors array
          if (i === arrayLength) {
            res.status(errors[0]).send(errors); // return the first error status code to the client
          }
          return 
        });
    }
  });
  function jira_postRequest(jira_ticket, jira_url, auth) {
    return axios.post(jira_url, jira_ticket, { auth: auth })
      .then(response => {
        console.log(`Jira response status: ${response.status}`);
        return response.status;
      })
      .catch(error => {
        console.log(`Error in posting Jira request: ${error.response.status}`);
        return error.response.status;
      });
  }
  
var server = app.listen(PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
 })