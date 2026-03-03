
// ── ANIMATED COUNTERS ──
function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1400;
    const start = performance.now();
    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = prefix + current + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.classList.add('counter-done');
    }
    requestAnimationFrame(step);
}

function initCounters() {
    const counters = document.querySelectorAll('.page-section.active .counter-num[data-target]');
    counters.forEach(el => {
        if (!el.dataset.animated) {
            el.dataset.animated = '1';
            // Use IntersectionObserver so it triggers on scroll
            const obs = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        animateCounter(el);
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.4 });
            obs.observe(el);
        }
    });
}
// Re-run on route changes
document.addEventListener('DOMContentLoaded', initCounters);
const _origInitReveal = typeof initReveal === 'function' ? initReveal : null;
let scrollAnimObserver;
let heroTypeTimer = null;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CONSENT_STORAGE_KEY = 'kintello-consent-v1';
const FORM_ENDPOINT_PLACEHOLDER = 'https://formspree.io/f/FORM_ID_EINFUEGEN';

function setHeroVisualState() {
    const hero = document.querySelector('#home .hero-kinetic');
    const home = document.getElementById('home');
    if (!hero || !home) return;
    hero.classList.toggle('hero-active', home.classList.contains('active'));
}

function startHeroTypewriter(forceRestart = false) {
    const line = document.getElementById('hero-typed-text');
    const subcopyLine = document.getElementById('hero-subcopy-text');
    const subcopyCaret = document.querySelector('.hero-subcopy-caret');
    const typedCaret = document.querySelector('.hero-typed-caret');
    const home = document.getElementById('home');
    if (!line || !home || !home.classList.contains('active')) return;
    if (document.body.classList.contains('intro-loading')) {
        line.textContent = '';
        line.dataset.typed = '0';
        if (typedCaret) typedCaret.classList.remove('done');
        return;
    }

    const text = line.dataset.text || '';
    if (!text) return;

    if (!forceRestart && line.dataset.typed === '1') return;

    clearTimeout(heroTypeTimer);
    line.textContent = '';
    line.dataset.typed = '0';
    if (typedCaret) typedCaret.classList.remove('done');
    if (subcopyLine) subcopyLine.textContent = subcopyLine.dataset.text || '';
    if (subcopyCaret) subcopyCaret.classList.add('done');

    const paintLine = (value) => {
        const match = value.match(/^[^\s,.;!?]+/);
        if (!match) {
            line.textContent = value;
            return;
        }

        const gradientWord = match[0];
        const rest = value.slice(gradientWord.length);
        line.textContent = '';

        const gradientSpan = document.createElement('span');
        gradientSpan.className = 'hero-typed-gradient-word';
        gradientSpan.textContent = gradientWord;

        line.appendChild(gradientSpan);
        line.appendChild(document.createTextNode(rest));
    };

    let index = 0;
    const tick = () => {
        if (!home.classList.contains('active')) return;

        paintLine(text.slice(0, index));
        index += 1;

        if (index <= text.length) {
            const speed = index < 5 ? 92 : 56;
            heroTypeTimer = setTimeout(tick, speed);
        } else {
            line.dataset.typed = '1';
            if (typedCaret) typedCaret.classList.add('done');
        }
    };

    heroTypeTimer = setTimeout(tick, 520);
}

function syncScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
}

