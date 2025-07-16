import React from 'react';
import { useBudget } from '../context/BudgetContext';
import { RefreshCw, Database, AlertCircle, CheckCircle } from 'lucide-react';

export function TestBudgetContext() {
  const { donneesGoogleSheets, chargement, erreur, chargerDonneesGoogleSheets } = useBudget();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Test Google Sheets Context</h2>
          </div>
          
          <button
            onClick={chargerDonneesGoogleSheets}
            disabled={chargement}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${chargement ? 'animate-spin' : ''}`} />
            <span>{chargement ? 'Chargement...' : 'Actualiser'}</span>
          </button>
        </div>

        {/* Statut */}
        <div className="mb-6">
          {chargement && (
            <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Chargement des données Google Sheets...</span>
            </div>
          )}
          
          {erreur && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>Erreur: {erreur}</span>
            </div>
          )}
          
          {!chargement && !erreur && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span>{donneesGoogleSheets.length} entrées chargées avec succès</span>
            </div>
          )}
        </div>

        {/* Tableau des données */}
        {donneesGoogleSheets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Partenaire</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Catégorie</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Montant</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Compte</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Commentaire</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Mois</th>
                </tr>
              </thead>
              <tbody>
                {donneesGoogleSheets.map((entree, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {entree.date ? new Date(entree.date).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`font-medium ${
                        entree.type === 'revenu' ? 'text-green-600' :
                        entree.type === 'dépense' ? 'text-red-600' :
                        entree.type === 'épargne' ? 'text-blue-600' :
                        entree.type === 'santé' ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        {entree.type}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{entree.partenaire}</td>
                    <td className="border border-gray-300 px-4 py-2">{entree.categorie}</td>
                    <td className="border border-gray-300 px-4 py-2 font-mono">
                      {entree.montant.toLocaleString('fr-FR', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{entree.compte}</td>
                    <td className="border border-gray-300 px-4 py-2">{entree.commentaire}</td>
                    <td className="border border-gray-300 px-4 py-2">{entree.mois}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Message si aucune donnée */}
        {!chargement && !erreur && donneesGoogleSheets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune donnée trouvée dans Google Sheets</p>
          </div>
        )}
      </div>
    </div>
  );
}