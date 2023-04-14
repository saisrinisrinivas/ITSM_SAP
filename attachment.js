// This code sample uses the 'node-fetch' and 'form-data' libraries:
 // https://www.npmjs.com/package/node-fetch
 // https://www.npmjs.com/package/form-data
 const fetch = require('node-fetch');
 const FormData = require('form-data');
 const fs = require('fs');
 const libraries = require("./ITSM_lib.js");
 const app = require("./App");
 const jiraAuth = require('./jiraAuth.json');

 const filePath = '/home/mint/Desktop/SAP_ITSM_2/SAP_ITSM/attachment.xlsx';
 const form = new FormData();
 const stats = fs.statSync(filePath);
 const fileSizeInBytes = stats.size;
 const fileStream = fs.createReadStream(filePath);

 form.append('file', fileStream, {knownLength: fileSizeInBytes});

 fetch('https://http://20.219.158.93:9000/rest/api/3/issue/SAP-83/attachments', {
     method: 'POST',
     body: form,
     headers: {
         'Authorization': 'jiraAuth',
         'Accept': 'application/json',
         'X-Atlassian-Token': 'no-check'
     }
 })
     .then(response => {
         console.log(
             `Response: ${response.status} ${response.statusText}`
         );
         return response.text();
     })
     .then(text => console.log(text))
     .catch(err => console.error(err));