function initScrollAnimations() {
    const activeSection = document.querySelector('.page-section.active') || document;
    const targets = activeSection.querySelectorAll('.reveal, .ref-card, .pillar-card, .staerke-card, .case-card, .team-card, .step-card-inner, .mock-screen, .faq-item');

    if (!('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('in-view'));
        return;
    }

    if (!scrollAnimObserver) {
        scrollAnimObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    scrollAnimObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    }

    let sequence = 0;
    targets.forEach(el => {
        if (el.dataset.saInit === '1') return;
        el.dataset.saInit = '1';
        el.classList.add('scroll-animate');
        el.style.setProperty('--sa-delay', `${Math.min(sequence * 45, 260)}ms`);
        scrollAnimObserver.observe(el);
        sequence += 1;
    });
}

function syncNavbarScrollState() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const scrollY = window.scrollY;
    const home = document.getElementById('home');
    const onHome = Boolean(home && home.classList.contains('active'));

    const homeHero = document.querySelector('#home .hero-kinetic');
    const useHeroNav = onHome && scrollY < 2;

    header.classList.toggle('nav-scrolled', !useHeroNav);
    header.classList.toggle('nav-top', useHeroNav);

    header.classList.remove('nav-hidden');

    if (homeHero && onHome) {
        const clampedShift = Math.min(scrollY * 0.36, 180);
        homeHero.style.setProperty('--hero-shift', `${clampedShift}px`);
    }

    syncScrollProgress();
}

window.addEventListener('scroll', syncNavbarScrollState, { passive: true });
window.addEventListener('load', syncNavbarScrollState);
window.addEventListener('load', initScrollAnimations);
window.addEventListener('load', () => {
    window.requestAnimationFrame(() => {
        if (window.location.hash === '' || window.location.hash === '#home') {
            window.scrollTo(0, 0);
        }
        syncNavbarScrollState();
    });
    setHeroVisualState();
});

// ── ROUTER ──
const router = {
    routes: ['home', 'it-services', 'ai-innovation', 'kintello-academy', 'ueber-uns', 'referenzen', 'kontakt', 'impressum', 'datenschutz'],
    current: 'home',

    init() {
        window.addEventListener('hashchange', () => this.handleRoute(false));
        this.handleRoute(true);
    },

    handleRoute(isInitialLoad = false) {
        let hash = window.location.hash.replace('#', '');
        if (!hash || !this.routes.includes(hash)) hash = 'home';
        this.current = hash;

        // Update sections
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(hash);
        if (target) target.classList.add('active');

        // Update nav styling
        this.updateNav(hash);

        // Update header appearance
        this.updateHeader(hash);

        // Scroll top only on in-app route changes, not on first load
        if (!isInitialLoad) {
            window.scrollTo(0, 0);
        }
        syncNavbarScrollState();
        syncScrollProgress();

        // Close mobile menu
        document.getElementById('mobile-menu').classList.remove('open');

        // Trigger reveal animations
        setTimeout(() => {
            initReveal();
            initCounters();
            initScrollAnimations();
            setHeroVisualState();
            startHeroTypewriter(true);
        }, 100);
    },

    navigate(path) {
        const clean = path.replace('#', '');
        if (clean === this.current) {
            // Already on this route — scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.location.hash = clean;
        }
    },

    updateNav(section) {
        const serviceSections = ['it-services', 'ai-innovation', 'kintello-academy'];
        const inServiceGroup = serviceSections.includes(section);
        const links = document.querySelectorAll('#desktop-nav .nav-link');
        links.forEach(link => {
            const s = link.getAttribute('data-section');
            link.classList.remove('nav-active-it', 'nav-active-ai', 'nav-active-acad', 'nav-active-default', 'font-semibold');
            link.style.color = '';

            if (s === section || (s === 'services' && inServiceGroup)) {
                link.classList.add('font-semibold');
                if (section === 'it-services') {
                    link.style.color = '#2185D7';
                } else if (section === 'ai-innovation') {
                    link.style.color = '#8B5CF6';
                } else if (section === 'kintello-academy') {
                    link.style.color = '#22C55E';
                } else {
                    link.style.color = '#0F172A';
                }
            }
        });

        const sublinks = document.querySelectorAll('#desktop-nav .nav-sublink');
        sublinks.forEach(link => {
            const s = link.getAttribute('data-section');
            link.classList.remove('nav-sublink-active');
            if (s === section) {
                link.classList.add('nav-sublink-active');
            }
        });
    },

    updateHeader(section) {
        const header = document.getElementById('site-header');
        const logo = document.getElementById('header-logo');
        // Reset
        header.style.borderBottomColor = '';

        if (section === 'it-services') {
            header.style.borderBottomColor = 'rgba(33,133,215,0.25)';
        } else if (section === 'ai-innovation') {
            header.style.borderBottomColor = 'rgba(139,92,246,0.25)';
        } else if (section === 'kintello-academy') {
            header.style.borderBottomColor = 'rgba(34,197,94,0.25)';
        }
    }
};

