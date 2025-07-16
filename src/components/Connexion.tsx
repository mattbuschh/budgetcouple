import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Lock, Eye, EyeOff, Mail, UserPlus } from 'lucide-react';

export function Connexion() {
  const { signIn, signUp, chargement, erreur } = useBudget();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [modeInscription, setModeInscription] = useState(false);
  const [erreurLocale, setErreurLocale] = useState('');

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurLocale('');

    if (!email || !motDePasse) {
      setErreurLocale('Veuillez remplir tous les champs');
      return;
    }

    if (motDePasse.length < 6) {
      setErreurLocale('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      if (modeInscription) {
        await signUp(email, motDePasse);
        // Attendre un peu pour que l'utilisateur soit créé
        setTimeout(() => {
          setErreurLocale('');
          alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
          setModeInscription(false);
        }, 1000);
      } else {
        await signIn(email, motDePasse);
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      if (error instanceof Error) {
        setErreurLocale(error.message);
      }
    }
  };

  const messageErreur = erreurLocale || erreur;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Gestionnaire de Budget
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {modeInscription 
              ? 'Créez votre compte pour commencer' 
              : 'Connectez-vous à votre compte'
            }
          </p>
        </div>

        <form onSubmit={gererSoumission} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 sm:pl-12 text-sm sm:text-base ${
                  messageErreur ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="votre@email.com"
                required
                disabled={chargement}
              />
              <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
            </div>
          </div>

          <div>
            <label htmlFor="motDePasse" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="motDePasse"
                type={afficherMotDePasse ? 'text' : 'password'}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 sm:pr-12 text-sm sm:text-base ${
                  messageErreur ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={modeInscription ? 'Créez un mot de passe (min. 6 caractères)' : 'Votre mot de passe'}
                required
                disabled={chargement}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={chargement}
              >
                {afficherMotDePasse ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {messageErreur && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {messageErreur}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={chargement || !email || !motDePasse}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {chargement ? (
              <>
                <div className="animate-spin rounded-full h-4 sm:h-5 w-4 sm:w-5 border-b-2 border-white mr-2"></div>
                {modeInscription ? 'Création...' : 'Connexion...'}
              </>
            ) : (
              <>
                {modeInscription ? (
                  <>
                    <UserPlus className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Créer un compte
                  </>
                ) : (
                  <>
                    <Lock className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Se connecter
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setModeInscription(!modeInscription);
              setErreurLocale('');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm sm:text-base font-medium transition-colors"
            disabled={chargement}
          >
            {modeInscription 
              ? 'Déjà un compte ? Se connecter' 
              : 'Pas de compte ? S\'inscrire'
            }
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            {modeInscription 
              ? 'Créez votre compte sécurisé avec Supabase' 
              : 'Accès sécurisé à votre gestionnaire de budget'
            }
          </p>
        </div>
      </div>
    </div>
  );
}