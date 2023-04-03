export default function Searchbar(props) {
    return (
        <header>
            <h1 id="page-title">Book Browser</h1>
            <h3 id="page-subtitle">Many bookstores, one searchbar</h3>
            <div id="searchbar">
                <input id="search-input" type='text' value={props.value} onChange={props.handleChange} placeholder="Find a book.." onkeypress="if(event.keyCode == 13) this.form.submit()" />
                <button id="search-btn" type='button' onClick={props.handleSubmit}>🔍</button>
            </div>
        </header>
    )
}