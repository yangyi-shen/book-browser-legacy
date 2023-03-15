
import { useState, useEffect }from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState(null)

  useEffect(() => {
    fetch('http://localhost:6900/api/getUsername/')
      .then(res => res.json())
      .then(user => setUsername(user.username))
      .catch(error => console.error(error))
  }, [])

  return (
    <div className="App">
      {username ? <h1>{username}</h1> : <h1>test unsuccesful</h1>}
    </div>
  );
}

export default App;
