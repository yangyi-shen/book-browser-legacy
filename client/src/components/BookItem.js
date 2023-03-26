export default function BookItem(props) {

    return (
        <div className="book-item">
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