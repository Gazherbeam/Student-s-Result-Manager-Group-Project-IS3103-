const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const port = Number(process.env.PORT) || 3000;
const dataDirectory = path.join(__dirname, 'data');
const dataFile = path.join(dataDirectory, 'students.json');
const publicFile = path.join(__dirname, 'index.html');

function defaultStudents() {
  return [
    { id: randomUUID(), name: 'Amina Yusuf', studentId: 'STU-001', marks: { mathematics: 94, english: 91, science: 92, history: 91 }, bonus: 0 },
    { id: randomUUID(), name: 'Brian Otieno', studentId: 'STU-002', marks: { mathematics: 82, english: 80, science: 81, history: 81 }, bonus: 0 },
    { id: randomUUID(), name: 'Chloe Njeri', studentId: 'STU-003', marks: { mathematics: 72, english: 70, science: 73, history: 71 }, bonus: 0 },
    { id: randomUUID(), name: 'Daniel Mwangi', studentId: 'STU-004', marks: { mathematics: 56, english: 54, science: 57, history: 57 }, bonus: 0 }
  ];
}

function readStudents() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    const students = defaultStudents();
    writeStudents(students);
    return students;
  }

  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (error) {
    return [];
  }
}

function writeStudents(students) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(students, null, 2));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(payload));
}

function sendFile(response) {
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(publicFile).pipe(response);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Request body must be valid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const pathname = requestUrl.pathname;

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    response.end();
    return;
  }

  if (pathname === '/api/students' && request.method === 'GET') {
    sendJson(response, 200, readStudents());
    return;
  }

  if (pathname === '/api/students' && request.method === 'PUT') {
    try {
      const payload = await readBody(request);
      if (!Array.isArray(payload.students)) {
        sendJson(response, 400, { error: 'students must be an array.' });
        return;
      }
      writeStudents(payload.students);
      sendJson(response, 200, payload.students);
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    sendFile(response);
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
});

server.listen(port, () => {
  console.log(`Student Result Manager running at http://localhost:${port}`);
});
