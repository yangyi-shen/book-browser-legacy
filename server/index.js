const express = require('express');
const https = require('https');
const fs = require('fs');
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

function truncate(text, length = 40) {
    if (text.trim().length > length) {
      result = text.trim().slice(0, length).trim() + "...";
      return result;
    }

    return text; 
}
const truncateAuthors = 30;

//IMPORTANT: potential solutions to web scraping problems: setting cookies, using proxies, copying http request from network section of inspect tools
async function getThriftBooks(query, path = '.AllEditionsItem-tile') {
    try {
        const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://www.thriftbooks.com/browse/?b.search=${escapedQuery}#b.s=mostPopular-desc&b.p=1&b.pp=30&b.oos&b.tile`,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const $ = cheerio.load(response.data);
        let pageTitles = [];

        // use cheerio to extract data from response
        $(path).each(function (index) {
            if (index >= 5) {
                return false;
            }

            const image = $(this).find('.SearchResultTileItem-photo img').attr('src');
            const title = truncate($(this).find('.AllEditionsItem-tileTitle').text());
            const url = $(this).find('.AllEditionsItem-tileTitle a').attr('href');
            const price = $(this).find('.SearchResultListItem-dollarAmount').text();
            const format = $(this).find('.SearchResultTileItem-format strong').text();
            const author = truncate($(this).find(`[itemprop = 'author']`).text(), truncateAuthors);

            pageTitles.push({
                image: image,
                title: title,
                url: url,
                price: price,
                format: format,
                author: author,
                bookstore: 'thriftbooks',
            })
        });

        return pageTitles;
    } catch (error) {
        // console.error(error);
        console.error(`status ${error.response.status} from Thriftbooks`);
        return [];
    }
}

