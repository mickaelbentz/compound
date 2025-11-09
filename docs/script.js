// Variables globales pour stocker les résultats
let calculationResults = [];

// Éléments DOM
const modeButtons = document.querySelectorAll('.mode-btn');
const forwardCalculator = document.getElementById('forward-calculator');
const reverseCalculator = document.getElementById('reverse-calculator');
const resultsSection = document.getElementById('results');

const calculateForwardBtn = document.getElementById('calculate-forward');
const calculateReverseBtn = document.getElementById('calculate-reverse');

const exportCSVBtn = document.getElementById('export-csv');
const exportJSONBtn = document.getElementById('export-json');

// Gestion du changement de mode
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;

        // Mettre à jour les boutons
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Afficher le bon calculateur
        if (mode === 'forward') {
            forwardCalculator.classList.remove('hidden');
            reverseCalculator.classList.add('hidden');
        } else {
            forwardCalculator.classList.add('hidden');
            reverseCalculator.classList.remove('hidden');
        }

        // Cacher les résultats
        resultsSection.classList.add('hidden');
    });
});

// Calcul forward: Valeur finale à partir du taux
calculateForwardBtn.addEventListener('click', () => {
    const initialValue = parseFloat(document.getElementById('initial-value').value);
    const growthRate = parseFloat(document.getElementById('growth-rate').value);
    const regularPayment = parseFloat(document.getElementById('regular-payment').value) || 0;
    const inflationRate = parseFloat(document.getElementById('inflation-rate').value) || 0;
    const duration = parseInt(document.getElementById('duration').value);
    const period = document.getElementById('period-forward').value;

    if (isNaN(initialValue) || isNaN(growthRate) || isNaN(duration)) {
        alert('Veuillez remplir tous les champs avec des valeurs valides');
        return;
    }

    if (duration <= 0) {
        alert('La durée doit être supérieure à 0');
        return;
    }

    const rate = growthRate / 100;

    // Calculer le taux d'inflation par période
    const periodsPerYear = period === 'year' ? 1 : period === 'month' ? 12 : 52;
    const inflationRatePerPeriod = Math.pow(1 + inflationRate / 100, 1 / periodsPerYear) - 1;

    // Générer la timeline avec versements réguliers et inflation
    calculationResults = [];
    let currentValue = initialValue;
    let totalPayments = initialValue;

    for (let i = 0; i <= duration; i++) {
        if (i === 0) {
            const realValue = currentValue;
            calculationResults.push({
                period: i,
                value: currentValue,
                realValue: realValue,
                growth: 0,
                payment: regularPayment
            });
        } else {
            // Appliquer la croissance à la valeur actuelle
            currentValue = currentValue * (1 + rate);

            // Ajouter le versement régulier
            currentValue += regularPayment;
            totalPayments += regularPayment;

            // Calculer la valeur réelle (ajustée à l'inflation)
            const inflationFactor = Math.pow(1 + inflationRatePerPeriod, i);
            const realValue = currentValue / inflationFactor;

            const previousValue = calculationResults[i - 1].value;
            const growth = currentValue - previousValue;

            calculationResults.push({
                period: i,
                value: currentValue,
                realValue: realValue,
                growth: growth,
                payment: regularPayment
            });
        }
    }

    const finalValue = currentValue;
    const finalRealValue = calculationResults[duration].realValue;
    const totalGrowth = finalValue - totalPayments;
    const totalGrowthPercent = (totalGrowth / totalPayments) * 100;

    displayResults({
        type: 'forward',
        initialValue,
        finalValue,
        finalRealValue,
        growthRate,
        duration,
        period,
        totalGrowth,
        totalGrowthPercent,
        regularPayment,
        inflationRate,
        totalPayments
    });
});