// ── MOBILE MENU ──
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('open');
});

// ── DESKTOP SERVICES DROPDOWN ──
const navDropdown = document.querySelector('#desktop-nav .nav-dropdown');
const servicesTrigger = navDropdown?.querySelector('.nav-services-trigger');

if (navDropdown && servicesTrigger) {
    servicesTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        const shouldOpen = !navDropdown.classList.contains('is-open');
        navDropdown.classList.toggle('is-open', shouldOpen);
        servicesTrigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    });

    navDropdown.addEventListener('mouseenter', () => {
        navDropdown.classList.add('is-open');
        servicesTrigger.setAttribute('aria-expanded', 'true');
    });

    navDropdown.addEventListener('mouseleave', () => {
        navDropdown.classList.remove('is-open');
        servicesTrigger.setAttribute('aria-expanded', 'false');
    });

    navDropdown.querySelectorAll('.nav-sublink').forEach(link => {
        link.addEventListener('click', () => {
            navDropdown.classList.remove('is-open');
            servicesTrigger.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', (event) => {
        if (!navDropdown.contains(event.target)) {
            navDropdown.classList.remove('is-open');
            servicesTrigger.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            navDropdown.classList.remove('is-open');
            servicesTrigger.setAttribute('aria-expanded', 'false');
        }
    });
}

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const chevron = btn.querySelector('.faq-chevron');
        const isOpen = answer.classList.contains('open');

        // Close all others
        document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
        document.querySelectorAll('.faq-chevron').forEach(c => c.classList.remove('open'));

        if (!isOpen) {
            answer.classList.add('open');
            chevron.classList.add('open');
        }
    });
});

// ── SCROLL REVEAL ──
function initReveal() {
    const elements = document.querySelectorAll('.page-section.active .reveal');
    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        elements.forEach(el => obs.observe(el));
    } else {
        elements.forEach(el => el.classList.add('visible'));
    }

    // ── STEP CARDS ANIMATION ──
    const stepsGrid = document.querySelector('#vorgehen-section #steps-grid');
    if (stepsGrid && document.getElementById('home').classList.contains('active')) {
        const stepObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate step cards
                    const cards = entry.target.querySelectorAll('.step-card');
                    cards.forEach((card, i) => {
                        setTimeout(() => card.classList.add('animate'), i * 130);
                    });
                    // Animate timeline line
                    const line = document.querySelector('.timeline-line');
                    if (line) setTimeout(() => line.classList.add('animate'), 100);
                    stepObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        stepObs.observe(stepsGrid);
    }
}

// ── BACK TO TOP BUTTON ──
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = window.scrollY / maxScroll;

        // Show button at 70% scroll depth
        if (scrollPercent > 0.7) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ── HERO MOUSE-REPEL EFFECT ──
