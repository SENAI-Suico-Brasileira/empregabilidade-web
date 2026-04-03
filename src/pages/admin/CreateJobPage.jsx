import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const INITIAL_FORM = {
  // Empresa
  companyName: "",
  companyConfidential: false,
  companyDescription: "",
  companyCnpj: "",
  companyContact: "",
  // Vaga
  categoryId: "",
  title: "",
  workLocation: "",
  workSchedule: "",
  responsibilities: "",
  requiredQualifications: "",
  desiredQualifications: "",
  benefits: "",
  // Salário
  salaryType: "NEGOTIABLE",
  salaryMin: "",
  salaryMax: "",
  // Inscrição
  applicationDeadline: "",
  applicationLink: "",
  // Status e consentimentos
  status: "ACTIVE",
  lgpdConsent: false,
  senaiDisclaimer: false,
};

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.lgpdConsent || !form.senaiDisclaimer) {
      setError("Você precisa aceitar ambos os termos antes de cadastrar a vaga.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/jobs", form);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar vaga.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Cadastrar Nova Vaga</h1>
      <form className="job-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        {/* ── SEÇÃO 1: DADOS DA EMPRESA ── */}
        <fieldset className="form-section">
          <legend>Dados da Empresa</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Nome da Empresa *</label>
              <input name="companyName" value={form.companyName} onChange={handleChange} required />
            </div>
            <div className="form-group form-group-center">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="companyConfidential"
                  checked={form.companyConfidential}
                  onChange={handleChange}
                />
                Manter nome confidencial para os candidatos
              </label>
              <span className="field-hint">O nome ficará visível apenas para a equipe SENAI.</span>
            </div>
          </div>

          <div className="form-group">
            <label>Sobre a Empresa</label>
            <textarea name="companyDescription" value={form.companyDescription} onChange={handleChange} rows={3} placeholder="Breve descrição da empresa..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                CNPJ da Empresa <span className="badge-private">Privado</span>
              </label>
              <input name="companyCnpj" value={form.companyCnpj} onChange={handleChange} placeholder="00.000.000/0001-00" />
              <span className="field-hint">Visível apenas para a equipe SENAI.</span>
            </div>
            <div className="form-group">
              <label>
                Contato da Empresa <span className="badge-private">Privado</span>
              </label>
              <input name="companyContact" value={form.companyContact} onChange={handleChange} placeholder="Nome e telefone do responsável" />
              <span className="field-hint">Visível apenas para a equipe SENAI.</span>
            </div>
          </div>
        </fieldset>

        {/* ── SEÇÃO 2: DADOS DA VAGA ── */}
        <fieldset className="form-section">
          <legend>Dados da Vaga</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Área de Atuação (Categoria) *</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cargo / Título da Vaga *</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex: Desenvolvedor Web" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Local de Trabalho</label>
              <input name="workLocation" value={form.workLocation} onChange={handleChange} placeholder="Cidade, estado, CEP ou Remoto" />
            </div>
            <div className="form-group">
              <label>Horário de Trabalho</label>
              <input name="workSchedule" value={form.workSchedule} onChange={handleChange} placeholder="Ex: Seg–Sex, 08h–17h" />
            </div>
          </div>

          <div className="form-group">
            <label>Responsabilidades e Atribuições</label>
            <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={4} placeholder="Descreva as principais responsabilidades..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Requisitos e/ou Qualificações Obrigatórios</label>
              <textarea name="requiredQualifications" value={form.requiredQualifications} onChange={handleChange} rows={4} placeholder="Ex: Ensino médio completo, CNH B..." />
            </div>
            <div className="form-group">
              <label>Requisitos e/ou Qualificações Desejáveis</label>
              <textarea name="desiredQualifications" value={form.desiredQualifications} onChange={handleChange} rows={4} placeholder="Ex: Experiência com Excel, inglês básico..." />
            </div>
          </div>

          <div className="form-group">
            <label>Benefícios</label>
            <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={3} placeholder="Ex: VT, VR, Plano de saúde..." />
          </div>
        </fieldset>

        {/* ── SEÇÃO 3: SALÁRIO ── */}
        <fieldset className="form-section">
          <legend>Salário</legend>

          <div className="form-group">
            <label>Tipo de Salário</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="salaryType" value="FIXED" checked={form.salaryType === "FIXED"} onChange={handleChange} />
                Salário fixo
              </label>
              <label className="radio-label">
                <input type="radio" name="salaryType" value="RANGE" checked={form.salaryType === "RANGE"} onChange={handleChange} />
                Faixa salarial (de X a Y)
              </label>
              <label className="radio-label">
                <input type="radio" name="salaryType" value="NEGOTIABLE" checked={form.salaryType === "NEGOTIABLE"} onChange={handleChange} />
                À combinar
              </label>
            </div>
          </div>

          {form.salaryType !== "NEGOTIABLE" && (
            <div className="form-row">
              <div className="form-group">
                <label>{form.salaryType === "RANGE" ? "Salário mínimo" : "Salário"}</label>
                <input name="salaryMin" value={form.salaryMin} onChange={handleChange} placeholder="Ex: R$ 2.000,00" />
              </div>
              {form.salaryType === "RANGE" && (
                <div className="form-group">
                  <label>Salário máximo</label>
                  <input name="salaryMax" value={form.salaryMax} onChange={handleChange} placeholder="Ex: R$ 3.500,00" />
                </div>
              )}
            </div>
          )}
        </fieldset>

        {/* ── SEÇÃO 4: INSCRIÇÃO ── */}
        <fieldset className="form-section">
          <legend>Inscrições</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Data Limite de Inscrição</label>
              <input type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Link e/ou E-mail para Envio do Currículo</label>
              <input name="applicationLink" value={form.applicationLink} onChange={handleChange} placeholder="https://... ou email@empresa.com.br" />
            </div>
          </div>

          <div className="form-group">
            <label>Status da Vaga</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="ACTIVE">Ativa</option>
              <option value="INACTIVE">Inativa</option>
            </select>
          </div>
        </fieldset>

        {/* ── SEÇÃO 5: TERMOS DE CONSENTIMENTO (LGPD) ── */}
        <fieldset className="form-section form-section-consent">
          <legend>Termos e Consentimento</legend>

          <div className="form-group">
            <label className="checkbox-label checkbox-label-block">
              <input
                type="checkbox"
                name="lgpdConsent"
                checked={form.lgpdConsent}
                onChange={handleChange}
                required
              />
              <span>
                Aceito compartilhar com o SENAI e alunos as informações acima de acordo com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), autorizando o uso dos dados fornecidos exclusivamente para fins de divulgação de vagas de emprego.
              </span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label checkbox-label-block">
              <input
                type="checkbox"
                name="senaiDisclaimer"
                checked={form.senaiDisclaimer}
                onChange={handleChange}
                required
              />
              <span>
                A iniciativa do SENAI na elaboração deste cadastro é intermediar o processo de inclusão de profissionais no mercado de trabalho e propiciar novas oportunidades. Porém, esclarecemos que as informações contidas nesta relação são de responsabilidade exclusiva das empresas, que divulgam suas vagas e declaram aceitar sua divulgação por via dos diversos meios de comunicação.
              </span>
            </label>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/admin")}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar Vaga"}
          </button>
        </div>
      </form>
    </div>
  );
}
