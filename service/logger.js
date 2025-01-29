const morgan = require("morgan");

// Custom tokens for logging
morgan.token('query', (req) => JSON.stringify(req.query));
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('headers', (req) => JSON.stringify(req.headers));

// Create a morgan format string for logging
const logFormat = ':method :url :status :response-time ms - Query: :query - Body: :body - Headers: :headers file :remote-addr - :remote-user [:date[clf]]';
// const logFormat = ':method';

module.exports = morgan(logFormat);
