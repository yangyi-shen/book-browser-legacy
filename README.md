# Book Browser 📚

A website that helps you search all the major online bookstores at once for the best deals.

## How to run on your computer:

- Run ```git clone https://github.com/Yang-Yi-Shen/book-browser```
- Run ```npm run devstart```
- Cd to the 'client' folder and run ```npm start```

## Todo:

- [ ] Figure out how to web scrape all major online bookstores
- - [ ] BetterWorldBooks
- - [x] AbeBooks
- - [x] Amazon Books
- - [x] ThriftBooks
- - [x] Book Depository

- [x] Process web scraped data into list of books

- [x] Make API to process multiple different queries, not just a set one

- [x] Sort books by price
- - [x] Create function to sort by price
- - [x] Make sure all prices are in USD

- [ ] Bypass CAPTCHAs

- [ ] Include shipping costs to book price

- [x] Add logo of corrensponding bookstore to search results

- [x] Make Searchbar, SearchResults, BookItem React components and appropriately use them to display data from backend

- [x] 403 and 503 status from bookstores now no longer cause app to crash

- [x] Make UI presentable

- [ ] Add loading icon when search query is being processed

- [ ] Test and release version 0.9.1