import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AreaHeader from "../../components/AreaHeader";
import { useCategories } from "../../hooks/useCategories";
import { useApp } from "../../context/AppContext";
import { companyService } from "../../services/companyService";

const CONTRACT_TYPE_OPTIONS = [
  { value: "CLT", label: "CLT — Carteira assinada" },
  { value: "APPRENTICE", label: "Jovem Aprendiz" },
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "PJ", label: "Pessoa Jurídica (PJ)" },
  { value: "OTHER", label: "Outro / Não informado" },
];

const INITIAL_FORM = {
  companyConfidential: false,
  categoryId: "",
  title: "",
  contractType: "CLT",
  workLocation: "",
  workSchedule: "",
  responsibilities: "",
  requiredQualifications: "",
  desiredQualifications: "",
  benefits: "",
  salaryType: "NEGOTIABLE",
  salaryMin: "",
  salaryMax: "",
  applicationDeadline: "",
  applicationLink: "",
  lgpdConsent: false,
  senaiDisclaimer: false,
};

export default function EmpresaCreateJobPage() {
  const navigate = useNavigate();
  const { t } = useApp();
  const { categories } = useCategories();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Carrega vagas preenchidas da empresa para usar como template
  useEffect(() => {
    companyService.listCompletedTemplates().then(setTemplates).catch(() => {});
  }, []);

  function applyTemplate(template) {
    setForm((prev) => ({
      ...prev,
      categoryId: template.category?.id?.toString() ?? prev.categoryId,
      title: template.title,
      contractType: template.contractType ?? "CLT",
      workLocation: template.workLocation ?? "",
      workSchedule: template.workSchedule ?? "",
      responsibilities: template.responsibilities ?? "",
      requiredQualifications: template.requiredQualifications ?? "",
      desiredQualifications: template.desiredQualifications ?? "",
      benefits: template.benefits ?? "",
      salaryType: template.salaryType ?? "NEGOTIABLE",
      salaryMin: template.salaryMin ?? "",
      salaryMax: template.salaryMax ?? "",
      // Não copia prazo, link e consentimentos — são específicos de cada abertura
    }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.lgpdConsent || !form.senaiDisclaimer) {
      setError("Você precisa aceitar ambos os termos antes de cadastrar a vaga.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await companyService.createJob(form);
      navigate("/empresas");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar vaga.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AreaHeader areaName="Nova Vaga" homeHref="/empresas" />
      <main className="area-main">
        <div className="page">
          <div className="info-banner">
            Após o cadastro, a vaga ficará <strong>aguardando aprovação</strong> da equipe SENAI antes de aparecer no mural.
          </div>

          {/* ── Templates de vagas preenchidas ── */}
          {templates.length > 0 && (
            <div className="templates-section">
              <p className="templates-title">Usar como base uma vaga já preenchida:</p>
              <div className="templates-list">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="template-btn"
                    onClick={() => applyTemplate(t)}
                  >
                    <span className="template-name">{t.title}</span>
                    <span className="template-category">{t.category?.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="job-form" onSubmit={handleSubmit}>
            {error && <p className="form-error">{error}</p>}

            {/* ── Visibilidade ── */}
            <fieldset className="form-section">
              <legend>Visibilidade no Mural</legend>
              <label className="checkbox-label">
                <input type="checkbox" name="companyConfidential" checked={form.companyConfidential} onChange={handleChange} />
                Manter nome da empresa confidencial para os candidatos
              </label>
              <span className="field-hint">O nome da empresa ficará visível apenas para a equipe SENAI.</span>
            </fieldset>

            {/* ── Dados da Vaga ── */}
            <fieldset className="form-section">
              <legend>Dados da Vaga</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Área de Atuação *</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.slug ? t(`category.${cat.slug}`) : cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Contrato *</label>
                  <select name="contractType" value={form.contractType} onChange={handleChange} required>
                    {CONTRACT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Cargo / Título *</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex: Desenvolvedor Web" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Local de Trabalho</label>
                  <input name="workLocation" value={form.workLocation} onChange={handleChange} placeholder="Cidade, estado ou Remoto" />
                </div>
                <div className="form-group">
                  <label>Horário de Trabalho</label>
                  <input name="workSchedule" value={form.workSchedule} onChange={handleChange} placeholder="Ex: Seg–Sex, 08h–17h" />
                </div>
              </div>
              <div className="form-group">
                <label>Responsabilidades e Atribuições</label>
                <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={4} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Requisitos Obrigatórios</label>
                  <textarea name="requiredQualifications" value={form.requiredQualifications} onChange={handleChange} rows={4} />
                </div>
                <div className="form-group">
                  <label>Requisitos Desejáveis</label>
                  <textarea name="desiredQualifications" value={form.desiredQualifications} onChange={handleChange} rows={4} />
                </div>
              </div>
              <div className="form-group">
                <label>Benefícios</label>
                <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={3} placeholder="Ex: VT, VR, Plano de saúde..." />
              </div>
            </fieldset>

            {/* ── Salário ── */}
            <fieldset className="form-section">
              <legend>Salário</legend>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="salaryType" value="FIXED" checked={form.salaryType === "FIXED"} onChange={handleChange} />
                  Salário fixo
                </label>
                <label className="radio-label">
                  <input type="radio" name="salaryType" value="RANGE" checked={form.salaryType === "RANGE"} onChange={handleChange} />
                  Faixa salarial
                </label>
                <label className="radio-label">
                  <input type="radio" name="salaryType" value="NEGOTIABLE" checked={form.salaryType === "NEGOTIABLE"} onChange={handleChange} />
                  À combinar
                </label>
              </div>
              {form.salaryType !== "NEGOTIABLE" && (
                <div className="form-row">
                  <div className="form-group">
                    <label>{form.salaryType === "RANGE" ? "Mínimo" : "Salário"}</label>
                    <input name="salaryMin" value={form.salaryMin} onChange={handleChange} placeholder="Ex: R$ 2.000,00" />
                  </div>
                  {form.salaryType === "RANGE" && (
                    <div className="form-group">
                      <label>Máximo</label>
                      <input name="salaryMax" value={form.salaryMax} onChange={handleChange} placeholder="Ex: R$ 3.500,00" />
                    </div>
                  )}
                </div>
              )}
            </fieldset>

            {/* ── Inscrições ── */}
            <fieldset className="form-section">
              <legend>Inscrições</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Data Limite</label>
                  <input type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Link ou e-mail para envio do currículo</label>
                  <input name="applicationLink" value={form.applicationLink} onChange={handleChange} placeholder="https://... ou email@empresa.com.br" />
                </div>
              </div>
            </fieldset>

            {/* ── Termos LGPD ── */}
            <fieldset className="form-section form-section-consent">
              <legend>Termos e Consentimento</legend>
              <label className="checkbox-label checkbox-label-block">
                <input type="checkbox" name="lgpdConsent" checked={form.lgpdConsent} onChange={handleChange} required />
                <span>
                  Aceito compartilhar com o SENAI e alunos as informações acima de acordo com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), autorizando o uso dos dados fornecidos exclusivamente para fins de divulgação de vagas de emprego.
                </span>
              </label>
              <label className="checkbox-label checkbox-label-block">
                <input type="checkbox" name="senaiDisclaimer" checked={form.senaiDisclaimer} onChange={handleChange} required />
                <span>
                  A iniciativa do SENAI na elaboração deste cadastro é intermediar o processo de inclusão de profissionais no mercado de trabalho. As informações contidas são de responsabilidade exclusiva das empresas, que declaram aceitar sua divulgação por via dos diversos meios de comunicação.
                </span>
              </label>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate("/empresas")}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Enviando..." : "Enviar para aprovação"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
