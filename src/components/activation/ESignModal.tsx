"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ActivationDocument, ActivationStakeholder } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SignatureCanvas } from "./SignatureCanvas";
import { CheckCircle } from "lucide-react";

export function ESignModal({ document, signer, onClose }: { document: ActivationDocument; signer: ActivationStakeholder; onClose: () => void }) {
  const { signDocument } = useAppStore();
  const [consent, setConsent] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);

  const handleSign = () => {
    if (!consent || !signatureData) return;
    signDocument(document.id, signatureData, signer.name, signer.email);
    setSigned(true);
  };

  if (signed) {
    return (
      <Modal open={true} title="Document Signed" onClose={onClose} wide>
        <div className="text-center py-8">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Successfully Signed</h3>
          <p className="text-sm text-[var(--color-text-muted)]">{document.title} has been signed by {signer.name}.</p>
          <Button variant="primary" className="mt-6" onClick={onClose}>Done</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={true} title="Sign Document" onClose={onClose} wide>
      <div className="space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Document Content */}
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Document</h4>
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-4 max-h-60 overflow-y-auto">
            <h3 className="font-bold text-[var(--color-text-primary)] mb-3">{document.title}</h3>
            <div className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">{document.content}</div>
          </div>
        </div>

        {/* Signer Identity */}
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Signer</h4>
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-3 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div><span className="text-[var(--color-text-muted)]">Name:</span> <span className="font-medium text-[var(--color-text-primary)]">{signer.name}</span></div>
              <div><span className="text-[var(--color-text-muted)]">Email:</span> <span className="font-medium text-[var(--color-text-primary)]">{signer.email}</span></div>
              <div><span className="text-[var(--color-text-muted)]">Company:</span> <span className="font-medium text-[var(--color-text-primary)]">{signer.company}</span></div>
            </div>
          </div>
        </div>

        {/* Consent Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <span className="text-sm text-[var(--color-text-primary)]">
            I agree to the terms of this document and confirm that my electronic signature below constitutes a legally binding signature.
          </span>
        </label>

        {/* Signature Canvas */}
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Signature</h4>
          <SignatureCanvas
            onSignature={(data) => setSignatureData(data)}
            onClear={() => setSignatureData(null)}
          />
        </div>

        {/* Sign Button */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSign} disabled={!consent || !signatureData}>
            Sign Document
          </Button>
        </div>
      </div>
    </Modal>
  );
}
