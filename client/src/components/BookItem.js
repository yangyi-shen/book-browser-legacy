export default function BookItem(props) {
    return (
        <div className="book-item">
            <img src={props.image} alt="" />
            <h3>{props.title}</h3>
            <p>{props.price}</p>
        </div>
    )
}