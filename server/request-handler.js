const fs = require('fs');

const statusCode = 200;
const errorCode = 404;
const successCode = 201;
const preventCode = 405;
//let messages = { results: [] };
let messages = fs.readFile('./server/messages.txt', 'utf8', (err, data) => {
  let newData = JSON.parse(data);
  messages = newData;
});

const defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  '200': 'Hello!'
};

const requestHandler = (request, response) => {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  const headers = defaultCorsHeaders;

  headers['Content-Type'] = 'application/json';

  if (request.method === 'OPTIONS') {
    response.writeHead(statusCode, headers);
    response.end();
  }

  if (request.url === '/classes/messages' && request.method === 'GET') {
    fs.readFile('./server/messages.txt', 'utf8', (err, data) => {
      let newData = JSON.parse(data);
      messages = newData;
      // response.writeHead(statusCode, headers);
      // response.end(JSON.stringify(newData));
    });
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(messages));
  } else if (request.url === '/classes/messages' && request.method === 'POST') {
    request.on('data', (chunk) => {
      let data = JSON.parse(chunk);
      messages.results.push(data);
      let textMessages = JSON.stringify(messages);
      fs.writeFile('./server/messages.txt', textMessages, () => {
        console.log('Message saved!');
      });
    });
    response.writeHead(successCode, headers);
    response.end(JSON.stringify(messages));
  } else if (request.method === 'PUT') {
    response.writeHead(preventCode, headers);
    response.end();
  } else {
    response.writeHead(errorCode, headers);
    response.end();
  }
};

exports.requestHandler = requestHandler;