// ===== Indus Canada CPA — Tax & Financial Calculators =====
// Note: figures use 2024 federal + Ontario brackets for illustration only.

const fmt = (n) => '$' + Math.max(0, Math.round(n)).toLocaleString('en-CA');
const fmtDec = (n) => '$' + Math.max(0, n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ===== Federal & Ontario brackets (2024 illustrative) =====
const FED_BRACKETS = [
    { upTo: 55867,   rate: 0.15  },
    { upTo: 111733,  rate: 0.205 },
    { upTo: 173205,  rate: 0.26  },
    { upTo: 246752,  rate: 0.29  },
    { upTo: Infinity, rate: 0.33 }
];
const ONT_BRACKETS = [
    { upTo: 51446,   rate: 0.0505 },
    { upTo: 102894,  rate: 0.0915 },
    { upTo: 150000,  rate: 0.1116 },
    { upTo: 220000,  rate: 0.1216 },
    { upTo: Infinity, rate: 0.1316 }
];
const FED_BPA = 15705;
const ON_BPA = 12399;

function applyBrackets(income, brackets) {
    let tax = 0, prev = 0;
    for (const b of brackets) {
        if (income <= prev) break;
        const taxable = Math.min(income, b.upTo) - prev;
        tax += taxable * b.rate;
        prev = b.upTo;
    }
    return tax;
}

// ===== Tab switching =====
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.calc-tab');
    const panels = document.querySelectorAll('.calc-panel');
    tabs.forEach(t => t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.remove('active'));
        panels.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        document.getElementById(t.dataset.target).classList.add('active');
    }));

    // Run all calculators initially
    runIncomeTax(); runHST(); runPayroll(); runMortgage(); runSavings(); runCorporate();

    // Re-run on input
    document.querySelectorAll('#panel-income input, #panel-income select').forEach(i => i.addEventListener('input', runIncomeTax));
    document.querySelectorAll('#panel-hst input, #panel-hst select').forEach(i => i.addEventListener('input', runHST));
    document.querySelectorAll('#panel-payroll input, #panel-payroll select').forEach(i => i.addEventListener('input', runPayroll));
    document.querySelectorAll('#panel-mortgage input').forEach(i => i.addEventListener('input', runMortgage));
    document.querySelectorAll('#panel-savings input').forEach(i => i.addEventListener('input', runSavings));
    document.querySelectorAll('#panel-corporate input, #panel-corporate select').forEach(i => i.addEventListener('input', runCorporate));
});

// ===== Income Tax =====
function runIncomeTax() {
    const income = +document.getElementById('it-income').value || 0;
    const rrsp = +document.getElementById('it-rrsp').value || 0;
    const taxable = Math.max(0, income - rrsp);

    const fedTax = Math.max(0, applyBrackets(taxable, FED_BRACKETS) - FED_BPA * 0.15);
    const onTax  = Math.max(0, applyBrackets(taxable, ONT_BRACKETS) - ON_BPA * 0.0505);
    const totalTax = fedTax + onTax;
    const afterTax = income - totalTax;
    const marginal = marginalRate(taxable);
    const effective = income > 0 ? (totalTax / income) * 100 : 0;

    document.getElementById('it-totalTax').textContent = fmt(totalTax);
    document.getElementById('it-fedTax').textContent = fmt(fedTax);
    document.getElementById('it-onTax').textContent = fmt(onTax);
    document.getElementById('it-afterTax').textContent = fmt(afterTax);
    document.getElementById('it-marginal').textContent = (marginal * 100).toFixed(1) + '%';
    document.getElementById('it-effective').textContent = effective.toFixed(1) + '%';
}
function marginalRate(income) {
    let f = 0.15, o = 0.0505;
    for (const b of FED_BRACKETS) if (income > (b.upTo === Infinity ? -1 : 0) && income <= b.upTo) { f = b.rate; break; }
    for (const b of ONT_BRACKETS) if (income > (b.upTo === Infinity ? -1 : 0) && income <= b.upTo) { o = b.rate; break; }
    // simple last-bracket if income exceeds all
    if (income > 246752) f = 0.33;
    if (income > 220000) o = 0.1316;
    return f + o;
}

// ===== HST =====
function runHST() {
    const amount = +document.getElementById('hst-amount').value || 0;
    const rate = +document.getElementById('hst-rate').value || 0.13;
    const direction = document.getElementById('hst-direction').value;
    let net, tax, total;
    if (direction === 'add') {
        net = amount;
        tax = amount * rate;
        total = amount + tax;
    } else {
        net = amount / (1 + rate);
        tax = amount - net;
        total = amount;
    }
    document.getElementById('hst-total').textContent = fmtDec(total);
    document.getElementById('hst-net').textContent = fmtDec(net);
    document.getElementById('hst-tax').textContent = fmtDec(tax);
    document.getElementById('hst-rateDisplay').textContent = (rate * 100).toFixed(0) + '%';
}

