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

//function for scraping Thriftbooks (not working cos of captchas)
async function getThriftBooks(query, path = '.AllEditionsItem-tile') {
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

            const image = $(this).find('.SearchResultTileItem-photo img').attr('src');
            const title = $(this).find('.AllEditionsItem-tileTitle').text();
            const price = $(this).find('.SearchResultListItem-dollarAmount').text();
            const format = $(this).find('.SearchResultTileItem-format strong').text();
            const author = $(this).find(`[itemprop = 'author']`).text();

            pageTitles.push({
                image: image,
                title: title,
                price: price,
                format: format,
                author: author,
            })
        });

        console.log(pageTitles)

        return pageTitles;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//function for scraping Book Depository
async function getBookDepo(query, path = '.book-item') {
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

            const image = $(this).find('.item-img img').attr('src');
            const title = $(this).find('.title a').text();
            const price = $(this).find('.price  .sale-price').text();
            const format = $(this).find('.format').text();
            const author = $(this).find('p.author span a span').text();

            pageTitles.push({
                image: image,
                title: title,
                price: price,
                format: format,
                author: author,
            });
        });
        
        return pageTitles;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//modified function to get price and img as well
async function getAmazonBooks(query, path = `[data-component-type = 's-search-result']`) {
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

            const image = $(this).find('img').attr('src');
            const title = $(this).find('h2 a span').text();
            const author = $(this).find('div.a-row.a-color-secondary > div.a-row > .a-size-base').slice(0, 2).text();

            //big chunk of code to come up with price and format
            let priceList = [];
            $(this).find('.s-underline-link-text > .a-price .a-offscreen').each(function () {
                priceList.push($(this).text())
            });
            let formatList = []
            $(this).find('.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold').each(function () {
                formatList.push($(this).text())
            });
            let priceHolder = []
            priceList.map((price, index) => {
                priceHolder[`${formatList[index]}`] = price;
            })

            if (priceHolder['Paperback']) {
                pageTitles.push({
                    image: image,
                    title: title,
                    price: priceHolder['Paperback'],
                    format: 'Paperback',
                    author: author,
                });
            }

            if (priceHolder['Hardcover']) {
                pageTitles.push({
                    image: image,
                    title: title,
                    price: priceHolder['Hardcover'],
                    format: 'Hardcover',
                    author: author,
                });
            }
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
        if (req.query.q != undefined) {
            const thriftBooks = await getThriftBooks(req.query.q);
            const bookDepo = await getBookDepo(req.query.q);
            const amazonBooks = await getAmazonBooks(req.query.q);

            res.json({
                thriftBooks: thriftBooks,
                bookDepo: bookDepo,
                amazonBooks: amazonBooks,
            })
        } else {
            const thriftBooks = await getThriftBooks('trump');
            const bookDepo = await getBookDepo('trump');
            const amazonBooks = await getAmazonBooks('trump');

            res.json({
                thriftBooks: thriftBooks,
                bookDepo: bookDepo,
                amazonBooks: amazonBooks,
            })
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ error: error.message });
    }
})

//localhost:6900 route for testing purposes. for final product go to localhost:3000
app.get('/', async (req, res) => {
    try {
        const thriftbooks = await getThriftBooks('trump');
        const thriftbooksList = thriftbooks.map(book => `<p>${book.title} <span style='color:#007185'>${book.format}</span> ${book.price} <span style='color:#007185'>${book.author}</span></p>`).join('');
        const bookDepo = await getBookDepo('trump');
        const bookDepoList = bookDepo.map(book => `<p>${book.title} <span style='color:#007185'>${book.format}</span> ${book.price} by <span style='color:#007185'>${book.author}</span></p>`).join('');
        const amazonBooks = await getAmazonBooks('trump');
        const amazonBooksList = amazonBooks.map(book => `<p>${book.title} <span style='color:#007185'>${book.format}</span> ${book.price} <span style='color:#007185'>${book.author}</span></p>`).join('');

        res.send(`
            <h2>Book Depository:</h2> 
            ${bookDepoList}
            <h2>Amazon Books:</h2>
            ${amazonBooksList}
            <h2>ThriftBooks:</h2>
            ${thriftbooksList}
        `);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`)
});
