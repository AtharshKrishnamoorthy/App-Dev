// Dark Mode Management
function initTheme() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Tab Navigation
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');

        if (button.dataset.tab === 'favorites') {
            loadFavorites();
        }
    });
});

// Favorites Management
let favorites = JSON.parse(localStorage.getItem('drugFavorites')) || [];

function toggleFavorite(drugData) {
    const index = favorites.findIndex(f => f.brandName === drugData.brandName);
    if (index === -1) {
        favorites.push(drugData);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('drugFavorites', JSON.stringify(favorites));
    loadFavorites();
    // Refresh the current search results to update star status
    const results = document.getElementById('results');
    if (results.children.length > 0) {
        const firstDrug = results.children[0];
        const brandName = firstDrug.querySelector('h2').textContent;
        const favoriteButton = firstDrug.querySelector('.favorite-button');
        favoriteButton.classList.toggle('active', isFavorite(brandName));
    }
}

function isFavorite(drugName) {
    return favorites.some(f => f.brandName === drugName);
}

function loadFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';

    if (!favorites || favorites.length === 0) {
        favoritesList.innerHTML = `
            <div class="search-section">
                <p>You haven't saved any medications to your favorites yet.</p>
                <p>To add medications to your favorites:</p>
                <ol>
                    <li>Go to the Drug Search tab</li>
                    <li>Search for a medication</li>
                    <li>Click the star icon on any medication card</li>
                </ol>
            </div>
        `;
        return;
    }

    favorites.forEach(drug => {
        const card = createDrugCard(drug, true);
        favoritesList.appendChild(card);
    });
}

// Drug Search Function
async function searchDrug() {
    const searchInput = document.getElementById('searchInput').value;
    if (!searchInput) {
        showError('Please enter a drug name');
        return;
    }

    showLoading();
    clearResults();

    try {
        const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${searchInput}"&limit=1`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const drug = data.results[0];
            const drugData = {
                brandName: drug.openfda?.brand_name?.[0] || 'Unknown Brand',
                genericName: drug.openfda?.generic_name?.[0] || 'Unknown Generic Name',
                warnings: drug.warnings?.[0] || 'No warnings available',
                manufacturer: drug.openfda?.manufacturer_name?.[0] || 'Unknown Manufacturer',
                purpose: drug.purpose?.[0] || drug.indications_and_usage?.[0] || "Please consult healthcare provider for drug purpose",
                indications_and_usage: drug.indications_and_usage
            };
            const card = createDrugCard(drugData);
            document.getElementById('results').appendChild(card);
            hideError();
        } else {
            showError('No drugs found matching your search');
        }
    } catch (err) {
        showError('Error fetching drug information. Please try again.');
        console.error('API Error:', err);
    } finally {
        hideLoading();
    }
}

function createDrugCard(drug, isFavoritesView = false) {
    const card = document.createElement('div');
    card.className = 'drug-card';

    const favoriteButton = document.createElement('button');
    favoriteButton.className = `favorite-button ${isFavorite(drug.brandName) ? 'active' : ''}`;
    favoriteButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="${isFavorite(drug.brandName) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
    `;
    favoriteButton.onclick = () => toggleFavorite(drug);

    // Format purpose text - if not available, attempt to get from indications
    const purposeText = drug.purpose || drug.indications_and_usage?.[0] || "Please consult healthcare provider for drug purpose";

    card.innerHTML = `
        <h2>${drug.brandName}</h2>
        <p><strong>Generic Name:</strong> ${drug.genericName}</p>
        <p><strong>Manufacturer:</strong> ${drug.manufacturer}</p>
        <p><strong>Purpose:</strong> ${truncateText(purposeText, 200)}</p>
        <p><strong>Warnings:</strong> ${truncateText(drug.warnings, 200)}</p>
    `;

    card.insertBefore(favoriteButton, card.firstChild);
    return card;
}

// Interaction Checker
async function checkInteractions() {
    const drug1 = document.getElementById('drug1Input').value;
    const drug2 = document.getElementById('drug2Input').value;
    const loading = document.getElementById('interaction-loading');
    const error = document.getElementById('interaction-error');
    const results = document.getElementById('interaction-results');

    if (!drug1 || !drug2) {
        showError('Please enter both drug names', 'interaction-error');
        return;
    }

    loading.style.display = 'block';
    error.style.display = 'none';
    results.innerHTML = '';

    try {
        // Fetch information for both drugs
        const [drug1Data, drug2Data] = await Promise.all([
            fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drug1}"&limit=1`).then(r => r.json()),
            fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drug2}"&limit=1`).then(r => r.json())
        ]);

        if (drug1Data.results?.[0] && drug2Data.results?.[0]) {
            const interactionAnalysis = analyzeInteractions(drug1Data.results[0], drug2Data.results[0]);
            displayInteractionResults(interactionAnalysis);
        } else {
            showError('One or both drugs not found', 'interaction-error');
        }
    } catch (err) {
        showError('Error checking drug interactions. Please try again.', 'interaction-error');
        console.error('Interaction Check Error:', err);
    } finally {
        loading.style.display = 'none';
    }
}

function analyzeInteractions(drug1, drug2) {
    const interactions = [];
    
    // Check for common warnings
    const warnings1 = drug1.warnings?.[0]?.toLowerCase() || '';
    const warnings2 = drug2.warnings?.[0]?.toLowerCase() || '';

    // Check for contraindications
    if (drug1.contraindications && drug2.contraindications) {
        interactions.push({
            severity: 'high',
            description: 'Both medications have contraindications. Please consult your healthcare provider.',
            details: 'Careful monitoring required'
        });
    }

    // Check for common drug classes
    const drugClass1 = drug1.openfda?.pharm_class_epc || [];
    const drugClass2 = drug2.openfda?.pharm_class_epc || [];
    
    if (drugClass1.some(c1 => drugClass2.includes(c1))) {
        interactions.push({
            severity: 'moderate',
            description: 'Medications belong to the same drug class',
            details: 'May have additive effects'
        });
    }

    // Add a general warning
    interactions.push({
        severity: 'low',
        description: 'General Precaution',
        details: 'Always consult your healthcare provider before combining medications'
    });

    return {
        drug1: drug1.openfda?.brand_name?.[0] || 'Unknown Drug 1',
        drug2: drug2.openfda?.brand_name?.[0] || 'Unknown Drug 2',
        interactions
    };
}

function displayInteractionResults(analysis) {
    const results = document.getElementById('interaction-results');
    results.innerHTML = `
        <h2>Interaction Analysis: ${analysis.drug1} + ${analysis.drug2}</h2>
        ${analysis.interactions.map(interaction => `
            <div class="interaction-card">
                <span class="interaction-severity severity-${interaction.severity}">
                    ${interaction.severity.toUpperCase()} RISK
                </span>
                <h3>${interaction.description}</h3>
                <p>${interaction.details}</p>
            </div>
        `).join('')}
        <p class="disclaimer">Note: This analysis is for informational purposes only. Always consult your healthcare provider.</p>
    `;
}

// Utility Functions
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message, elementId = 'error') {
    const error = document.getElementById(elementId);
    error.textContent = message;
    error.style.display = 'block';
}

function hideError(elementId = 'error') {
    document.getElementById(elementId).style.display = 'none';
}

function clearResults() {
    document.getElementById('results').innerHTML = '';
}

// Event Listeners
// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    if (document.querySelector('.tab-button[data-tab="favorites"]').classList.contains('active')) {
        loadFavorites();
    }

    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchDrug();
        }
    });
});