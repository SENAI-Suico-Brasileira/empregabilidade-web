import { useApp } from "../context/AppContext";

export default function CategoryFilter({ categories, selected, onSelect }) {
  const { t } = useApp();

  return (
    <div className="category-filter" role="group" aria-label="Filtrar por área">
      <button
        className={`filter-btn${selected === "" ? " active" : ""}`}
        onClick={() => onSelect("")}
        aria-pressed={selected === ""}
      >
        {t("mural.allCategories")}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`filter-btn${selected === cat.id ? " active" : ""}`}
          onClick={() => onSelect(cat.id)}
          aria-pressed={selected === cat.id}
        >
          {t(`category.${cat.slug}`) || cat.name}
        </button>
      ))}
    </div>
  );
}
