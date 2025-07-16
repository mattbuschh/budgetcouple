// Service pour l'API Google Sheets
export interface LigneBudget {
  date: string;
  type: string;
  partenaire: string;
  categorie: string;
  montant: number;
  compte: string;
  commentaire: string;
  mois: string;
}

const API_URL = 'const API_URL = 'https://v1.nocodeapi.com/mattbusch/google_sheets/leEhXUyGQcrZAMIJ?tabId=Feuille%201';

/**
 * Ajoute une ligne au Google Sheet
 */
export async function ajouterLigneBudget(ligne: LigneBudget): Promise<void> {
  try {
    const data = [
      [
        ligne.date,
        ligne.type,
        ligne.partenaire,
        ligne.categorie,
        ligne.montant,
        ligne.compte,
        ligne.commentaire,
        ligne.mois
      ]
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }

    console.log('✅ Ligne ajoutée avec succès à Google Sheets');
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout:', error);
    throw error;
  }
}

/**
 * Charge toutes les données du Google Sheet
 */
export async function chargerBudget(): Promise<string[][]> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📊 Données chargées depuis Google Sheets:', result);
    
    // Retourne les données sous forme de tableau
    return result.data || [];
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error);
    throw error;
  }
}