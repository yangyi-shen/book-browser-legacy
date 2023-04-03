import BookItem from "./BookItem"

export default function SearchResult(props) {
    const books = props.bookList.map((book, index) => <BookItem key={index} image={book.image} title={book.title} url={book.url} price={book.price} format={book.format} author={book.author} bookstore={book.bookstore} />)
    
    return (
        <main>
            {books}
        </main>
    )
}