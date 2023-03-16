const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 6900;

//code to allow frontend to read api
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(express.static('dist'));

async function getBWB(query) {
    try {
        const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://news.ycombinator.com`);
        const $ = cheerio.load(response.data);
        let pageTitles = '';

        // use cheerio to extract data from response
        $('.titleline > a').each(function () {
            pageTitles += (`<h3>${$(this).text()}</h3>`);
        });

        return pageTitles;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

app.get('/', async (req, res) => {
    try {
        const data = await getBWB('amongus');
        res.send(data);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`)
});