function initHeroRepel() {
    if (!isFinePointer || prefersReducedMotion) return;
    const hero = document.querySelector('#home .hero-kinetic');
    if (!hero) return;

    // Only target dot-float elements (small and lightweight)
    const repelTargets = hero.querySelectorAll('.dot-float');
    if (!repelTargets.length) return;

    const state = { mx: -9999, my: -9999, active: false, raf: null };
    const elData = [];

    repelTargets.forEach(el => {
        elData.push({
            el,
            cx: 0, cy: 0,
            tx: 0, ty: 0,
            strength: 30,
            radius: 160,
            damping: 0.08 + Math.random() * 0.04
        });
    });

    function tick() {
        let needsUpdate = false;
        for (let i = 0; i < elData.length; i++) {
            const d = elData[i];
            if (!state.active) {
                d.tx = 0;
                d.ty = 0;
            } else {
                const rect = d.el.getBoundingClientRect();
                const dx = (rect.left + rect.width * 0.5) - state.mx;
                const dy = (rect.top + rect.height * 0.5) - state.my;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < d.radius && dist > 0) {
                    const force = (1 - dist / d.radius) * d.strength;
                    const angle = Math.atan2(dy, dx);
                    d.tx = Math.cos(angle) * force;
                    d.ty = Math.sin(angle) * force;
                } else {
                    d.tx = 0;
                    d.ty = 0;
                }
            }

            d.cx += (d.tx - d.cx) * d.damping;
            d.cy += (d.ty - d.cy) * d.damping;

            if (Math.abs(d.cx) > 0.1 || Math.abs(d.cy) > 0.1 ||
                Math.abs(d.tx - d.cx) > 0.1 || Math.abs(d.ty - d.cy) > 0.1) {
                needsUpdate = true;
            }

            d.el.style.transform = `translate(${d.cx}px, ${d.cy}px)`;
        }

        if (needsUpdate || state.active) {
            state.raf = requestAnimationFrame(tick);
        } else {
            state.raf = null;
            for (let i = 0; i < elData.length; i++) {
                elData[i].el.style.transform = '';
            }
        }
    }

    hero.addEventListener('mousemove', (e) => {
        state.mx = e.clientX;
        state.my = e.clientY;
        state.active = true;
        if (!state.raf) state.raf = requestAnimationFrame(tick);
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
        state.active = false;
        if (!state.raf) state.raf = requestAnimationFrame(tick);
    });
}

// ── CARD TILT EFFECT ──
function initCardTilt() {
    if (!isFinePointer || prefersReducedMotion) return;
    // Only apply to cards in the active section
    const activeSection = document.querySelector('.page-section.active');
    if (!activeSection) return;
    const cards = activeSection.querySelectorAll('.pillar-card, .staerke-card, .case-card, .ref-card');
    cards.forEach(card => {
        if (card.dataset.tiltInit) return;
        card.dataset.tiltInit = '1';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(600px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ── SMOOTH PARALLAX ON SCROLL ──
// Removed: parallax on hero shapes was causing unnecessary layout thrashing.
// The hero already has blob/float animations. Adding scroll-driven transforms
// on top of those creates GPU compositing conflicts.
function initParallax() { /* disabled for performance */ }

// ── MAGNETIC BUTTONS ──
function initMagneticButtons() {
    if (!isFinePointer || prefersReducedMotion) return;
    // Only apply to CTA buttons in the active section
    const activeSection = document.querySelector('.page-section.active');
    if (!activeSection) return;
    const btns = activeSection.querySelectorAll('.btn-gradient-animated, .chain-cta');
    btns.forEach(btn => {
        if (btn.dataset.magInit) return;
        btn.dataset.magInit = '1';

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width * 0.5;
            const y = e.clientY - rect.top - rect.height * 0.5;
            btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        }, { passive: true });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ── STAGGERED GRID REVEALS ──
function initStaggeredReveals() {
    const grids = document.querySelectorAll('.page-section.active .grid');
    grids.forEach(grid => {
        if (grid.dataset.staggerInit) return;
        grid.dataset.staggerInit = '1';

        const children = grid.children;
        Array.from(children).forEach((child, i) => {
            child.style.setProperty('--stagger-i', i);
        });
    });
}

// ── INTRO SCREEN DISMISS ──
function dismissIntro() {
    const intro = document.getElementById('intro-screen');
    if (!intro) return;
    intro.classList.add('intro-done');
    document.body.classList.remove('intro-loading');
    intro.addEventListener('animationend', () => {
        intro.style.display = 'none';
        setHeroVisualState();
        startHeroTypewriter(true);
    }, { once: true });
}

function getStoredConsent() {
    try {
        const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return null;
        return {
            necessary: true,
            functional: Boolean(parsed.functional),
            analytics: Boolean(parsed.analytics),
            marketing: Boolean(parsed.marketing),
            updatedAt: parsed.updatedAt || new Date().toISOString()
        };
    } catch {
        return null;
    }
}

function setStoredConsent(consent) {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        necessary: true,
        functional: Boolean(consent.functional),
        analytics: Boolean(consent.analytics),
        marketing: Boolean(consent.marketing),
        updatedAt: new Date().toISOString()
    }));
}

function readJsonConfig(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return null;
    try {
        return JSON.parse(element.textContent || '{}');
    } catch {
        return null;
    }
}

function loadTeamsChatIfAllowed(consent) {
    if (!consent?.functional) return;
    if (document.querySelector('script[data-teams-chat-loaded="1"]')) return;

    const configEl = document.getElementById('teams-chat-config');
    if (!configEl) return;

    let config;
    try {
        config = JSON.parse(configEl.textContent || '{}');
    } catch {
        return;
    }

    if (!config.src || !config.environmentId || !config.region) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = config.src;
    script.id = config.id || 'chatbot';
    script.setAttribute('environmentId', config.environmentId);
    script.setAttribute('region', config.region);
    if (config.crossorigin) script.setAttribute('crossorigin', config.crossorigin);
    script.dataset.teamsChatLoaded = '1';
    document.body.appendChild(script);
}

function loadAnalyticsIfAllowed(consent) {
    if (!consent?.analytics) return;
    if (window.__kintelloAnalyticsLoaded) return;

    const config = readJsonConfig('analytics-config');
    const measurementId = String(config?.measurementId || '').trim();
    if (!measurementId) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.analyticsLoaded = '1';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
        anonymize_ip: true,
        allow_google_signals: false,
        page_path: window.location.hash || '#home'
    });

    window.__kintelloAnalyticsLoaded = true;
}

