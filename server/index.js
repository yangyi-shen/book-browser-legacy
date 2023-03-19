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

//function for scraping Thriftbooks
async function getThriftBooks(query, path = '.AllEditionsItem-tileTitle > a') {
    try {
        // const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://www.thriftbooks.com/browse/?b.search=${query}#b.s=mostPopular-desc&b.p=1&b.pp=30&b.oos&b.tile`);
        const $ = cheerio.load(response.data);
        let pageTitles = '';

        // use cheerio to extract data from response
        $(path).each(function (index) {
            if (index >= 5) {
                return false;
            }
            pageTitles += (`<p>${$(this).text()}</p>`);
        });

        return pageTitles;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

app.get('/', async (req, res) => {
    try {
        const thriftbooks = await getThriftBooks('trump');
        res.send(`
            <h2>ThriftBooks:</h2> 
            ${thriftbooks}
        `);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`)
});
