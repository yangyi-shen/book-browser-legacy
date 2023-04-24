
import { useState }from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import Searchbar from './components/Searchbar';
import SearchResult from './components/SearchResult';
import Footer from './components/Footer';

function App() {
  const [bookList, setBookList] = useState({})
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [start, setStart] = useState(true)

  //NOTE: SEARCH api now working. work on putting query inside Searchbar component into fetch() url
  async function fetchData(query) {
    setStart(false)
    setLoading(true)

    await fetch(`https://book-browser-backend.vercel.app/api?q=${query}`, {
      referrerPolicy: "unsafe-url"
    })
    .then(response => response.json())
    .then(booklist => {
      setBookList(booklist)
    })
    .catch(error => console.error(error))

    setLoading(false)
  }

  function handleChange(event) {
    setQuery(event.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault()
    fetchData(query)
  }

  if (start) {
    return (
      <div className='App'>
          <Searchbar value={query} handleChange={handleChange} handleSubmit={handleSubmit} />
          <LandingPage />
      </div>
    )
  } else if (loading) {
    return (
      <div className='App'>
          <Searchbar value={query} handleChange={handleChange} handleSubmit={handleSubmit} />
          <LoadingScreen />
          <Footer />
      </div>
    )
  } else {
    return (
      <div className='App'>
        <Searchbar value={query} handleChange={handleChange} handleSubmit={handleSubmit} />
        <main>
          <SearchResult bookList={bookList.allBooks} />
          <Footer />
        </main>
      </div>
    )
  }
}

export default App;
