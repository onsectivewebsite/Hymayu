// ===== Indus Canada CPA — AI Chatbot =====
(function() {
    const KB = [
        {
            keys: ['hour', 'open', 'close', 'time', 'when'],
            answer: "We're open Monday to Friday, 9:00am to 6:00pm. Closed weekends. You can also email us anytime at info@induscanadacpa.ca and we'll respond within 1 business day."
        },
        {
            keys: ['address', 'location', 'where', 'office', 'visit'],
            answer: "Our office is at Unit #17 A, 7033 Telford Way, Mississauga ON L5S 1V4. There's free parking on-site. Want directions? Visit our Contact page."
        },
        {
            keys: ['phone', 'call', 'number', 'contact'],
            answer: "Call us at +1 (647) 819-0663 during business hours, or email info@induscanadacpa.ca. For an in-person consultation, please book ahead."
        },
        {
            keys: ['price', 'cost', 'fee', 'how much', 'rate', 'quote'],
            answer: "Our fees depend on the scope of your work. Personal tax returns start from $80, bookkeeping packages from $250/month, and corporate returns from $700. I can connect you with our team for a no-obligation quote."
        },
        {
            keys: ['personal tax', 't1', 'income tax', 'individual'],
            answer: "We handle personal T1 returns including employment, self-employed, rental, capital gains, foreign income, and prior-year filings. We also maximize RRSP, TFSA, medical, and donation credits. Would you like to book a consultation?"
        },
        {
            keys: ['corporate', 'corporation', 't2', 'business tax'],
            answer: "We file T2 corporate returns, prepare compiled financial statements, and advise on tax-minimization through dividend vs salary planning, SR&ED, and CCPC small-business deductions."
        },
        {
            keys: ['hst', 'gst', 'sales tax'],
            answer: "We register, file, and represent you for HST/GST returns — including quick method elections, ITC reviews, new housing rebates, and CRA disputes. Try our HST calculator on the Calculators page!"
        },
        {
            keys: ['bookkeep', 'bookkeeping', 'quickbooks', 'xero'],
            answer: "Our bookkeeping team handles QuickBooks Online, Xero, and Sage cleanup, monthly close, payroll, AR/AP, and bank reconciliations. Reports are delivered within 10 days of month-end."
        },
        {
            keys: ['payroll', 'salary', 'employee'],
            answer: "We run full payroll for Ontario employers — direct deposits, T4s, ROEs, source deductions, and WSIB filings. Try our Payroll calculator to estimate net pay!"
        },
        {
            keys: ['cra', 'audit', 'review', 'reassessment', 'notice'],
            answer: "Got a CRA notice? Don't ignore it. We provide full CRA representation — audits, reviews, objections, taxpayer relief, and voluntary disclosures. Bring us the letter and we'll handle the rest."
        },
        {
            keys: ['incorporat', 'business start', 'set up company', 'register'],
            answer: "We help you incorporate federally or in Ontario, choose share structure, register HST/Payroll accounts, and set up bookkeeping from day one — typically within 5 business days."
        },
        {
            keys: ['real estate', 'property', 'rental', 'investment property'],
            answer: "We specialize in real estate tax — flipping rules, principal residence exemption, rental T776, GST/HST new-housing rebate, and non-resident sales (Section 116). A common one we save clients on: the new housing rebate."
        },
        {
            keys: ['non-resident', 'nonresident', 'foreign', 'international', 'abroad'],
            answer: "For non-residents we handle Section 216 rental returns, Section 217 elections, NR4/NR6 filings, departure tax, and property dispositions. Cross-border (US/Canada) is a specialty."
        },
        {
            keys: ['disability', 'dtc', 'disability tax credit'],
            answer: "We've helped many clients claim the Disability Tax Credit, often with retroactive refunds going back up to 10 years. We work with your physician to complete Form T2201."
        },
        {
            keys: ['not for profit', 'nonprofit', 'charity', 'charitable', 'np4'],
            answer: "We register charities, file T3010, prepare not-for-profit financial statements, and advise on donor receipting and CRA compliance for the charitable sector."
        },
        {
            keys: ['cfo', 'advisory', 'forecast', 'budget'],
            answer: "Our outsourced CFO service includes cash-flow forecasting, KPI dashboards, budget vs actual, and board-ready financial reporting — typically $1,500 - $3,500/month."
        },
        {
            keys: ['humayun', 'doctor', 'founder', 'owner', 'principal', 'professor'],
            answer: "Dr. Humayun Chaudhary is our founding principal — PhD (Tax) from Osgoode Hall, MBA, LLM, CPA Ontario, CPA USA, FCCA UK. He also teaches at Sheridan College and York University. Read his bio on the About page."
        },
        {
            keys: ['calculator', 'estimate', 'compute'],
            answer: "Yes! We have free calculators for income tax, HST/GST, payroll take-home, mortgage, savings growth, and corporate tax. Visit the Calculators page."
        },
        {
            keys: ['book', 'appointment', 'consult', 'meeting', 'schedule'],
            answer: "We offer free 30-minute discovery calls. Call +1 (647) 819-0663 or fill out the form on our Contact page and we'll reach out within 1 business day."
        },
        {
            keys: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
            answer: "Hi there! I'm Indus AI 👋 — I can help with questions about our accounting, tax, and advisory services. What would you like to know?"
        },
        {
            keys: ['thank', 'thanks', 'appreciate'],
            answer: "You're welcome! If you'd like one of our CPAs to reach out, just leave your number on the Contact page. Anything else I can help with?"
        }
    ];

    const SUGGESTIONS = [
        'Personal tax pricing',
        'Book a consultation',
        'Office hours',
        'CRA audit help',
        'Incorporate my business'
    ];

    function findAnswer(text) {
        const t = text.toLowerCase();
        let best = null, bestScore = 0;
        for (const item of KB) {
            const score = item.keys.reduce((s, k) => s + (t.includes(k) ? k.length : 0), 0);
            if (score > bestScore) { bestScore = score; best = item; }
        }
        if (best) return best.answer;
        return "Great question — let me connect you with our team. Please call +1 (647) 819-0663 or email info@induscanadacpa.ca and we'll respond within 1 business day. You can also describe what you're looking for and I'll point you to the right service.";
    }

    function init() {
        const fab = document.createElement('button');
        fab.className = 'chat-fab';
        fab.setAttribute('aria-label', 'Open chat');
        fab.innerHTML = '<i class="bi bi-chat-dots-fill"></i>';

        const win = document.createElement('div');
        win.className = 'chat-window';
        win.innerHTML = `
            <div class="chat-header">
                <div class="chat-avatar"><i class="bi bi-stars"></i></div>
                <div class="chat-title">
                    <strong>Indus AI Assistant</strong>
                    <span>Online · replies instantly</span>
                </div>
                <button class="chat-close" aria-label="Close chat"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="chat-body" id="chat-body"></div>
            <div class="chat-suggestions" id="chat-suggestions"></div>
            <form class="chat-input" id="chat-form">
                <input type="text" id="chat-input" placeholder="Ask about taxes, services, fees..." autocomplete="off" />
                <button type="submit" class="chat-send" aria-label="Send"><i class="bi bi-send-fill"></i></button>
            </form>
        `;

        document.body.appendChild(fab);
        document.body.appendChild(win);

        const body = win.querySelector('#chat-body');
        const sug = win.querySelector('#chat-suggestions');
        const form = win.querySelector('#chat-form');
        const input = win.querySelector('#chat-input');

        const greet = () => {
            addMsg("Hi there 👋 I'm Indus AI, your virtual accounting assistant. I can answer questions about our services, fees, calculators, or help you book a consultation. How can I help today?", 'bot');
            renderSuggestions();
        };

        function renderSuggestions() {
            sug.innerHTML = '';
            SUGGESTIONS.forEach(s => {
                const c = document.createElement('button');
                c.type = 'button';
                c.className = 'chat-chip';
                c.textContent = s;
                c.addEventListener('click', () => { input.value = s; submit(); });
                sug.appendChild(c);
            });
        }

        function addMsg(text, who) {
            const div = document.createElement('div');
            div.className = 'chat-msg ' + who;
            div.textContent = text;
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        }

        function showTyping() {
            const t = document.createElement('div');
            t.className = 'chat-typing';
            t.id = 'chat-typing';
            t.innerHTML = '<span></span><span></span><span></span>';
            body.appendChild(t);
            body.scrollTop = body.scrollHeight;
        }
        function hideTyping() {
            const t = document.getElementById('chat-typing');
            if (t) t.remove();
        }

        function submit() {
            const text = input.value.trim();
            if (!text) return;
            addMsg(text, 'user');
            input.value = '';
            sug.innerHTML = '';
            showTyping();
            setTimeout(() => {
                hideTyping();
                addMsg(findAnswer(text), 'bot');
                renderSuggestions();
            }, 700 + Math.random() * 600);
        }

        form.addEventListener('submit', (e) => { e.preventDefault(); submit(); });
        fab.addEventListener('click', () => {
            const opening = !win.classList.contains('open');
            win.classList.toggle('open');
            if (opening && body.children.length === 0) greet();
            if (opening) setTimeout(() => input.focus(), 350);
        });
        win.querySelector('.chat-close').addEventListener('click', () => win.classList.remove('open'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
