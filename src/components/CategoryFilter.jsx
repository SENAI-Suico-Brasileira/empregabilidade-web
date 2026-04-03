export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="category-filter">
      <button
        className={`filter-btn ${selected === "" ? "active" : ""}`}
        onClick={() => onSelect("")}
      >
        Todas
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`filter-btn ${selected === cat.id ? "active" : ""}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
