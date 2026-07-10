// ===== Indus Canada CPA — Main JS =====

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const mqMobile = window.matchMedia('(max-width: 1024px)');
    if (toggle && navLinks) {
        const collapseDropdowns = () =>
            navLinks.querySelectorAll('.has-dropdown.open').forEach(d => d.classList.remove('open'));
        const closeMenu = () => {
            toggle.classList.remove('open');
            navLinks.classList.remove('open');
            collapseDropdowns();
        };
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            const isOpen = navLinks.classList.toggle('open');
            if (!isOpen) collapseDropdowns();
        });
        // On mobile the parent link acts as an accordion toggle instead of navigating
        navLinks.querySelectorAll('.has-dropdown > .dd-toggle').forEach(dd => {
            dd.addEventListener('click', (e) => {
                if (!mqMobile.matches) return;
                e.preventDefault();
                dd.closest('.has-dropdown').classList.toggle('open');
            });
        });
        // Any real navigation link closes the whole menu
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                if (mqMobile.matches && a.classList.contains('dd-toggle')) return;
                closeMenu();
            });
        });
    }

    // Sticky nav shadow
    const nav = document.querySelector('.nav');
    if (nav) {
        const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Simple counter animation for stats
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        let start = null;
        const counterObs = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            counterObs.disconnect();
            const step = (ts) => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                const value = (target * eased);
                const num = target % 1 === 0 ? Math.floor(value).toLocaleString('en-CA') : value.toFixed(1);
                el.textContent = num + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, { threshold: 0.4 });
        counterObs.observe(el);
    });

    // Contact form (demo)
    const cf = document.querySelector('#contact-form');
    if (cf) {
        cf.addEventListener('submit', (e) => {
            e.preventDefault();
            const note = cf.querySelector('.form-note');
            note.textContent = 'Thank you! Your message has been queued. We will contact you within 1 business day.';
            note.style.color = '#16a34a';
            cf.reset();
            setTimeout(() => { note.textContent = ''; }, 6000);
        });
    }

    // Year
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

    // Blog filters (blog list page)
    const filterBtns = document.querySelectorAll('.blog-filters button');
    if (filterBtns.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const f = btn.dataset.filter;
                document.querySelectorAll('.blog-card').forEach(c => {
                    c.style.display = (f === 'all' || c.dataset.cat === f) ? 'flex' : 'none';
                });
            });
        });
    }
});
