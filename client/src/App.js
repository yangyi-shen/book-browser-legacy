
import { useState, useEffect }from 'react';
import './App.css';
import BookItem from './components/BookItem';

function App() {
  const [bookList, setBookList] = useState({})
  const [query, setQuery] = useState('')

  //NOTE: SEARCH api now working. work on putting query inside Searchbar component into fetch() url
  async function fetchData(query) {
    await fetch(`http://localhost:6900/api?q=${query}`)
    .then(response => response.json())
    .then(booklist => {
      setBookList(booklist)
      console.log(booklist.amazonBooks, booklist.bookDepo)
    })
    .catch(error => console.error(error))
  }

  //get search results for trump on load
  useEffect(() => {
    fetchData('trump');
  }, [])

  function handleChange(event) {
    setQuery(event.target.value)
  }

  function handleSubmit() {
    fetchData(query)
  }

  if (bookList.bookDepo) {
    return (
      <div className='App'>
        <input type='text' value={query} onChange={handleChange} />
        <button type='button' onClick={handleSubmit}>Search</button>

        <h2>Amazon Books:</h2>
        {bookList.amazonBooks.map(book => <BookItem image={book.image} title={book.title} price={book.price} format={book.format} author={book.author} />)}
        <h2>Book Depository:</h2>
        {bookList.bookDepo.map(book => <BookItem image={book.image} title={book.title} price={book.price} format={book.format} author={book.author} />)}
      </div>
    )
  } else {
    return (
      <div className='App'>
        <h2>loading...</h2>
      </div>
    )
  }
}

export default App;
