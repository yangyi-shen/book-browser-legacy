const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 6900;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => {
    res.send({ username: 'gay jay' })
});

app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`)
});