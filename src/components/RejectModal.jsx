import { useState } from "react";

/**
 * Modal de reprovação de vaga — usado pelo admin em Dashboard e VagasPage.
 * O motivo é obrigatório: não é possível reprovar sem preenchê-lo.
 * O motivo fica visível para a empresa após a reprovação.
 */
export default function RejectModal({ onConfirm, onCancel, saving }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function handleConfirm() {
    if (!reason.trim()) {
      setError("O motivo é obrigatório. A empresa precisa saber o que corrigir.");
      return;
    }
    if (reason.trim().length < 10) {
      setError("Descreva o motivo com pelo menos 10 caracteres.");
      return;
    }
    onConfirm(reason.trim());
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
      <div className="modal">
        <h3 className="modal-title" id="reject-modal-title">Reprovar Vaga</h3>
        <p className="modal-desc">
          Informe o motivo da reprovação. Ele será exibido para a empresa para que possa
          corrigir e reenviar a vaga.
        </p>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-group">
          <label htmlFor="reject-reason">Motivo da reprovação *</label>
          <textarea
            id="reject-reason"
            className="modal-textarea"
            rows={4}
            placeholder="Descreva o que precisa ser corrigido ou complementado..."
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            autoFocus
          />
          <span className="field-hint">{reason.trim().length} caracteres</span>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={saving}>
            {saving ? "Reprovando..." : "Reprovar Vaga"}
          </button>
        </div>
      </div>
    </div>
  );
}
