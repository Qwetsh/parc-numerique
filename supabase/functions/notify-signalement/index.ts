/* ============================================================
   Edge Function « notify-signalement »
   Déclenchée par un Database Webhook (trigger AFTER INSERT sur
   public.parc_signalements). Envoie l'email d'alerte au référent
   via l'API REST EmailJS — côté SERVEUR, donc fiable quel que soit
   le navigateur/appareil de l'enseignant.

   Un signalement ne contient aucune donnée nominative : il décrit un
   équipement, un lieu et une panne. L'email ne transmet donc ni nom
   ni adresse d'enseignant.

   Secrets attendus (Project Settings → Edge Functions → Secrets) :
     EMAILJS_PRIVATE_KEY  (obligatoire — « Access Token » EmailJS)
     WEBHOOK_SECRET       (obligatoire — doit correspondre au header
                           envoyé par le trigger SQL)
   Optionnels (sinon valeurs publiques par défaut, identiques au front) :
     EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, SITE_URL
   ============================================================ */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

const SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID') ?? 'service_iu8wp79'
const TEMPLATE_ID = Deno.env.get('EMAILJS_TEMPLATE_ID') ?? 'template_zs655ab'
const PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY') ?? 'sYPO8mRAvfvPSxc3k'
const PRIVATE_KEY = Deno.env.get('EMAILJS_PRIVATE_KEY') ?? ''
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? ''
const SITE_URL = (Deno.env.get('SITE_URL') ?? 'https://qwetsh.github.io/parc-numerique/').replace(/\/+$/, '')

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const ETAGE_LABEL: Record<string, string> = {
  '0': 'Rez-de-chaussée', '1': '1ᵉʳ étage', '2': '2ᵉ étage', '3': '3ᵉ étage',
}

interface SignalementRow {
  id: string
  equipement_id: string | null
  equipement_ref: string | null
  salle: string | null
  etage: number | null
  probleme: string
  description: string | null
  created_at: string
}

async function fetchEquip(id: string | null): Promise<{ type?: string; modele?: string; reference?: string } | null> {
  if (!id || !SUPABASE_URL || !SERVICE_ROLE) return null
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/parc_equipements?id=eq.${id}&select=type,modele,reference`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    )
    if (!res.ok) return null
    const rows = await res.json()
    return Array.isArray(rows) && rows[0] ? rows[0] : null
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Le secret distingue l'appel légitime du trigger d'un appel direct depuis
  // internet (la fonction est déployée avec verify_jwt désactivé).
  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET non configuré : tous les appels sont refusés.')
    return new Response('Unauthorized', { status: 401 })
  }
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    console.error('x-webhook-secret absent ou différent du secret configuré.')
    return new Response('Unauthorized', { status: 401 })
  }
  if (!PRIVATE_KEY) {
    console.error('EMAILJS_PRIVATE_KEY manquant : impossible d’envoyer l’email.')
    return new Response('Email non configuré (clé privée manquante)', { status: 500 })
  }

  let record: SignalementRow
  try {
    const body = await req.json()
    record = (body.record ?? body) as SignalementRow
  } catch {
    return new Response('Corps invalide', { status: 400 })
  }
  if (!record?.probleme) {
    return new Response('Champ probleme manquant', { status: 400 })
  }

  const equip = await fetchEquip(record.equipement_id)
  const equipementStr = equip
    ? `${equip.type} — ${equip.modele} (${equip.reference})`
    : (record.equipement_ref ?? '—')
  const etageStr = record.etage != null ? (ETAGE_LABEL[String(record.etage)] ?? `Étage ${record.etage}`) : ''
  const salleStr = record.salle ? `Salle ${record.salle}${etageStr ? ` · ${etageStr}` : ''}` : '—'

  const template_params = {
    equipement: equipementStr,
    salle: salleStr,
    probleme: record.probleme,
    details: (record.description ?? '').trim() || '—',
    date: new Date(record.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
    lien: `${SITE_URL}/signalements`,
  }

  const emailRes = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      accessToken: PRIVATE_KEY,
      template_params,
    }),
  })

  const text = await emailRes.text()
  if (!emailRes.ok) {
    console.error('EmailJS a refusé l’envoi :', emailRes.status, text)
    return new Response(`EmailJS error: ${emailRes.status} ${text}`, { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
