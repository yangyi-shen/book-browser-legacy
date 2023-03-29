export default function Searchbar(props) {
    return (
        <header>
            <input type='text' value={props.value} onChange={props.handleChange} />
            <button type='button' onClick={props.handleSubmit}>Search</button>
        </header>
    )
}