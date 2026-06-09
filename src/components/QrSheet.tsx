/* ============================================================
   Planche A4 imprimable d'étiquettes QR (une par équipement).
   Chaque QR encode l'URL publique /signaler/<id> → la page de
   signalement de panne de cet appareil.
   Rendu via portail sur <body> pour pouvoir masquer l'app à l'impression.
   ============================================================ */
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ETAGE_COURT } from '../data/parc'
import type { Equipement } from '../data/parc'
import { pageUrl, usesLocalUrl } from '../lib/site'
import './QrSheet.css'

/** URL publique de signalement pour un équipement (toujours vers le site déployé). */
export function signalerUrl(id: string): string {
  return pageUrl(`signaler/${id}`)
}

export function QrSheet({ equipements, onClose }: { equipements: Equipement[]; onClose: () => void }) {
  const local = usesLocalUrl

  return createPortal(
    <div className="qr-print-root">
      <div className="qr-toolbar">
        <div className="qr-toolbar-info">
          <strong>{equipements.length}</strong> étiquette{equipements.length > 1 ? 's' : ''} QR
          {local && (
            <span className="qr-warn"> · ⚠ Généré en local : les QR pointent vers localhost. Génère depuis le site déployé pour un usage réel.</span>
          )}
        </div>
        <div className="qr-toolbar-actions">
          <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Imprimer</button>
        </div>
      </div>

      <div className="qr-sheet">
        {equipements.map((e) => {
          const showNum = e.salleNom !== `Salle ${e.salle}`
          return (
            <div className="qr-label" key={e.id}>
              <QRCodeSVG value={signalerUrl(e.id)} size={96} level="M" />
              <div className="qr-label-info">
                <div className="qr-label-ref">{e.reference}</div>
                {e.num_inventaire && (
                  <div className="qr-label-inv">Inv. {e.num_inventaire}</div>
                )}
                <div className="qr-label-salle">
                  {showNum ? `${e.salleNom} · ${e.salle}` : e.salleNom} · {ETAGE_COURT[e.etage]}
                </div>
                <div className="qr-label-cta">📲 Scannez pour signaler une panne</div>
                <div className="qr-label-foot">Collège Pierre Mendès France</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>,
    document.body,
  )
}
