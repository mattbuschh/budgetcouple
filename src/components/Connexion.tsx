import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface ConnexionProps {
  onConnexionReussie: () => void;
}

export function Connexion({ onConnexionReussie }: ConnexionProps) {
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const MOT_DE_PASSE_CORRECT = 'chamatt2512';

  const gererSoumission = (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    // Simulation d'un délai de vérification
    setTimeout(() => {
      if (motDePasse === MOT_DE_PASSE_CORRECT) {
        localStorage.setItem('budgetAuth', 'true');
        onConnexionReussie();
      } else {
        setErreur('Mot de passe incorrect. Veuillez réessayer.');
        setMotDePasse('');
      }
      setChargement(false);
    }, 500);
  };

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
            Veuillez saisir votre mot de passe pour accéder à votre budget
          </p>
        </div>

        <form onSubmit={gererSoumission} className="space-y-6">
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
                  erreur ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Saisissez votre mot de passe"
                required
                disabled={chargement}
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
            {erreur && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {erreur}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={chargement || !motDePasse}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {chargement ? (
              <>
                <div className="animate-spin rounded-full h-4 sm:h-5 w-4 sm:w-5 border-b-2 border-white mr-2"></div>
                Vérification...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Accès sécurisé à votre gestionnaire de budget personnel
          </p>
        </div>
      </div>
    </div>
  );
}