import { useState } from "react";
import { BRAND } from "../../brand";
import BrandLogo from "../../components/BrandLogo";
import JobCard from "../../components/JobCard";
import CategoryFilter from "../../components/CategoryFilter";
import { useJobs } from "../../hooks/useJobs";
import { useCategories } from "../../hooks/useCategories";
import { useDebounce } from "../../hooks/useDebounce";
import { useApp } from "../../context/AppContext";

export default function MuralPage() {
  const { t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const { jobs, loading } = useJobs(selectedCategory, search);
  const { categories } = useCategories();

  return (
    <div className="page">
      <div className="hero" role="banner">
        <div className="hero-content">
          <span className="hero-badge">Vagas abertas</span>
          <h1>{BRAND.portalName}</h1>
          <p>{BRAND.tagline}</p>
        </div>
        <div className="hero-logo" aria-hidden="true">
          <BrandLogo size={52} variant="white" showText={false} />
        </div>
      </div>

      <div className="mural-filters" role="search" aria-label="Filtros de vagas">
        <label htmlFor="mural-search" className="sr-only">{t("mural.search")}</label>
        <input
          id="mural-search"
          className="mural-search"
          type="search"
          placeholder={t("mural.search")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label={t("mural.search")}
        />
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {loading ? (
        <p className="loading" role="status" aria-live="polite">{t("mural.loading")}</p>
      ) : jobs.length === 0 ? (
        <p className="empty" role="status">{t("mural.empty")}</p>
      ) : (
        <div
          className="jobs-grid"
          role="feed"
          aria-label={`${jobs.length} vagas encontradas`}
          aria-busy={loading}
        >
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
