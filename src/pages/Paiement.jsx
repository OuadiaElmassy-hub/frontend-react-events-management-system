import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  FaArrowLeft, FaLock, FaCreditCard, FaCalendar,
  FaMapMarkerAlt, FaTicketAlt, FaCheckCircle, FaMobileAlt,
  FaUser, FaEnvelope, FaPhone, FaStar
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { FaPaypal } from 'react-icons/fa'
// ─── Helpers ──────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

const formatCardNumber = (val) =>
  val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

const formatExpiry = (val) =>
  val.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')

// ─── Step indicator ───────────────────────────────────────────
const Steps = ({ current }) => {
  const steps = ['Infos', 'Paiement', 'Confirmation']
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 ${i <= current ? 'text-blue-600' : 'text-gray-300'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < current ? 'bg-blue-600 border-blue-600 text-white'
              : i === current ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-gray-200 text-gray-300 bg-white'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i <= current ? 'text-gray-700' : 'text-gray-300'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 rounded ${i < current ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── InfoItem ─────────────────────────────────────────────────
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
      <span className="text-blue-600">{icon}</span>
    </div>
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  </div>
)

// ─── InputField ───────────────────────────────────────────────
const InputField = ({ label, name, value, onChange, placeholder, icon, error, type = 'text', disabled = false, required }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
          ${icon ? 'pl-10 pr-4' : 'px-4'}
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

// ─── Page Principale ──────────────────────────────────────────
const Paiement = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const { event, qty = 1, ticketType = 'NORMALE', prixUnitaire } = location.state || {}

  const [step, setStep] = useState(1)
  const [method, setMethod] = useState('CARD')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [reservationId, setReservationId] = useState(null)

  const prix = prixUnitaire ?? event?.prix ?? 0
  const fraisService = 5
  const total = prix * qty + fraisService

  // Infos visiteur
  const [visiteur, setVisiteur] = useState({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
  })

  // Infos carte
  const [card, setCard] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    phone: '',
  })

  // Auto-remplir si connecté
  useEffect(() => {
    console.log('USER:', user) 
    if (user) {
      setVisiteur({
        nom: user.nom || user.sub || '',
        prenom: user.prenom || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const handleVisiteurChange = (e) => {
    const { name, value } = e.target
    setVisiteur(v => ({ ...v, [name]: value }))
    setErrors(err => ({ ...err, [name]: null }))
  }

  const handleCardChange = (e) => {
    let { name, value } = e.target
    if (name === 'cardNumber') value = formatCardNumber(value)
    if (name === 'expiry') value = formatExpiry(value)
    if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 3)
    setCard(c => ({ ...c, [name]: value }))
    setErrors(err => ({ ...err, [name]: null }))
  }

  // Validation step 1
  const validateStep1 = () => {
    const e = {}
    if (!visiteur.nom.trim()) e.nom = 'Nom requis'
    if (!visiteur.prenom.trim()) e.prenom = 'Prénom requis'
    if (!visiteur.email.includes('@')) e.email = 'Email invalide'
    if (!visiteur.phone.trim()) e.phone = 'Téléphone requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Validation step 2
  const validateStep2 = () => {
    const e = {}
    if (method === 'CARD') {
      if (!card.cardName.trim()) e.cardName = 'Nom requis'
      if (card.cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Numéro invalide'      
      // Validation de la date d'expiration (format MM/YY)
      if (card.expiry.length !== 5) e.expiry = 'Date invalide'
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
        e.expiry = 'Date invalide';
      } else {
        const [monthStr, yearStr] = card.expiry.split('/');

        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);

        // Vérification du mois
        if (month < 1 || month > 12) {
          e.expiry = 'Mois invalide';
        } else {
          // La carte expire à la fin du mois indiqué
          const expiryDate = new Date(
            2000 + year, // année complète (ex: 26 -> 2026)
            month,       // mois suivant
            0,           // dernier jour du mois précédent
            23, 59, 59, 999
          );

          const now = new Date();

          if (expiryDate < now) {
            e.expiry = 'Carte expirée';
          }
        }
      }
      if (card.cvv.length !== 3) e.cvv = 'CVV invalide'
    } else {
      if (!card.phone.trim()) e.phone = 'Numéro requis'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePay = async () => {
    if (!validateStep2()) return
    setLoading(true)

    try {
      const body = {
        evenementId: event.id,
        nombrePlaces: qty,
        typeBillet: ticketType,
        methodePaiement: method,
        clientId: user ? user.id : null,
        visiteur: user ? null : {
          nom: visiteur.nom,
          prenom: visiteur.prenom,
          email: visiteur.email,
          phone: visiteur.phone,
        }
      }

      const response = await api.post('/public/checkout', body)
      setReservationId(response.data.reservationId)
      setStep(3)

    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Erreur lors du paiement' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    window.open(`http://localhost:8080/api/public/checkout/${reservationId}/pdf`, '_blank')
  }

  // ── Si pas de données event ──
  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-500 text-lg mb-4">Aucun événement sélectionné</p>
        <Link to="/events" className="text-blue-600 hover:underline">← Retour aux événements</Link>
      </div>
    </div>
  )

  // ─── STEP 3 : Confirmation ─────────────────────────────────
  if (step === 3) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="text-green-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Paiement confirmé !</h2>
        <p className="text-sm text-gray-500 mb-6">
          Votre réservation pour <span className="font-semibold text-gray-900">{event.titre}</span> est confirmée.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{qty} billet{qty > 1 ? 's' : ''} {ticketType}</span>
            <span>{(prix * qty).toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Frais de service</span>
            <span>{fraisService} DH</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total payé</span>
            <span className="text-blue-600">{total.toFixed(2)} DH</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleDownloadPdf}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FaTicketAlt size={14} /> Télécharger mes billets (PDF)
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-all text-sm"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => step === 1 ? navigate(-1) : setStep(s => s - 1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition-colors"
          >
            <FaArrowLeft size={12} /> Retour
          </button>
          <h1 className="text-base font-bold text-gray-900">Paiement sécurisé</h1>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
            <FaLock size={10} className="text-green-500" />
            <span>SSL sécurisé</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <Steps current={step - 1} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Colonne gauche ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* STEP 1 — Infos personnelles */}
            {step === 1 && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">
                    {user ? 'Vos informations' : 'Informations du participant'}
                  </h2>

                  {user && (
                    <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-600 font-medium">
                      ✅ Informations récupérées depuis votre compte
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Nom"
                      name="nom"
                      value={visiteur.nom}
                      onChange={handleVisiteurChange}
                      placeholder="Dupont"
                      icon={<FaUser size={12} />}
                      error={errors.nom}
                      disabled={!!user}
                      required={true}
                    />
                    <InputField
                      label="Prénom"
                      name="prenom"
                      value={visiteur.prenom}
                      onChange={handleVisiteurChange}
                      placeholder="Jean"
                      icon={<FaUser size={12} />}
                      error={errors.prenom}
                      disabled={!!user}
                      required={true}
                    />
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={visiteur.email}
                      onChange={handleVisiteurChange}
                      placeholder="jean@gmail.com"
                      icon={<FaEnvelope size={12} />}
                      error={errors.email}
                      disabled={!!user}
                      required={true}
                    />
                    <InputField
                      label="Téléphone"
                      name="phone"
                      value={visiteur.phone}
                      onChange={handleVisiteurChange}
                      placeholder="0661000001"
                      icon={<FaPhone size={12} />}
                      error={errors.phone}
                      disabled={!!user}
                      required={true}
                    />
                  </div>
                </div>

                {/* Récap commande */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Récapitulatif</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem icon={<FaCalendar size={14} />} label="Date" value={formatDate(event.dateDebut)} />
                    <InfoItem icon={<FaMapMarkerAlt size={14} />} label="Lieu" value={event.ville} />
                    <InfoItem icon={<FaTicketAlt size={14} />} label="Billets" value={`${qty} × ${ticketType}`} />
                    <InfoItem icon={<FaCreditCard size={14} />} label="Total" value={`${total.toFixed(2)} DH`} />
                  </div>
                </div>

                <button
                  onClick={() => { if (validateStep1()) setStep(2) }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Continuer vers le paiement →
                </button>
              </>
            )}

            {/* STEP 2 — Paiement */}
            {step === 2 && (
              <>
                {/* Méthode */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Méthode de paiement</h2>
                  <div className="flex gap-3">
                    {[
                      { key: 'CARD', icon: <FaCreditCard size={16} />, label: 'Carte bancaire' },
                      { key: 'MOBILE', icon: <FaMobileAlt size={16} />, label: 'Paiement mobile' },
                      { key: 'PAYPAL', icon: <FaPaypal size={16} />, label: 'PayPal' },
                    ].map(m => (
                      <button
                        key={m.key}
                        onClick={() => setMethod(m.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          method === m.key
                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Carte */}
                {method === 'CARD' && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900">Détails de la carte</h2>
                    <InputField
                      label="Nom sur la carte"
                      name="cardName"
                      value={card.cardName}
                      onChange={handleCardChange}
                      placeholder="JEAN DUPONT"
                      error={errors.cardName}
                      required={true}
                    />
                    <div className="relative">
                      <InputField
                        label="Numéro de carte"
                        name="cardNumber"
                        value={card.cardNumber}
                        onChange={handleCardChange}
                        placeholder="1234 5678 9012 3456"
                        error={errors.cardNumber}
                        required={true}
                      />
                      <FaCreditCard className="absolute right-4 top-9 text-gray-300" size={16} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Date d'expiration"
                        name="expiry"
                        value={card.expiry}
                        onChange={handleCardChange}
                        placeholder="MM/AA"
                        error={errors.expiry}
                        required={true}
                      />
                      <InputField
                        label="CVV"
                        name="cvv"
                        value={card.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        error={errors.cvv}
                        required={true}
                      />
                    </div>
                  </div>
                )}
                {method === 'PAYPAL' && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-3">PayPal</h2>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <FaPaypal className="text-blue-600 mx-auto mb-2" size={32} />
                      <p className="text-sm text-gray-600">
                        Vous serez redirigé vers PayPal pour finaliser votre paiement de manière sécurisée.
                      </p>
                    </div>
                  </div>
                )}
                {/* Mobile */}
                {method === 'MOBILE' && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-bold text-gray-900">Paiement mobile</h2>
                    <p className="text-sm text-gray-500">Vous recevrez une confirmation par SMS.</p>
                    <InputField
                      label="Numéro de téléphone"
                      name="phone"
                      value={card.phone}
                      onChange={handleCardChange}
                      placeholder="+212 6XX XXX XXX"
                      icon={<FaPhone size={12} />}
                      error={errors.phone}
                      required={true}
                    />
                  </div>
                )
                }

                {errors.api && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                    ⚠️ {errors.api}
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Traitement en cours...
                    </>
                  ) : (
                    <><FaLock size={12} /> Payer {total.toFixed(2)} DH</>
                  )}
                </button>
              </>
            )}
          </div>

          {/* ── Colonne droite sticky ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{event.titre}</h3>
              <p className="text-xs text-gray-400 mb-4">{formatDate(event.dateDebut)}</p>

              {/* Type billet */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${
                ticketType === 'VIP'
                  ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                {ticketType === 'VIP' ? '⭐ VIP' : '🎫 NORMALE'}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{prix} DH × {qty}</span>
                  <span>{(prix * qty).toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Frais de service</span>
                  <span>{fraisService} DH</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">{total.toFixed(2)} DH</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                🔒 Paiement sécurisé · Annulation gratuite jusqu'à 48h avant
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Paiement