function trackVirtualPageView() {
    const config = readJsonConfig('analytics-config');
    const measurementId = String(config?.measurementId || '').trim();
    if (!measurementId || typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
        page_path: window.location.hash || '#home',
        page_title: document.title
    });
}

function initConsentManager() {
    const banner = document.getElementById('cookie-banner');
    const modal = document.getElementById('cookie-modal');
    const settingsBtn = document.getElementById('cookie-settings-btn');
    if (!banner || !modal || !settingsBtn) return;

    const openModalBtns = document.querySelectorAll('[data-cookie-open-settings]');
    const acceptAllBtns = document.querySelectorAll('[data-cookie-accept-all]');
    const rejectOptionalBtns = document.querySelectorAll('[data-cookie-reject-optional]');
    const saveBtns = document.querySelectorAll('[data-cookie-save]');
    const functionalInput = document.getElementById('cookie-functional');
    const analyticsInput = document.getElementById('cookie-analytics');
    const marketingInput = document.getElementById('cookie-marketing');

    const syncForm = (consent) => {
        if (functionalInput) functionalInput.checked = Boolean(consent.functional);
        if (analyticsInput) analyticsInput.checked = Boolean(consent.analytics);
        if (marketingInput) marketingInput.checked = Boolean(consent.marketing);
    };

    const closeModal = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    };

    const openModal = () => {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    };

    const applyConsent = (consent) => {
        setStoredConsent(consent);
        syncForm(consent);
        banner.classList.remove('open');
        closeModal();
        loadTeamsChatIfAllowed(consent);
        loadAnalyticsIfAllowed(consent);
    };

    const current = getStoredConsent();
    if (current) {
        syncForm(current);
        banner.classList.remove('open');
        loadTeamsChatIfAllowed(current);
        loadAnalyticsIfAllowed(current);
    } else {
        banner.classList.add('open');
    }

    openModalBtns.forEach(btn => btn.addEventListener('click', openModal));
    settingsBtn.addEventListener('click', openModal);

    document.querySelectorAll('[data-cookie-close-modal]').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    acceptAllBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyConsent({ functional: true, analytics: true, marketing: true });
        });
    });

    rejectOptionalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyConsent({ functional: false, analytics: false, marketing: false });
        });
    });

    saveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyConsent({
                functional: Boolean(functionalInput?.checked),
                analytics: Boolean(analyticsInput?.checked),
                marketing: Boolean(marketingInput?.checked)
            });
        });
    });
}

