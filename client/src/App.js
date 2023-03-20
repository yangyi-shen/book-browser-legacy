
import { useState, useEffect }from 'react';
import './App.css';

function App() {
  const [bookList, setBookList] = useState({})

  useEffect(() => {
    async function fetchData() {
      await fetch('http://localhost:6900/api')
      .then(response => response.json())
      .then(booklist => {
        setBookList(booklist)
        console.log(booklist.amazonBooks, booklist.bookDepo)
      })
      .catch(error => console.error(error))
    }

    fetchData();
  }, [])

  if (bookList.amazonBooks) {
    return (
      <div className='App'>
        <h2>Amazon Books:</h2>
        {bookList.amazonBooks.map(book => <p>{book}</p>)}
        <h2>Book Depository:</h2>
        {bookList.bookDepo.map(book => <p>{book}</p>)}
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
