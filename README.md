To run this project on local machine.
1) Clone the project.
2) Go to project directory and run this command 'cp .env.example .env'.
3) Then open .env fill out the keys
REDIS_HOST='Your Redis Host'
REDIS_PORT='Redis Port (usually 6379)'
WINDOW='Time window for rate limiter'
MAX_REQUESTS='Max number of request for an ip to be allowed to pass in the time window'
4) Now run 'npm install'
5) Then run 'node app.js'.
6) Now test using postman. (Send get requests to http://localhost:3000/ok) 