function initContactForm() {
    const form = document.getElementById('kontakt-form');
    const statusEl = document.getElementById('kontakt-form-status');
    if (!form || !statusEl) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        const formConfig = readJsonConfig('form-service-config');
        const endpoint = String(formConfig?.endpoint || FORM_ENDPOINT_PLACEHOLDER).trim();

        const payload = {
            name: String(formData.get('name') || '').trim(),
            firma: String(formData.get('firma') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            nachricht: String(formData.get('nachricht') || '').trim(),
            datenschutz: formData.get('datenschutz') === 'on',
            website: String(formData.get('website') || '').trim()
        };

        if (!payload.name || !payload.firma || !payload.email || !payload.datenschutz) {
            statusEl.textContent = 'Bitte füllen Sie die Pflichtfelder aus und bestätigen Sie den Datenschutz.';
            statusEl.className = 'mt-4 text-sm text-red-600';
            return;
        }

        if (!endpoint || endpoint.includes('FORM_ID_EINFUEGEN')) {
            statusEl.textContent = 'Formular-Dienst ist noch nicht konfiguriert. Bitte Formspree-Endpunkt eintragen.';
            statusEl.className = 'mt-4 text-sm text-red-600';
            return;
        }

        statusEl.textContent = 'Nachricht wird gesendet...';
        statusEl.className = 'mt-4 text-sm text-slate-500';
        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: payload.name,
                    firma: payload.firma,
                    email: payload.email,
                    nachricht: payload.nachricht,
                    datenschutz: payload.datenschutz ? 'Ja' : 'Nein'
                })
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || 'Senden fehlgeschlagen.');
            }

            form.reset();
            statusEl.textContent = 'Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt.';
            statusEl.className = 'mt-4 text-sm text-emerald-600';
        } catch (error) {
            statusEl.textContent = error.message || 'Der Versand war nicht möglich. Bitte versuchen Sie es erneut.';
            statusEl.className = 'mt-4 text-sm text-red-600';
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// ── CASE SPOTLIGHT (Referenzen interactive) ──
function initCaseSpotlight() {
    const wrapper = document.querySelector('.case-spotlight');
    if (!wrapper || wrapper.dataset.spotlightInit) return;
    wrapper.dataset.spotlightInit = '1';

    const navItems = wrapper.querySelectorAll('.case-spotlight__item');
    const panels = wrapper.querySelectorAll('.case-spotlight__panel');

    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.dataset.case;

            // Update nav
            navItems.forEach(n => n.classList.remove('is-active'));
            btn.classList.add('is-active');

            // Update panels
            panels.forEach(p => {
                if (p.dataset.case === idx) {
                    p.classList.add('is-active');
                } else {
                    p.classList.remove('is-active');
                }
            });
        });
    });
}

// ── INIT ──
router.init();
setTimeout(() => initReveal(), 200);
initBackToTop();
initConsentManager();
initContactForm();

// Enhanced animation inits
window.addEventListener('load', () => {
    // Dismiss intro after dark intro animation completes
    setTimeout(dismissIntro, 2100);

    initHeroRepel();
    initCardTilt();
    initParallax();
    initMagneticButtons();
    initStaggeredReveals();
    initCaseSpotlight();
});

// Re-init on route change
const origHandleRoute = router.handleRoute.bind(router);
router.handleRoute = function (isInitialLoad) {
    origHandleRoute(isInitialLoad);
    trackVirtualPageView();
    setTimeout(() => {
        initCardTilt();
        initMagneticButtons();
        initStaggeredReveals();
        initCaseSpotlight();
    }, 200);
};
