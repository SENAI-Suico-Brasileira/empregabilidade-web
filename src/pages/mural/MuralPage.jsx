import { useState } from "react";
import { BRAND } from "../../brand";
import SenaiLogo from "../../components/SenaiLogo";
import JobCard from "../../components/JobCard";
import CategoryFilter from "../../components/CategoryFilter";
import { useJobs } from "../../hooks/useJobs";
import { useCategories } from "../../hooks/useCategories";
import { useDebounce } from "../../hooks/useDebounce";

export default function MuralPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Debounce de 400ms para não disparar busca a cada tecla
  const search = useDebounce(searchInput, 400);

  const { jobs, loading } = useJobs(selectedCategory, search);
  const { categories } = useCategories();

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <span className="hero-badge">{BRAND.fullName}</span>
          <h1>{BRAND.portalName}</h1>
          <p>{BRAND.tagline}</p>
        </div>
        <div className="hero-logo">
          <SenaiLogo size={52} variant="white" />
        </div>
      </div>

      <div className="mural-filters">
        <input
          className="mural-search"
          type="search"
          placeholder="Buscar por cargo, habilidade ou palavra-chave..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {loading ? (
        <p className="loading">Carregando vagas...</p>
      ) : jobs.length === 0 ? (
        <p className="empty">Nenhuma vaga encontrada para essa busca.</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
