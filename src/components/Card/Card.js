import './Card.css';

function Card({ children, className = '', title, action }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || action) && (
        <div className="card__header">
          {title && <h2 className="card__title">{title}</h2>}
          {action && <div className="card__action">{action}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}

export default Card;
