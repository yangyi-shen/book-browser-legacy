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
        const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://www.thriftbooks.com/browse/?b.search=${escapedQuery}#b.s=mostPopular-desc&b.p=1&b.pp=30&b.oos&b.tile`);
        const $ = cheerio.load(response.data);
        let pageTitles = [];

        // use cheerio to extract data from response
        $(path).each(function (index) {
            if (index >= 5) {
                return false;
            }
            pageTitles.push($(this).text());
        });

        return pageTitles;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//function for scraping Book Depository
async function getBookDepo(query, path = '.title > a') {
    try {
        const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://www.bookdepository.com/search?searchTerm=${escapedQuery}&search=Find+book`);
        const $ = cheerio.load(response.data);
        let pageTitles = [];

        // use cheerio to extract data from response
        $(path).each(function (index) {
            if (index >= 5) {
                return false;
            }
            pageTitles.push($(this).text());
        });
        
        return pageTitles;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//function for scraping Amazon Books
async function getAmazonBooks(query, path = 'h2 a span') {
    try {
        const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://www.amazon.com/s?k=${escapedQuery}&i=stripbooks-intl-ship&crid=7UFCKN157B57&sprefix=tr%2Cstripbooks-intl-ship%2C275&ref=nb_sb_noss_2`);
        const $ = cheerio.load(response.data);
        let pageTitles = [];

        // use cheerio to extract data from response
        $(path).each(function (index) {
            if (index >= 5) {
                return false;
            }
            pageTitles.push($(this).text());
        });

        return pageTitles;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//api to send info to frontend
app.get('/api', async (req, res) => {
    try {
        const bookDepo = await getBookDepo('trump');
        const amazonBooks = await getAmazonBooks('trump');

        res.json({
            bookDepo: bookDepo,
            amazonBooks: amazonBooks,
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ error: error.message });
    }
})

//route for homepage
app.get('/', async (req, res) => {
    try {
        const bookDepo = await getBookDepo('trump');
        const bookDepoList = bookDepo.map(book => `<p>${book}</p>`).join('');
        const amazonBooks = await getAmazonBooks('trump');
        const amazonBooksList = amazonBooks.map(book => `<p>${book}</p>`).join('');
        // thriftbooks goddamned added a captcha so this doesn't work no more
        // const thriftbooks = await getThriftBooks('trump');
        // const thriftbooksList = thriftbooks.map(book => `<p>${book}</p>`).join('');

        res.send(`
            <h2>Book Depository:</h2> 
            ${bookDepoList}
            <h2>Amazon Books:</h2>
            ${amazonBooksList}
        `);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`)
});