// ===== Payroll / Take-home =====
function runPayroll() {
    const gross = +document.getElementById('p-gross').value || 0;
    const freq = document.getElementById('p-freq').value;
    const periods = freq === 'weekly' ? 52 : freq === 'biweekly' ? 26 : freq === 'semimonthly' ? 24 : freq === 'monthly' ? 12 : 1;
    const annual = gross * periods;

    // Fed + ON tax
    const fedTax = Math.max(0, applyBrackets(annual, FED_BRACKETS) - FED_BPA * 0.15);
    const onTax  = Math.max(0, applyBrackets(annual, ONT_BRACKETS) - ON_BPA * 0.0505);

    // CPP (2024): 5.95% on earnings 3500-68500 + 4% on 68500-73200
    const cppBase = Math.max(0, Math.min(annual, 68500) - 3500);
    const cpp2 = Math.max(0, Math.min(annual, 73200) - 68500);
    const cpp = cppBase * 0.0595 + cpp2 * 0.04;

    // EI (2024): 1.66% on first 63200
    const ei = Math.min(annual, 63200) * 0.0166;

    const totalDed = fedTax + onTax + cpp + ei;
    const netAnnual = annual - totalDed;
    const netPerPeriod = netAnnual / periods;

    document.getElementById('p-net').textContent = fmt(netPerPeriod);
    document.getElementById('p-annual').textContent = fmt(netAnnual);
    document.getElementById('p-tax').textContent = fmt(fedTax + onTax);
    document.getElementById('p-cpp').textContent = fmt(cpp);
    document.getElementById('p-ei').textContent = fmt(ei);
}

// ===== Mortgage =====
function runMortgage() {
    const price = +document.getElementById('m-price').value || 0;
    const down = +document.getElementById('m-down').value || 0;
    const rate = (+document.getElementById('m-rate').value || 0) / 100;
    const years = +document.getElementById('m-years').value || 25;
    const principal = Math.max(0, price - down);
    const months = years * 12;
    // Canadian mortgages compound semi-annually but pay monthly
    const semiAnnual = Math.pow(1 + rate / 2, 2);
    const monthlyRate = Math.pow(semiAnnual, 1/12) - 1;
    const payment = monthlyRate > 0
        ? principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
        : principal / months;
    const totalPaid = payment * months;
    const totalInterest = totalPaid - principal;

    document.getElementById('m-payment').textContent = fmt(payment);
    document.getElementById('m-principal').textContent = fmt(principal);
    document.getElementById('m-interest').textContent = fmt(totalInterest);
    document.getElementById('m-total').textContent = fmt(totalPaid);
}

// ===== Savings / Investment =====
function runSavings() {
    const initial = +document.getElementById('s-initial').value || 0;
    const monthly = +document.getElementById('s-monthly').value || 0;
    const rate = (+document.getElementById('s-rate').value || 0) / 100;
    const years = +document.getElementById('s-years').value || 0;
    const monthlyRate = rate / 12;
    const months = years * 12;
    let balance = initial;
    for (let i = 0; i < months; i++) {
        balance = balance * (1 + monthlyRate) + monthly;
    }
    const contributions = initial + monthly * months;
    const interest = balance - contributions;
    document.getElementById('s-final').textContent = fmt(balance);
    document.getElementById('s-contrib').textContent = fmt(contributions);
    document.getElementById('s-interest').textContent = fmt(interest);
}

// ===== Corporate Tax =====
function runCorporate() {
    const income = +document.getElementById('c-income').value || 0;
    const type = document.getElementById('c-type').value; // ccpc-sb, ccpc-gen, gen
    let fedRate, onRate;
    if (type === 'ccpc-sb') { fedRate = 0.09;  onRate = 0.032; }      // small business
    else if (type === 'ccpc-gen') { fedRate = 0.15; onRate = 0.115; }  // general CCPC
    else { fedRate = 0.15; onRate = 0.115; }
    const fed = income * fedRate;
    const on = income * onRate;
    const total = fed + on;
    const after = income - total;
    document.getElementById('c-total').textContent = fmt(total);
    document.getElementById('c-fed').textContent = fmt(fed);
    document.getElementById('c-on').textContent = fmt(on);
    document.getElementById('c-after').textContent = fmt(after);
    document.getElementById('c-rate').textContent = ((fedRate + onRate) * 100).toFixed(2) + '%';
}
