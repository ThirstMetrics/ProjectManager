"use client";

import { useState, useMemo } from "react";
import { ActivationDocument, ActivationStakeholder } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { documentSignConfig, canViewDocument } from "@/lib/utils";
import { ESignModal } from "./ESignModal";
import { FileText, Shield, Eye, PenTool } from "lucide-react";

const docTypeIcons: Record<string, string> = {
  nda: "NDA", contract: "CTR", permit: "PRM", license: "LIC", insurance: "INS", other: "DOC",
};

const docTypeColors: Record<string, string> = {
  nda: "#8b5cf6", contract: "#0ea5e9", permit: "#f59e0b", license: "#22c55e", insurance: "#ec4899", other: "#94a3b8",
};

export function DocumentList({ activationId, documents, stakeholders }: { activationId: string; documents: ActivationDocument[]; stakeholders: ActivationStakeholder[] }) {
  const [viewAs, setViewAs] = useState<string | null>(null); // null = admin
  const [viewDocId, setViewDocId] = useState<string | null>(null);
  const [signDocId, setSignDocId] = useState<string | null>(null);

  const isAdmin = viewAs === null;
  const filteredDocs = useMemo(
    () => documents.filter((d) => canViewDocument(d, viewAs, isAdmin)),
    [documents, viewAs, isAdmin]
  );

  const viewDoc = documents.find((d) => d.id === viewDocId);
  const signDoc = documents.find((d) => d.id === signDocId);
  const signSigner = signDoc?.scopedToStakeholderId ? stakeholders.find((s) => s.id === signDoc.scopedToStakeholderId) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Documents & NDAs</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{filteredDocs.length} documents visible</p>
        </div>
        {/* View As selector */}
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-[var(--color-text-muted)]" />
          <select
            className="text-xs px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={viewAs ?? "admin"}
            onChange={(e) => setViewAs(e.target.value === "admin" ? null : e.target.value)}
          >
            <option value="admin">Viewing as: Admin (all documents)</option>
            {stakeholders.map((s) => (
              <option key={s.id} value={s.id}>Viewing as: {s.name} ({s.company})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Privacy notice */}
      {viewAs && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-center gap-2">
          <Eye size={14} />
          Showing only documents visible to {stakeholders.find((s) => s.id === viewAs)?.name ?? "this stakeholder"}. Switch to Admin to see all.
        </div>
      )}

      {/* Document list */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>No documents visible{viewAs ? " for this stakeholder" : ""}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const signConf = documentSignConfig[doc.signStatus];
            const typeColor = docTypeColors[doc.type] ?? "#94a3b8";
            const scopedStakeholder = doc.scopedToStakeholderId ? stakeholders.find((s) => s.id === doc.scopedToStakeholderId) : null;
            return (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors">
                {/* Type badge */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: typeColor }}>
                  {docTypeIcons[doc.type]}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">{doc.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {scopedStakeholder ? `Scoped to: ${scopedStakeholder.name}` : "Admin only"}
                    {doc.signerName && doc.signStatus === "signed" && ` — Signed by ${doc.signerName}`}
                  </p>
                </div>
                {/* Status */}
                <Badge style={{ backgroundColor: signConf.bg, color: signConf.color }} size="sm">{signConf.label}</Badge>
                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewDocId(doc.id)}
                    className="p-1.5 rounded-md hover:bg-[var(--color-background)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer transition-colors"
                    title="View document"
                  >
                    <Eye size={15} />
                  </button>
                  {doc.signStatus === "pending_signature" && isAdmin && scopedStakeholder && (
                    <button
                      onClick={() => setSignDocId(doc.id)}
                      className="p-1.5 rounded-md hover:bg-[var(--color-background)] text-[var(--color-primary)] cursor-pointer transition-colors"
                      title="Sign document"
                    >
                      <PenTool size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Document Modal */}
      {viewDoc && (
        <Modal open={true} title={viewDoc.title} onClose={() => setViewDocId(null)} wide>
          <div className="space-y-4">
            <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
              <span>Type: <strong className="text-[var(--color-text-primary)]">{viewDoc.type.toUpperCase()}</strong></span>
              <span>Status: <Badge style={{ backgroundColor: documentSignConfig[viewDoc.signStatus].bg, color: documentSignConfig[viewDoc.signStatus].color }} size="sm">{documentSignConfig[viewDoc.signStatus].label}</Badge></span>
              {viewDoc.signerName && <span>Signed by: <strong className="text-[var(--color-text-primary)]">{viewDoc.signerName}</strong></span>}
            </div>
            <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-5 max-h-96 overflow-y-auto">
              <div className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">{viewDoc.content}</div>
            </div>
            {viewDoc.signatureData && (
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Signature</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={viewDoc.signatureData} alt="Signature" className="h-16 border border-[var(--color-border)] rounded bg-white" />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* E-Sign Modal */}
      {signDoc && signSigner && (
        <ESignModal document={signDoc} signer={signSigner} onClose={() => setSignDocId(null)} />
      )}
    </div>
  );
}
