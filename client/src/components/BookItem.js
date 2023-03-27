export default function BookItem(props) {
    if (props.bookstore === 'amazon') {
        return (
            <div className="book-item">
                <img className="amazon-icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/1200px-Amazon_icon.svg.png?20210720180728" alt="" />
                <img className="book-image" src={props.image} alt="" />
                <div className="book-info">
                    <h3 className="book-title">{props.title}</h3>
                    <p className="book-author blue">{props.author}</p>
                    <h4 className="book-format bold blue">{props.format}</h4>
                    <p className="book-type">{props.price}</p>
                </div>
            </div>
        )
    } else if (props.bookstore === 'bookdepo') {
        return (
            <div className="book-item">
                <img className="bookdepo-icon" src="https://upload.wikimedia.org/wikipedia/commons/8/8a/The_Book_Depository.svg" alt="" />
                <img className="book-image" src={props.image} alt="" />
                <div className="book-info">
                    <h3 className="book-title">{props.title}</h3>
                    <p className="book-author blue">{props.author}</p>
                    <h4 className="book-format bold blue">{props.format}</h4>
                    <p className="book-type">{props.price}</p>
                </div>
            </div>
        )
    }
}