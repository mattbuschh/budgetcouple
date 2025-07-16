import React, { useState } from 'react';
import { useBudget } from '../context/SimpleBudgetContext';
import { SectionRevenus } from './sections/SectionRevenus';
import { SectionDepenses } from './sections/SectionDepenses';
import { SectionEpargne } from './sections/SectionEpargne';
import { SectionSante } from './sections/SectionSante';

interface VueMensuelleProps {
  mois: number;
  onChangementMois: (mois: number) => void;
}

const nomsMois = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function VueMensuelle({ mois }: VueMensuelleProps) {
  const { donnees, calculerTotauxMensuels } = useBudget();
  const [sectionActive, setSectionActive] = useState<'revenus' | 'depenses' | 'epargne' | 'sante'>('revenus');

  const donneesMois = donnees.mois[mois];
  const totaux = calculerTotauxMensuels(mois);

  const couleursSections = {
    revenus: 'bg-green-50 border-green-200',
    depenses: 'bg-red-50 border-red-200',
    epargne: 'bg-blue-50 border-blue-200',
    sante: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className="space-y-6">
      {/* En-tête du Mois */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            <span className="hidden sm:inline">Budget {nomsMois[mois]}</span>
            <span className="sm:hidden">{nomsMois[mois]}</span>
          </h2>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-600">Solde Net</p>
            <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${totaux.restant >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totaux.restant.toLocaleString()}{donnees.devise}
            </p>
          </div>
        </div>
      </div>

      {/* Cartes de Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-green-600 mb-2">Total Revenus</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {totaux.totalRevenus.toLocaleString()}{donnees.devise}
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                {donnees.personnes.personne1.photo ? (
                  <img
                    src={donnees.personnes.personne1.photo}
                    alt={donnees.personnes.personne1.nom}
                    className="w-3 sm:w-4 h-3 sm:h-4 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-3 sm:w-4 h-3 sm:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: donnees.personnes.personne1.couleur }}
                  />
                )}
                <span className="truncate">{donnees.personnes.personne1.nom}</span>
              </div>
              <span className="font-medium">
                {donneesMois.revenus
                  .filter(r => r.personne === 'personne1')
                  .reduce((somme, r) => somme + r.montant, 0)
                  .toLocaleString()}{donnees.devise}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                {donnees.personnes.personne2.photo ? (
                  <img
                    src={donnees.personnes.personne2.photo}
                    alt={donnees.personnes.personne2.nom}
                    className="w-3 sm:w-4 h-3 sm:h-4 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-3 sm:w-4 h-3 sm:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: donnees.personnes.personne2.couleur }}
                  />
                )}
                <span className="truncate">{donnees.personnes.personne2.nom}</span>
              </div>
              <span className="font-medium">
                {donneesMois.revenus
                  .filter(r => r.personne === 'personne2')
                  .reduce((somme, r) => somme + r.montant, 0)
                  .toLocaleString()}{donnees.devise}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-2">Total Dépenses</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {totaux.totalDepenses.toLocaleString()}{donnees.devise}
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Variables</span>
              <span className="font-medium">
                {donneesMois.depenses
                  .filter(d => d.type === 'variable')
                  .reduce((somme, d) => somme + d.montant, 0)
                  .toLocaleString()}{donnees.devise}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Fixes</span>
              <span className="font-medium">
                {donneesMois.depenses
                  .filter(d => d.type === 'fixe')
                  .reduce((somme, d) => somme + d.montant, 0)
                  .toLocaleString()}{donnees.devise}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-2">Total Épargne</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {totaux.totalEpargne.toLocaleString()}{donnees.devise}
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Taux d'Épargne</span>
              <span className="font-medium">
                {totaux.totalRevenus > 0 ? ((totaux.totalEpargne / totaux.totalRevenus) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des Sections */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <div className="flex space-x-1 sm:space-x-2 min-w-max">
          {[
            { cle: 'revenus', libelle: 'Revenus', couleur: 'text-green-600' },
            { cle: 'depenses', libelle: 'Dépenses', couleur: 'text-red-600' },
            { cle: 'epargne', libelle: 'Épargne', couleur: 'text-blue-600' },
            { cle: 'sante', libelle: 'Santé', couleur: 'text-purple-600' }
          ].map((section) => (
            <button
              key={section.cle}
              onClick={() => setSectionActive(section.cle as any)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
                sectionActive === section.cle
                  ? `bg-${section.couleur.split('-')[1]}-100 ${section.couleur}`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {section.libelle}
            </button>
          ))}
        </div>
      </div>

      {/* Section Active */}
      <div className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border ${couleursSections[sectionActive]}`}>
        {sectionActive === 'revenus' && <SectionRevenus mois={mois} />}
        {sectionActive === 'depenses' && <SectionDepenses mois={mois} />}
        {sectionActive === 'epargne' && <SectionEpargne mois={mois} />}
        {sectionActive === 'sante' && <SectionSante mois={mois} />}
      </div>
    </div>
  );
}