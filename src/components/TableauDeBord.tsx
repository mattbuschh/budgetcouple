import React from 'react';
import { useBudget } from '../context/SimpleBudgetContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, PiggyBank, CreditCard } from 'lucide-react';

const nomsMois = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

export function TableauDeBord() {
  const { donnees, calculerTotauxMensuels } = useBudget();

  const donneesAnnuelles = nomsMois.map((mois, index) => {
    const totaux = calculerTotauxMensuels(index);
    return {
      mois,
      revenus: totaux.totalRevenus,
      depenses: totaux.totalDepenses,
      epargne: totaux.totalEpargne,
      restant: totaux.restant
    };
  });

  const totalRevenusAnnuels = donneesAnnuelles.reduce((somme, mois) => somme + mois.revenus, 0);
  const totalDepensesAnnuelles = donneesAnnuelles.reduce((somme, mois) => somme + mois.depenses, 0);
  const totalEpargneAnnuelle = donneesAnnuelles.reduce((somme, mois) => somme + mois.epargne, 0);
  const totalRestantAnnuel = totalRevenusAnnuels - totalDepensesAnnuelles - totalEpargneAnnuelle;

  const categoriesDepenses = donnees.mois.reduce((acc, mois) => {
    mois.depenses.forEach(depense => {
      if (!acc[depense.categorie]) {
        acc[depense.categorie] = 0;
      }
      acc[depense.categorie] += depense.montant;
    });
    return acc;
  }, {} as Record<string, number>);

  const donneesCamembert = Object.entries(categoriesDepenses).map(([categorie, montant]) => ({
    nom: categorie,
    valeur: montant
  }));

  const COULEURS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Revenus Annuels</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                {totalRevenusAnnuels.toLocaleString()}{donnees.devise}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Dépenses Annuelles</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
                {totalDepensesAnnuelles.toLocaleString()}{donnees.devise}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-full">
              <CreditCard className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Épargne Annuelle</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                {totalEpargneAnnuelle.toLocaleString()}{donnees.devise}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <PiggyBank className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Solde Net</p>
              <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${totalRestantAnnuel >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalRestantAnnuel.toLocaleString()}{donnees.devise}
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-full ${totalRestantAnnuel >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 ${totalRestantAnnuel >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Vue d'Ensemble Mensuelle</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={donneesAnnuelles}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" fontSize={12} />
              <YAxis />
              <Tooltip formatter={(value) => `${value}${donnees.devise}`} />
              <Bar dataKey="revenus" fill="#10B981" name="Revenus" />
              <Bar dataKey="depenses" fill="#EF4444" name="Dépenses" />
              <Bar dataKey="epargne" fill="#3B82F6" name="Épargne" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Catégories de Dépenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={donneesCamembert}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nom, percent }) => percent > 5 ? `${nom.length > 8 ? nom.substring(0, 8) + '...' : nom} ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={70}
                fill="#8884d8"
                dataKey="valeur"
              >
                {donneesCamembert.map((entree, index) => (
                  <Cell key={`cell-${index}`} fill={COULEURS[index % COULEURS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}${donnees.devise}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Tendance Mensuelle</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={donneesAnnuelles}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" fontSize={12} />
            <YAxis />
            <Tooltip formatter={(value) => `${value}${donnees.devise}`} />
            <Line type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={2} name="Revenus" />
            <Line type="monotone" dataKey="depenses" stroke="#EF4444" strokeWidth={2} name="Dépenses" />
            <Line type="monotone" dataKey="restant" stroke="#3B82F6" strokeWidth={2} name="Restant" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Comptes Bancaires</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {donnees.comptesBancaires.map((compte) => (
            <div key={compte.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 sm:w-4 h-3 sm:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: compte.couleur }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{compte.nom}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {compte.solde.toLocaleString()}{donnees.devise}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}