// Calcul reverse: Taux nécessaire à partir de l'objectif
calculateReverseBtn.addEventListener('click', () => {
    const initialValue = parseFloat(document.getElementById('initial-value-reverse').value);
    const targetValue = parseFloat(document.getElementById('target-value').value);
    const regularPayment = parseFloat(document.getElementById('regular-payment-reverse').value) || 0;
    const inflationRate = parseFloat(document.getElementById('inflation-rate-reverse').value) || 0;
    const duration = parseInt(document.getElementById('duration-reverse').value);
    const period = document.getElementById('period-reverse').value;

    if (isNaN(initialValue) || isNaN(targetValue) || isNaN(duration)) {
        alert('Veuillez remplir tous les champs avec des valeurs valides');
        return;
    }

    if (duration <= 0) {
        alert('La durée doit être supérieure à 0');
        return;
    }

    if (targetValue <= initialValue && regularPayment === 0) {
        alert('La valeur cible doit être supérieure à la valeur de départ (ou ajoutez des versements réguliers)');
        return;
    }

    // Calculer le taux d'inflation par période
    const periodsPerYear = period === 'year' ? 1 : period === 'month' ? 12 : 52;
    const inflationRatePerPeriod = Math.pow(1 + inflationRate / 100, 1 / periodsPerYear) - 1;

    // Si inflation: la valeur cible est en pouvoir d'achat futur
    // Il faut donc viser une valeur nominale plus élevée
    // Exemple: 100k€ dans 10 ans avec 2% inflation = il faut atteindre 121.9k€ nominaux
    const inflationFactor = Math.pow(1 + inflationRatePerPeriod, duration);
    const targetValueNominal = inflationRate > 0 ? targetValue * inflationFactor : targetValue;

    // Fonction pour calculer la valeur finale avec un taux donné
    function calculateFinalValue(rate) {
        let value = initialValue;
        for (let i = 1; i <= duration; i++) {
            value = value * (1 + rate);
            value += regularPayment;
        }
        return value;
    }

    // Recherche itérative du taux nécessaire (méthode de Newton-Raphson simplifiée)
    let rate = 0.05; // Point de départ: 5%
    let iterations = 0;
    const maxIterations = 1000;
    const tolerance = 0.01; // Tolérance de 1 centime

    if (regularPayment === 0) {
        // Solution analytique simple sans versements
        const growthFactor = targetValueNominal / initialValue;
        rate = Math.pow(growthFactor, 1 / duration) - 1;
    } else {
        // Recherche itérative avec versements réguliers
        while (iterations < maxIterations) {
            const currentFV = calculateFinalValue(rate);
            const diff = currentFV - targetValueNominal;

            if (Math.abs(diff) < tolerance) {
                break;
            }

            // Ajustement du taux
            const adjustmentRate = rate + 0.0001;
            const adjustedFV = calculateFinalValue(adjustmentRate);
            const derivative = (adjustedFV - currentFV) / 0.0001;

            if (derivative !== 0) {
                rate = rate - (diff / derivative);
            } else {
                rate *= 1.1; // Augmenter de 10% si dérivée nulle
            }

            // Garder le taux dans des limites raisonnables
            rate = Math.max(-0.5, Math.min(rate, 5.0));

            iterations++;
        }
    }

    const growthRate = rate * 100;

    // Générer la timeline avec versements réguliers et inflation
    calculationResults = [];
    let currentValue = initialValue;
    let totalPayments = initialValue;

    for (let i = 0; i <= duration; i++) {
        if (i === 0) {
            const realValue = currentValue;
            calculationResults.push({
                period: i,
                value: currentValue,
                realValue: realValue,
                growth: 0,
                payment: regularPayment
            });
        } else {
            // Appliquer la croissance
            currentValue = currentValue * (1 + rate);

            // Ajouter le versement régulier
            currentValue += regularPayment;
            totalPayments += regularPayment;

            // Calculer la valeur réelle (ajustée à l'inflation)
            const inflationFactorPeriod = Math.pow(1 + inflationRatePerPeriod, i);
            const realValue = currentValue / inflationFactorPeriod;

            const previousValue = calculationResults[i - 1].value;
            const growth = currentValue - previousValue;

            calculationResults.push({
                period: i,
                value: currentValue,
                realValue: realValue,
                growth: growth,
                payment: regularPayment
            });
        }
    }

    const finalValue = currentValue;
    const finalRealValue = calculationResults[duration].realValue;
    const totalGrowth = finalValue - totalPayments;
    const totalGrowthPercent = (totalGrowth / totalPayments) * 100;

    displayResults({
        type: 'reverse',
        initialValue,
        finalValue,
        finalRealValue,
        targetValue, // Valeur cible saisie par l'utilisateur (pouvoir d'achat)
        growthRate,
        duration,
        period,
        totalGrowth,
        totalGrowthPercent,
        regularPayment,
        inflationRate,
        totalPayments
    });
});

