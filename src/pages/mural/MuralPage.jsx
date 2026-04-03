import { useState } from "react";
import { BRAND } from "../../brand";
import SenaiLogo from "../../components/SenaiLogo";
import JobCard from "../../components/JobCard";
import CategoryFilter from "../../components/CategoryFilter";
import { useJobs } from "../../hooks/useJobs";
import { useCategories } from "../../hooks/useCategories";

export default function MuralPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { jobs, loading } = useJobs(selectedCategory);
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

      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {loading ? (
        <p className="loading">Carregando vagas...</p>
      ) : jobs.length === 0 ? (
        <p className="empty">Nenhuma vaga encontrada nessa categoria.</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
