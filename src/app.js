const express = require('express');
const cors = require('cors');

const app = express();

app.set('port', process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('../src/routes/auth.routes'));
app.use('/api/users', require('../src/routes/users.routes'));
app.use('/api/messages', require('../src/routes/messages.routes'));

module.exports = app;