'use strict'

/**
 * 
 * Test Web Server Using NodeJS and Express
 *
 */

const fs = require("fs");                                                                          // Load in Required File System
const express = require("express");                                                                // Load in Required Express
const bodyParser = require("body-parser");                                                         // Load in Required Body Parser
const server = express();                                                                          // Create a Server using Express
const portNum = 8080;                                                                              // Declare Port To Listen To

var rawJobData = fs.readFileSync(`${__dirname}/files/jobs.json`, "UTF8");                          // Read in the Raw Job Data
var listOfJobs = JSON.parse(rawJobData.trim());                                                    // Parse the Data as JSON

var jsonParser = bodyParser.json();                                                                // Defind Json Parser to Parse request.body

/**
 * 
 * allJobPostings endpoint. Returns a Complete List of All the Job Postings
 * 
 */
server.get("/allJobPostings", allJobPostings);

/**
 * 
 * addJobListing endpoint. Does not Accept GET Requests
 * 
 */
server.get("/addJobListing", function (request, response) {
    response.status(405);                                                                          // Set a HTTP 405 Error Code
    return response.end("Method not allowed");                                                     // Return a Response Telling the User They are Using and Invalid Method
});

/**
 * 
 * jobListing endpoint. Returns a Single Job Posting
 * 
 */
server.get("/:jobId", findJobListing);

/**
 * 
 * addJobListing endpoint. Adds a Single Job Listing
 * 
 */
server.post("/addJobListing", jsonParser, addJobListing);

/**
 * 
 * allJobPostings endpoint. Does not Accept POST Requests
 * 
 */
server.post("/allJobPostings", function (request, response) {
    response.status(405);                                                                          // Set a HTTP 405 Error Code
    return response.end("Method not allowed");                                                     // Return a Response Telling the User They are Using and Invalid Method
});

/**
 * 
 * jobListing endpoint. Does not Accept POST Requests
 * 
 */
server.post("/:jobId", function (request, response) {
    response.status(405);                                                                          // Set a HTTP 405 Error Code
    return response.end("Method not allowed");                                                     // Return a Response Telling the User They are Using and Invalid Method
});

/**
 * 
 * Attempting to Access Local Host Without Any endpoints Will Give a List of endpoints
 * 
 */
server.get("*", homePage);

var webapp = server.listen(portNum, function () {
    console.log(`Webapp running on http://localhost:${portNum}`);
});

/**
 * 
 * @param {Request}   request   The HTTP Request Received by the Server
 * @param {Response}  response  The HTTP Response Sent back to the User
 * @description  Returns a complete list of all the Jobs Submitted in the jobs.json file
 * 
 */
function allJobPostings (request, response) {
    return response.json(listOfJobs);                                                              // Return All Job Postings
}

/**
 * 
 * @param {Request}   request   The HTTP Request Received by the Server
 * @param {Response}  response  The HTTP Response Sent Back to the User
 * @description  Adds a Job Posting to the jobs.json file
 * 
 */
function addJobListing(request, response) {
    let newJob = request.body;                                                                     // Local Variable to Reduce Amount of Typing to Access request.body

    let newKey = Object.keys(listOfJobs).length + 1;                                               // Grab the Next Key Value to Put in the Job Posting JSON

    if (!newJob.title) {                                                                           // If There is No Job Title...
        response.status(400);                                                                      // Set a 400 HTPP Status
        return response.end("Cannot create job posting without a job title!");                     // Return a Response Telling the User to Provide a Title
    } else if (!newJob.description) {                                                              // Else If There is No Job Description...
        response.status(400);                                                                      // Set a 400 HTTP Status
        return response.end("Cannot create job posting without a job description!");               // Return a Response Telling the User to Provide a Description
    }

    listOfJobs[newKey] = newJob;
    listOfJobs[newKey].requirements = newJob.requirements ? newJob.requirements : "N/A";           // Requirements Aren't Required, so Either Use the Supplied or N/A
    listOfJobs[newKey].datePosted = new Date().getTime();                                          // Date Posted is the Current Time

    fs.writeFileSync(`${__dirname}/files/jobs.json`, JSON.stringify(listOfJobs, null, 2));         // Update the "Database" so that it persists through run-time

    return response.end(`Job posting ${newKey} posted!`);                                          // Send the User a Message Informing them the Job ID
}

/**
 *
 * @param {Request}   request   The HTTP Request Received by the Server
 * @param {Response}  response  The HTTP Response Sent Back to the User
 * @description  Returns an Individual Job Listing
 * 
 */
function findJobListing(request, response) {
    let jobId = request.params.jobId;                                                              // Local Variable to Reduce Amount of Typing to Access request.params
    if (listOfJobs[jobId] === undefined) {                                                         // If Job Does Not Exist...
        response.status(404);                                                                      // Set a 404 HTTP Status
        return response.end("Job listing not found!");                                             // Return a Message Stating the Job Wasn't Found
    }

    return response.json(listOfJobs[jobId]);                                                       // Return the Job Listing
}

/**
 *
 * @param {Request}   request   The HTTP Request Received by the Server
 * @param {Response}  response  The HTTP Response Sent Back to the User
 * @description  Returns a List of Valid API Endpoints
 */
function homePage(request, response) {

    return response.end("Valid endpoints are /allJobPostings, /addJobListing, and "
        + "/:jobId where jobId is the id of the job you are looking up.");                         // Return a Message So User Knows the API Endpoints
}