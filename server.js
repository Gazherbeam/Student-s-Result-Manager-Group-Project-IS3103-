const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const port = Number(process.env.PORT) || 3000;
const dataDirectory = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
const dataFile = path.join(dataDirectory, 'students.json');
const publicFile = path.join(__dirname, 'index.html');

function defaultStudents() {
  return [
    { id: randomUUID(), name: 'Amina Yusuf', studentId: 'STU-001', marks: { attendance: 94, projects: 91, midtermExams: 92, finalExams: 91, quizzes: 93 }, bonus: 0 },
    { id: randomUUID(), name: 'Brian Otieno', studentId: 'STU-002', marks: { attendance: 82, projects: 80, midtermExams: 81, finalExams: 81, quizzes: 83 }, bonus: 0 },
    { id: randomUUID(), name: 'Chloe Njeri', studentId: 'STU-003', marks: { attendance: 72, projects: 70, midtermExams: 73, finalExams: 71, quizzes: 74 }, bonus: 0 },
    { id: randomUUID(), name: 'Daniel Mwangi', studentId: 'STU-004', marks: { attendance: 56, projects: 54, midtermExams: 57, finalExams: 57, quizzes: 55 }, bonus: 0 }
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