// Afficher les résultats
function displayResults(data) {
    const resultMain = document.getElementById('result-main');
    const resultDetails = document.getElementById('result-details');
    const timeline = document.getElementById('timeline');

    const periodLabel = getPeriodLabel(data.period, false);
    const periodLabelPlural = getPeriodLabel(data.period, true);

    if (data.type === 'forward') {
        // Afficher valeur nominale vs réelle si inflation
        const hasInflation = data.inflationRate && data.inflationRate > 0;
        const valueDisplay = hasInflation
            ? `<div class="result-value">${formatCurrency(data.finalValue)}</div>
               <div class="result-value-real">Valeur réelle: ${formatCurrency(data.finalRealValue)}</div>`
            : `<div class="result-value">${formatCurrency(data.finalValue)}</div>`;

        resultMain.innerHTML = `
            ${valueDisplay}
            <div class="result-label">Valeur finale après ${data.duration} ${periodLabelPlural}</div>
        `;

        const hasPayments = data.regularPayment && data.regularPayment > 0;

        let detailsHTML = `
            <div class="detail-item">
                <div class="detail-label">Valeur de départ</div>
                <div class="detail-value">${formatCurrency(data.initialValue)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Taux de croissance</div>
                <div class="detail-value">${data.growthRate.toFixed(2)}% / ${periodLabel}</div>
            </div>`;

        if (hasPayments) {
            detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Versement ${periodLabel}</div>
                <div class="detail-value">${formatCurrency(data.regularPayment)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Total versé</div>
                <div class="detail-value">${formatCurrency(data.totalPayments)}</div>
            </div>`;
        }

        detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Gains totaux</div>
                <div class="detail-value">+${formatCurrency(data.totalGrowth)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Rendement</div>
                <div class="detail-value">+${data.totalGrowthPercent.toFixed(2)}%</div>
            </div>`;

        if (hasInflation) {
            detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Inflation annuelle</div>
                <div class="detail-value">${data.inflationRate.toFixed(2)}%</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Perte de pouvoir d'achat</div>
                <div class="detail-value">-${formatCurrency(data.finalValue - data.finalRealValue)}</div>
            </div>`;
        }

        resultDetails.innerHTML = detailsHTML;
    } else {
        // Mode reverse
        const hasInflation = data.inflationRate && data.inflationRate > 0;
        const valueDisplay = hasInflation
            ? `<div class="result-value">${data.growthRate.toFixed(4)}%</div>
               <div class="result-value-real">Taux réel: ${(data.growthRate - data.inflationRate).toFixed(4)}%</div>`
            : `<div class="result-value">${data.growthRate.toFixed(4)}%</div>`;

        resultMain.innerHTML = `
            ${valueDisplay}
            <div class="result-label">Taux de croissance nécessaire par ${periodLabel}</div>
        `;

        const hasPayments = data.regularPayment && data.regularPayment > 0;

        let detailsHTML = `
            <div class="detail-item">
                <div class="detail-label">Valeur de départ</div>
                <div class="detail-value">${formatCurrency(data.initialValue)}</div>
            </div>`;

        if (hasInflation) {
            detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Valeur cible (pouvoir d'achat)</div>
                <div class="detail-value">${formatCurrency(data.targetValue)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Valeur nominale à atteindre</div>
                <div class="detail-value">${formatCurrency(data.finalValue)}</div>
            </div>`;
        } else {
            detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Valeur cible</div>
                <div class="detail-value">${formatCurrency(data.finalValue)}</div>
            </div>`;
        }

        detailsHTML += ``;

        if (hasPayments) {
            detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Versement ${periodLabel}</div>
                <div class="detail-value">${formatCurrency(data.regularPayment)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Total versé</div>
                <div class="detail-value">${formatCurrency(data.totalPayments)}</div>
            </div>`;
        }

        detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Durée</div>
                <div class="detail-value">${data.duration} ${periodLabelPlural}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Gains totaux</div>
                <div class="detail-value">+${formatCurrency(data.totalGrowth)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Rendement</div>
                <div class="detail-value">+${data.totalGrowthPercent.toFixed(2)}%</div>
            </div>`;

        if (hasInflation) {
            detailsHTML += `
            <div class="detail-item">
                <div class="detail-label">Inflation annuelle</div>
                <div class="detail-value">${data.inflationRate.toFixed(2)}%</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Valeur réelle finale</div>
                <div class="detail-value">${formatCurrency(data.finalRealValue)}</div>
            </div>`;
        }

        resultDetails.innerHTML = detailsHTML;
    }

    // Afficher la timeline
    const hasInflation = data.inflationRate && data.inflationRate > 0;

    timeline.innerHTML = calculationResults.map((item, index) => {
        const periodName = index === 0 ? 'Départ' : `${periodLabel} ${index}`;
        const growthText = index > 0 ? `+${formatCurrency(item.growth)}` : '-';

        const realValueDisplay = hasInflation && item.realValue
            ? `<span class="timeline-real">${formatCurrency(item.realValue)} réel</span>`
            : '';

        return `
            <div class="timeline-item">
                <span class="timeline-period">${periodName}</span>
                <div class="timeline-values">
                    <span class="timeline-value">${formatCurrency(item.value)}</span>
                    ${realValueDisplay}
                </div>
                <span class="timeline-growth">${growthText}</span>
            </div>
        `;
    }).join('');

    resultsSection.classList.remove('hidden');
}

// Export CSV
exportCSVBtn.addEventListener('click', () => {
    if (calculationResults.length === 0) return;

    const headers = ['Période', 'Valeur', 'Croissance'];
    const rows = calculationResults.map((item, index) => {
        return [
            index,
            item.value.toFixed(2),
            item.growth.toFixed(2)
        ];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });

    downloadFile(csvContent, 'compound-effect.csv', 'text/csv');
});

// Export JSON
exportJSONBtn.addEventListener('click', () => {
    if (calculationResults.length === 0) return;

    const jsonContent = JSON.stringify(calculationResults, null, 2);
    downloadFile(jsonContent, 'compound-effect.json', 'application/json');
});

// Utilitaires
function getPeriodLabel(period, plural = false) {
    const labels = {
        week: plural ? 'semaines' : 'semaine',
        month: plural ? 'mois' : 'mois',
        year: plural ? 'années' : 'année'
    };
    return labels[period] || period;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
