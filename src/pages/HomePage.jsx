import { useState, useEffect } from "react";
import api from "../services/api";
import { BRAND } from "../brand";
import SenaiLogo from "../components/SenaiLogo";
import JobCard from "../components/JobCard";
import CategoryFilter from "../components/CategoryFilter";

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = selectedCategory ? { categoryId: selectedCategory } : {};
    api
      .get("/jobs", { params })
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="page">
      {/* Banner institucional */}
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

      {/* Filtro por categoria */}
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Lista de vagas */}
      {loading ? (
        <p className="loading">Carregando vagas...</p>
      ) : jobs.length === 0 ? (
        <p className="empty">Nenhuma vaga encontrada nessa categoria.</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