async function getBookDepo(query, path = '.book-item') {
    try {
        const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://www.bookdepository.com/search?searchTerm=${escapedQuery}&search=Find+book`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'cookie': 'bd-session-id=262-8800074-2984305; bd-session-id-time=2082787201l; ENTITY_SESS_ID_UK=de913f594e84ab6be3f4f2ff624cd30c; isAuthenticated=no; hasNoSavedCards=no; bd-ubid-main=262-1691740-3449708; __zlcmid=1EzlgeT335WiHWb; s_gpv=home; bd-session-token=Duosm5KPOlTOb7atrUQVaeX6bDy5w8Xm4AOqvvhBf1132Vk95mLuMOxT/xlTidFm4zEE8cMXFo1YrQW8WNx1vuw+Vs6rOmmoDiSPlQV9Sf68Gq+cnHJsfql2huNvidqdkac+XswmkM4fJUiS9fkPNbq9XE3RtPZgOC71FyLAP6dpUDw/2U0hUib+IRXnOMfNzrArolaJ9/nm9ia3/As4iw; csm-hit=tb:F56QW8NFXM5SRAEHNWV5+s-F56QW8NFXM5SRAEHNWV5|1680232632477&t:1680232632477&adb:adblk_no',
            }
        });
        const $ = cheerio.load(response.data);
        let pageTitles = [];

        // use cheerio to extract data from response
        $(path).each(function (index) {
            if (index >= 5) {
                return false;
            }

            const image = $(this).find('.item-img img').attr('src');
            const title = truncate($(this).find('.title a').text().replace('\n', '').trim());
            const url = $(this).find('.title a').attr('href');
            const price = $(this).find('.price  .sale-price').text();
            const format = $(this).find('.format').text().replace('\n', '').trim();
            const author = truncate($(this).find('p.author span a span').text(), truncateAuthors);

            pageTitles.push({
                image: image,
                title: title,
                url: url,
                price: price,
                format: format,
                author: author,
                bookstore: 'bookdepo',
            });
        });
        
        return pageTitles;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function getAmazonBooks(query, path = `[data-component-type = 's-search-result']`) {
    try {
        const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://www.amazon.com/s?k=${escapedQuery}&i=stripbooks-intl-ship&crid=7UFCKN157B57&sprefix=tr%2Cstripbooks-intl-ship%2C275&ref=nb_sb_noss_2`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const $ = cheerio.load(response.data);
        let pageTitles = [];

        // use cheerio to extract data from response
        $(path).each(function (index) {
            if (index >= 5) {
                return false;
            }

            const image = $(this).find('img').attr('src');
            const title = truncate($(this).find('.a-section .a-section h2 a span').text());
            const url = $(this).find('.a-section .a-section h2 a').attr('href')
            const author = truncate($(this).find('div.a-row.a-color-secondary > div.a-row > .a-size-base').slice(0, 2).text(), truncateAuthors);

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
                    url: url,
                    price: priceHolder['Paperback'],
                    format: 'Paperback',
                    author: author,
                    bookstore: 'amazon',
                });
            }

            if (priceHolder['Hardcover']) {
                pageTitles.push({
                    image: image,
                    title: title,
                    url: url,
                    price: priceHolder['Hardcover'],
                    format: 'Hardcover',
                    author: author,
                    bookstore: 'amazon',
                });
            }
        });

        return pageTitles;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function getAbeBooks(query, path = `[data-cy = 'listing-item']`) {
    try {
        const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://www.abebooks.com/servlet/SearchResults?kn=${escapedQuery}&sts=t&cm_sp=SearchF-_-topnav-_-Results&ds=20`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const $ = cheerio.load(response.data);
        let pageTitles = [];

        // use cheerio to extract data from response
        $(path).each(function (index) {
            if (index >= 5) {
                return false;
            }

            const image = $(this).find('.srp-item-image').attr('src');
            const title = truncate($(this).find('.title').text());
            const url = $(this).find('.title a').attr('href')
            const price = `$${parseFloat($(this).find('.item-price').text().replace(/[^0-9.-]+/g,""))}`;
            const format = $(this).find(`[data-cy = 'listing-book-condition']`).text();
            const author = truncate($(this).find('p.author a strong').text(), truncateAuthors);

            pageTitles.push({
                image: image,
                title: title,
                url: url,
                price: price,
                format: format,
                author: author,
                bookstore: 'abebooks',
            });
        });
        
        return pageTitles;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function getBWB(query, path = `[itemtype = 'http://schema.org/Book']`) {
    try {
        const escapedQuery = encodeURI(query);
        const response = await axios.get(`https://www.betterworldbooks.com/search/results?q=${escapedQuery}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const $ = cheerio.load(response.data);
        let pageTitles = [];

        // use cheerio to extract data from response
        $(path).each(function (index) {
            if (index >= 5) {
                return false;
            }

            const image = $(this).find(`[itemprop = 'image']`).attr('src');
            const title = truncate($(this).find(`[itemprop = 'name'] [itemprop = 'url]`).text());
            const url = $(this).find(`[itemprop = 'name'] [itemprop = 'url]`).attr('href')
            const price = $(this).find('p strong span').text();
            const format = $(this).find(`p span[itemprop = 'bookFormat']`).text();
            const author = truncate($(this).find(`span.author a[itemprop = 'author']`).text(), truncateAuthors);

            pageTitles.push({
                image: image,
                title: title,
                url: url,
                price: price,
                format: format,
                author: author,
                bookstore: 'betterworldbooks',
            });
        });
        
        return pageTitles;
    } catch (error) {
        console.error(`status ${error.response.status} from BetterWorldBooks`);
        return [];
    }
}

function sortBooksByPrice(bookArray) {
    return bookArray.sort(function (a, b) {
      return parseFloat(a.price.replace(/[^0-9.-]+/g,"")) - parseFloat(b.price.replace(/[^0-9.-]+/g,""));
    });
}

//api to send info to frontend
app.get('/api', async (req, res) => {
    try {
        if (req.query.q != undefined) {
            const thriftBooks = await getThriftBooks(req.query.q);
            const bookDepo = await getBookDepo(req.query.q);
            const amazonBooks = await getAmazonBooks(req.query.q);
            const abeBooks = await getAbeBooks(req.query.q);
            const BWB = await getBWB(req.query.q);
            const allBooks = sortBooksByPrice(thriftBooks.concat(bookDepo).concat(amazonBooks).concat(abeBooks).concat(BWB))

            res.json({
                thriftBooks: thriftBooks,
                bookDepo: bookDepo,
                amazonBooks: amazonBooks,
                abeBooks: abeBooks,
                allBooks: allBooks,
                BWB: BWB,
            })
        } else {
            const thriftBooks = await getThriftBooks('trump');
            const bookDepo = await getBookDepo('trump');
            const amazonBooks = await getAmazonBooks('trump');
            const abeBooks = await getAbeBooks('trump');
            const BWB = await getThriftBooks('trump');
            const allBooks = sortBooksByPrice(thriftBooks.concat(bookDepo).concat(amazonBooks).concat(abeBooks).concat(BWB))

            res.json({
                thriftBooks: thriftBooks,
                bookDepo: bookDepo,
                amazonBooks: amazonBooks,
                abeBooks: abeBooks,
                allBooks: allBooks,
                BWB: BWB,
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

        const abeBooks = await getAbeBooks('trump');
        const abeBooksList = abeBooks.map(book => `<p>${book.title} <span style='color:#007185'>${book.format}</span> ${book.price} <span style='color:#007185'>${book.author}</span></p>`).join('');

        const BWB = await getBWB('trump');
        const BWBList = BWB.map(book => `<p>${book.title} <span style='color:#007185'>${book.format}</span> ${book.price} <span style='color:#007185'>${book.author}</span></p>`).join('');

        res.send(`
            <h2>Book Depository:</h2> 
            ${bookDepoList}
            <h2>Amazon Books:</h2>
            ${amazonBooksList}
            <h2>ThriftBooks:</h2>
            ${thriftbooksList}
            <h2>AbeBooks:</h2>
            ${abeBooksList}
            <h2>BetterWorldBooks:</h2>
            ${BWBList}
        `);
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`)
})