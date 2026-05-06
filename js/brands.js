// =====================================================
// Indus Canada CPA — Brand Marquee + Admin Panel
// =====================================================
// Supports two modes, switched automatically:
//
// 1. LOCAL MODE (default)
//    Brands persist in localStorage. Each browser sees
//    its own list. Good for demos or per-device testing.
//
// 2. SHARED MODE (Supabase)
//    Fill the BACKEND config below and brand changes
//    sync to a Supabase Postgres table — all visitors
//    see the same list.
//
// ---- HOW TO ENABLE SHARED MODE (5 min) -------------
//
// 1. Go to https://supabase.com  →  Sign up (free)
// 2. New Project  →  pick any name + region  →  generate
//    a strong DB password (you don't need to remember it)
// 3. Once the project is ready, open the SQL editor and
//    paste + RUN this:
//
//      create table if not exists brands (
//        id bigint generated always as identity primary key,
//        name text not null,
//        icon text not null default 'bi-building',
//        created_at timestamp with time zone default now()
//      );
//      alter table brands enable row level security;
//      create policy "public read"   on brands for select using (true);
//      create policy "public insert" on brands for insert with check (true);
//      create policy "public delete" on brands for delete using (true);
//
//    (Public read/write is fine for a brand-logo list.
//     Lock down with auth later if you need it.)
//
// 4. In Supabase: Project Settings → API
//      • copy "Project URL"  →  paste into BACKEND.url
//      • copy "anon public" key  →  paste into BACKEND.anonKey
//
// 5. Save this file & reload. The marquee will now sync
//    across every visitor.
// =====================================================

const BACKEND = {
    url:     '',  // e.g. 'https://abcdefgh.supabase.co'
    anonKey: ''   // the public anon key (safe to ship in client-side JS)
};

