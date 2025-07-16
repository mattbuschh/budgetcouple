import React from 'react';
import { Home, Calendar, Settings, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

interface NavigationProps {
  vueActuelle: 'tableau-de-bord' | 'mensuel' | 'parametres';
  onChangementVue: (vue: 'tableau-de-bord' | 'mensuel' | 'parametres') => void;
  moisSelectionne: number;
  onChangementMois: (mois: number) => void;
}

const mois = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function Navigation({ vueActuelle, onChangementVue, moisSelectionne, onChangementMois }: NavigationProps) {
  const [menuMobileOuvert, setMenuMobileOuvert] = React.useState(false);

  const moisPrecedent = () => {
    onChangementMois(moisSelectionne === 0 ? 11 : moisSelectionne - 1);
  };

  const moisSuivant = () => {
    onChangementMois(moisSelectionne === 11 ? 0 : moisSelectionne + 1);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
              <span className="hidden sm:inline">Gestionnaire de Budget</span>
              <span className="sm:hidden">Budget</span>
            </h1>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onChangementVue('tableau-de-bord')}
              className={`px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm lg:text-base ${
                vueActuelle === 'tableau-de-bord' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home size={18} />
              <span className="hidden lg:inline">Tableau de Bord</span>
              <span className="lg:hidden">Tableau</span>
            </button>
            
            <button
              onClick={() => onChangementVue('mensuel')}
              className={`px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm lg:text-base ${
                vueActuelle === 'mensuel' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar size={18} />
              <span className="hidden lg:inline">Vue Mensuelle</span>
              <span className="lg:hidden">Mensuel</span>
            </button>
            
            <button
              onClick={() => onChangementVue('parametres')}
              className={`px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm lg:text-base ${
                vueActuelle === 'parametres' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings size={18} />
              <span className="hidden lg:inline">Paramètres</span>
              <span className="lg:hidden">Config</span>
            </button>
          </div>

          {/* Sélecteur de mois - desktop */}
          {vueActuelle === 'mensuel' && (
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={moisPrecedent}
                className="p-1 lg:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="text-sm lg:text-lg font-semibold text-gray-800 min-w-[80px] lg:min-w-[120px] text-center">
                {mois[moisSelectionne]}
              </div>
              
              <button
                onClick={moisSuivant}
                className="p-1 lg:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Menu mobile */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Sélecteur de mois mobile pour vue mensuelle */}
            {vueActuelle === 'mensuel' && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={moisPrecedent}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-xs font-semibold text-gray-800 min-w-[40px] text-center">
                  {mois[moisSelectionne].substring(0, 3)}
                </div>
                <button
                  onClick={moisSuivant}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setMenuMobileOuvert(!menuMobileOuvert)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {menuMobileOuvert ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {menuMobileOuvert && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  onChangementVue('tableau-de-bord');
                  setMenuMobileOuvert(false);
                }}
                className={`px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                  vueActuelle === 'tableau-de-bord' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home size={20} />
                <span>Tableau de Bord</span>
              </button>
              
              <button
                onClick={() => {
                  onChangementVue('mensuel');
                  setMenuMobileOuvert(false);
                }}
                className={`px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                  vueActuelle === 'mensuel' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar size={20} />
                <span>Vue Mensuelle</span>
              </button>
              
              <button
                onClick={() => {
                  onChangementVue('parametres');
                  setMenuMobileOuvert(false);
                }}
                className={`px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                  vueActuelle === 'parametres' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings size={20} />
                <span>Paramètres</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}