(function () {
    const BRANDS_KEY = 'indus_brands_v1';
    const AUTH_KEY   = 'indus_admin_auth';
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'indus2026';

    const DEFAULT_BRANDS = [
        { name: 'Sunridge Realty',     icon: 'bi-house-fill' },
        { name: 'Maple & Co.',         icon: 'bi-tree-fill' },
        { name: 'Northland Logistics', icon: 'bi-truck' },
        { name: 'Stellar Pharma',      icon: 'bi-heart-pulse-fill' },
        { name: 'Crescent Industries', icon: 'bi-gear-fill' },
        { name: 'Apex Construction',   icon: 'bi-building' },
        { name: 'BrightPath Academy',  icon: 'bi-mortarboard-fill' },
        { name: 'Cedar Hospitality',   icon: 'bi-cup-hot-fill' },
        { name: 'Heritage Capital',    icon: 'bi-bank2' },
        { name: 'NovaCare Clinics',    icon: 'bi-heart-pulse-fill' },
        { name: 'TechVentures',        icon: 'bi-cpu-fill' },
        { name: 'Indus Travel Co.',    icon: 'bi-airplane-fill' }
    ];

    // ============= Backend helpers =============
    const useBackend = () => Boolean(BACKEND.url && BACKEND.anonKey);
    const apiHeaders = () => ({
        apikey:        BACKEND.anonKey,
        Authorization: 'Bearer ' + BACKEND.anonKey,
        'Content-Type':'application/json',
        Prefer:        'return=representation'
    });

    async function backendFetchAll() {
        const res = await fetch(`${BACKEND.url}/rest/v1/brands?order=id.asc&select=id,name,icon`, {
            headers: apiHeaders()
        });
        if (!res.ok) throw new Error('Supabase GET ' + res.status);
        return await res.json();
    }
    async function backendInsert(brand) {
        const res = await fetch(`${BACKEND.url}/rest/v1/brands`, {
            method: 'POST',
            headers: apiHeaders(),
            body: JSON.stringify({ name: brand.name, icon: brand.icon })
        });
        if (!res.ok) throw new Error('Supabase POST ' + res.status);
        const arr = await res.json();
        return arr[0];
    }
    async function backendDelete(id) {
        if (!id) return;
        const res = await fetch(`${BACKEND.url}/rest/v1/brands?id=eq.${id}`, {
            method: 'DELETE',
            headers: apiHeaders()
        });
        if (!res.ok) throw new Error('Supabase DELETE ' + res.status);
    }
    async function backendSeedIfEmpty() {
        // On first ever load with backend mode, push the defaults so
        // fresh deployments don't show an empty marquee.
        const existing = await backendFetchAll();
        if (existing.length) return existing;
        for (const b of DEFAULT_BRANDS) {
            try { await backendInsert(b); } catch {}
        }
        return await backendFetchAll();
    }

    // ============= Local storage cache =============
    function readCache() {
        try {
            const raw = localStorage.getItem(BRANDS_KEY);
            if (!raw) return null;
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : null;
        } catch { return null; }
    }
    function writeCache(brands) {
        localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
    }
    // Synthetic id generator for local-only mode so the same
    // id-based remove() works in both modes.
    function nextLocalId(brands) {
        return brands.reduce((m, b) => Math.max(m, b.id || 0), 0) + 1;
    }

    // Single source of truth for the current render
    let brandsCache = readCache() || DEFAULT_BRANDS.map((b, i) => ({ id: i + 1, ...b }));

    function getBrands() { return brandsCache.slice(); }
    function setBrands(arr) {
        brandsCache = arr;
        writeCache(arr);
        renderMarquee();
        renderBrandList();
    }

    // Initial backend hydration (fire and forget)
    async function hydrateFromBackend() {
        if (!useBackend()) return;
        try {
            const arr = await backendSeedIfEmpty();
            if (Array.isArray(arr)) setBrands(arr);
        } catch (e) {
            console.warn('[brands] backend hydrate failed, using cache:', e.message);
        }
    }

    // ============= Add / Remove =============
    async function addBrand(name, icon) {
        const clean = { name: name.trim(), icon: icon || 'bi-building' };
        if (useBackend()) {
            try {
                const created = await backendInsert(clean);
                setBrands(brandsCache.concat(created));
                return;
            } catch (e) {
                alert('Could not save to backend — saved locally only. ' + e.message);
            }
        }
        // Local mode (or backend failed)
        const arr = brandsCache.slice();
        arr.push({ id: nextLocalId(arr), ...clean });
        setBrands(arr);
    }

    async function removeBrandById(id) {
        if (useBackend()) {
            try { await backendDelete(id); }
            catch (e) {
                alert('Could not delete on backend — removed locally only. ' + e.message);
            }
        }
        setBrands(brandsCache.filter(b => b.id !== id));
    }

    function resetBrands() {
        if (!confirm('Reset to default brand list? This will only clear your local copy — backend records remain unless removed individually.')) return;
        const fresh = DEFAULT_BRANDS.map((b, i) => ({ id: i + 1, ...b }));
        brandsCache = fresh;
        writeCache(fresh);
        renderMarquee(); renderBrandList();
    }

    // ============= Marquee =============
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function renderMarquee() {
        const track = document.getElementById('marquee-track');
        if (!track) return;
        const itemHtml = (b) => `
            <div class="brand-item">
                <i class="bi ${b.icon}"></i>
                <span>${escapeHtml(b.name)}</span>
            </div>`;
        track.innerHTML = brandsCache.map(itemHtml).join('') + brandsCache.map(itemHtml).join('');
        const seconds = Math.max(28, brandsCache.length * 3.2);
        track.style.animationDuration = seconds + 's';
    }

    // ============= Admin modal =============
    const $ = (id) => document.getElementById(id);
    function openModal() {
        const b = $('admin-backdrop');
        if (!b) return;
        b.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (localStorage.getItem(AUTH_KEY) === '1') showPanel();
        else showLogin();
    }
    function closeModal() {
        const b = $('admin-backdrop');
        if (!b) return;
        b.classList.remove('open');
        document.body.style.overflow = '';
        const err = $('login-error'); if (err) err.textContent = '';
    }
    function showLogin() {
        $('login-view').hidden = false;
        $('panel-view').hidden = true;
        setTimeout(() => $('login-user')?.focus(), 100);
    }
    function showPanel() {
        $('login-view').hidden = true;
        $('panel-view').hidden = false;
        renderBrandList();
        // Show a small status badge based on backend mode
        const head = document.querySelector('.admin-panel-head p');
        if (head) {
            head.textContent = useBackend()
                ? 'Connected to Supabase — changes sync across all visitors.'
                : 'Local mode — changes save in this browser only. See js/brands.js to enable shared sync.';
        }
    }
    function attemptLogin(u, p) {
        if (u === ADMIN_USER && p === ADMIN_PASS) {
            localStorage.setItem(AUTH_KEY, '1');
            return true;
        }
        return false;
    }
    function logout() {
        localStorage.removeItem(AUTH_KEY);
        showLogin();
    }

    function renderBrandList() {
        const list = $('brand-list');
        const count = $('brand-count');
        if (!list) return;
        list.innerHTML = brandsCache.map((b) => `
            <li class="brand-row">
                <i class="bi ${b.icon}"></i>
                <span>${escapeHtml(b.name)}</span>
                <button class="brand-del" data-id="${b.id}" aria-label="Remove ${escapeHtml(b.name)}">
                    <i class="bi bi-trash"></i>
                </button>
            </li>`).join('') + `
            <li class="brand-reset-row">
                <button class="brand-reset" id="brand-reset"><i class="bi bi-arrow-counterclockwise"></i> Reset to defaults</button>
                <span class="brand-mode">${useBackend() ? '☁ Synced' : '⚙ Local only'}</span>
            </li>`;
        if (count) count.textContent = brandsCache.length + ' total';

        list.querySelectorAll('.brand-del').forEach(btn => {
            btn.addEventListener('click', () => removeBrandById(+btn.dataset.id));
        });
        list.querySelector('#brand-reset')?.addEventListener('click', resetBrands);
    }

    // ============= Wire up =============
    function init() {
        renderMarquee();
        hydrateFromBackend();

        $('admin-trigger')?.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
        $('admin-close')?.addEventListener('click', closeModal);
        $('admin-backdrop')?.addEventListener('click', (e) => { if (e.target.id === 'admin-backdrop') closeModal(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && $('admin-backdrop')?.classList.contains('open')) closeModal();
        });

        $('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = $('login-user').value;
            const p = $('login-pass').value;
            const err = $('login-error');
            if (attemptLogin(u, p)) {
                err.textContent = '';
                showPanel();
                e.target.reset();
            } else {
                err.textContent = 'Incorrect username or password.';
            }
        });

        $('admin-logout')?.addEventListener('click', logout);

        $('brand-add-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = $('brand-name').value.trim();
            const icon = $('brand-icon').value;
            if (!name) return;
            const submitBtn = e.target.querySelector('button[type=submit]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding…';
            await addBrand(name, icon);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-plus-lg"></i> Add Brand';
            e.target.reset();
            $('brand-name').focus();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
