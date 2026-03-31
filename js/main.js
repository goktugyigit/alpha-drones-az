/* ============================================
   ALPHA DRONES - JavaScript
   Modern Interactivity & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initTopHeader();
    initNavbar();
    initAOS();
    initCounterAnimation();
    initContactForm();
    initSmoothScroll();
    initScrollDownBtn();
    initDroneVideos();

    initLanguageSelector();
    initDropdownToggle();
    initMobileNavActions();
    initMobileMenu();
    initScrollToTop();
    initCallBtnDelay();
});

/* ============================================
   TOP HEADER - Hide on scroll, show at top
   ============================================ */
function initTopHeader() {
    const topHeader = document.getElementById('topHeader');
    const navbar = document.getElementById('mainNavbar');

    if (!topHeader || !navbar) return;

    const headerHeight = topHeader.offsetHeight;
    document.documentElement.style.setProperty('--top-header-h', headerHeight + 'px');

    window.addEventListener('resize', () => {
        if (!topHeader.classList.contains('hidden')) {
            document.documentElement.style.setProperty('--top-header-h', topHeader.offsetHeight + 'px');
        }
    });

    const handleScroll = () => {
        if (window.scrollY > 50) {
            topHeader.classList.add('hidden');
            navbar.classList.add('header-hidden');
            document.documentElement.style.setProperty('--top-header-h', '0px');
        } else {
            topHeader.classList.remove('hidden');
            navbar.classList.remove('header-hidden');
            document.documentElement.style.setProperty('--top-header-h', topHeader.offsetHeight + 'px');
        }
    };

    // İlk yüklemede transition'ı devre dışı bırak (sayfa geçişinde oynama olmasın)
    navbar.style.transition = 'none';
    topHeader.style.transition = 'none';
    handleScroll();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            navbar.style.transition = '';
            topHeader.style.transition = '';
        });
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/* ============================================
   NAVBAR SCROLL EFFECT
   ============================================ */
function initNavbar() {
    const navbar = document.getElementById('mainNavbar');

    if (!navbar) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    handleScroll();

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/* ============================================
   INITIALIZE AOS (Animate on Scroll)
   ============================================ */
function initAOS() {
    // Hero section elements: remove AOS (always in viewport, backdrop-filter needs no transform)
    // transform-based AOS creates stacking context which breaks backdrop-filter blur on hero-badge
    document.querySelectorAll('.hero-section [data-aos]').forEach(el => {
        el.removeAttribute('data-aos');
        el.removeAttribute('data-aos-duration');
        el.removeAttribute('data-aos-delay');
        el.classList.add('hero-animate');
    });

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            disable: 'mobile' // Disable on mobile for better performance
        });
    }
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    if (!counters.length) return;

    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        const easeOutQuad = (t) => t * (2 - t);

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuad(progress);
            const current = Math.floor(start + (target - start) * easedProgress);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    };

    // Intersection Observer for triggering animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    counters.forEach(counter => observer.observe(counter));
}

/* ============================================
   CONTACT FORM HANDLING
   ============================================ */
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (!form) return;

    // Auto-select service from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
        const serviceSelect = document.getElementById('service');
        if (serviceSelect) {
            const option = serviceSelect.querySelector(`option[value="${serviceParam}"]`);
            if (option) {
                serviceSelect.value = serviceParam;
                serviceSelect.dispatchEvent(new Event('change'));
            }
        }
    }

    // Message character counter + expand button
    const messageField = document.getElementById('message');
    if (messageField) {
        const floatingDiv = messageField.closest('.form-floating');
        const colDiv = floatingDiv.parentElement;

        const wrapper = document.createElement('div');
        wrapper.className = 'message-textarea-wrapper';
        colDiv.replaceChild(wrapper, floatingDiv);
        wrapper.appendChild(floatingDiv);

        const max = parseInt(messageField.getAttribute('maxlength')) || 1000;
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.textContent = `0 / ${max}`;
        wrapper.appendChild(counter);

        messageField.addEventListener('input', () => {
            const len = messageField.value.length;
            counter.textContent = `${len} / ${max}`;
            counter.classList.toggle('warn', len > max - 50);
        });

    }

    const lang = document.documentElement.lang || 'en';
    const i18n = {
        az: { sending: 'Göndərilir...', sent: 'Mesaj Göndərildi!', error: 'Xəta', successMsg: 'Təşəkkürlər! Mesajınız uğurla göndərildi. Ən qısa zamanda sizə geri dönəcəyik.', errorMsg: 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.', nameErr: 'Yalnız hərflər və boşluq daxil edin', emailErr: 'Düzgün e-poçt daxil edin (nümunə: ad@domain.com)', phoneErr: 'Düzgün telefon nömrəsi daxil edin (nümunə: +994 50 283 8777)' },
        tr: { sending: 'Gönderiliyor...', sent: 'Mesaj Gönderildi!', error: 'Hata', successMsg: 'Teşekkürler! Mesajınız başarıyla gönderildi. En kısa sürede size geri döneceğiz.', errorMsg: 'Bir hata oluştu. Lütfen tekrar deneyin.', nameErr: 'Yalnızca harf ve boşluk giriniz', emailErr: 'Geçerli bir e-posta giriniz (örnek: isim@domain.com)', phoneErr: 'Geçerli bir telefon numarası giriniz (örnek: +994 50 283 8777)' },
        en: { sending: 'Sending...', sent: 'Message Sent!', error: 'Error', successMsg: 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.', errorMsg: 'Oops! Something went wrong. Please try again.', nameErr: 'Only letters and spaces allowed', emailErr: 'Enter a valid email (example: name@domain.com)', phoneErr: 'Enter a valid phone number (example: +994 50 283 8777)' },
        ru: { sending: 'Отправка...', sent: 'Сообщение отправлено!', error: 'Ошибка', successMsg: 'Спасибо! Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.', errorMsg: 'Произошла ошибка. Пожалуйста, попробуйте ещё раз.', nameErr: 'Только буквы и пробелы', emailErr: 'Введите корректный e-mail (пример: имя@domain.com)', phoneErr: 'Введите корректный номер (пример: +994 50 283 8777)' }
    };
    const t = i18n[lang] || i18n.en;

    function showFieldError(field, msg) {
        clearFieldError(field);
        field.classList.add('is-invalid');
        const err = document.createElement('div');
        err.className = 'field-error-msg';
        err.textContent = msg;
        field.closest('.form-floating').appendChild(err);
    }

    function clearFieldError(field) {
        field.classList.remove('is-invalid');
        const existing = field.closest('.form-floating').querySelector('.field-error-msg');
        if (existing) existing.remove();
    }

    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');

    if (nameField) {
        nameField.addEventListener('input', () => {
            nameField.value = nameField.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿĀ-žÇçĞğİıÖöŞşÜüƏəАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя\s\-'\.]/g, '');
            clearFieldError(nameField);
        });
    }

    if (emailField) {
        emailField.addEventListener('input', () => clearFieldError(emailField));
    }

    if (phoneField) {
        phoneField.addEventListener('input', () => {
            phoneField.value = phoneField.value.replace(/[^\d\s\+\-\(\)]/g, '');
            clearFieldError(phoneField);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let hasError = false;

        const nameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿĀ-žÇçĞğİıÖöŞşÜüƏəАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя\s\-'\.]{2,}$/;
        if (nameField && !nameRegex.test(nameField.value.trim())) {
            showFieldError(nameField, t.nameErr);
            if (!hasError) nameField.focus();
            hasError = true;
        }

        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (emailField && !emailRegex.test(emailField.value.trim())) {
            showFieldError(emailField, t.emailErr);
            if (!hasError) emailField.focus();
            hasError = true;
        }

        if (phoneField && phoneField.value.trim() && !/^[\d\s\+\-\(\)]{7,30}$/.test(phoneField.value.trim())) {
            showFieldError(phoneField, t.phoneErr);
            if (!hasError) phoneField.focus();
            hasError = true;
        }

        if (hasError) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Lock button dimensions and border-radius so shape doesn't change
        submitBtn.style.minWidth = submitBtn.offsetWidth + 'px';
        submitBtn.style.minHeight = submitBtn.offsetHeight + 'px';
        submitBtn.style.borderRadius = getComputedStyle(submitBtn).borderRadius;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>' + t.sending;

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            service: document.getElementById('service').value,
            message: document.getElementById('message').value,
            lang: document.documentElement.lang || 'en'
        };

        // Collect service subfields
        const sfBox = document.getElementById('serviceSubfields');
        if (sfBox) {
            sfBox.querySelectorAll('[data-label]').forEach(function (el) {
                if (el.value && el.value.trim() !== '') {
                    const key = el.id.replace('sf_', '');
                    const map = {
                        btype: 'building_type', floors: 'floors',
                        area: 'area_size', purpose: 'survey_purpose',
                        btype2: 'inspection_building_type', itype: 'inspection_type',
                        otype: 'object_type', use: 'intended_use',
                        crop: 'crop_type', ha: 'area_ha',
                        scrop: 'spray_crop_type', sha: 'spray_area_ha', season: 'season',
                        freq: 'patrol_frequency', cam: 'camera_type',
                        stype: 'space_type', access: 'access_method'
                    };
                    if (map[key]) formData[map[key]] = el.value.trim();
                }
            });
        }

        // Get Turnstile token
        const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
        if (turnstileResponse) {
            formData['cf-turnstile-response'] = turnstileResponse.value;
        }

        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Server error');

            submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>' + t.sent;
            submitBtn.classList.remove('btn-primary-custom');
            submitBtn.classList.add('btn-success');

            form.reset();
            if (window.turnstile) turnstile.reset();

            showNotification(t.successMsg, 'success');

            // Reset button after delay
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.classList.remove('btn-success');
                submitBtn.classList.add('btn-primary-custom');
                submitBtn.disabled = false;
                submitBtn.style.minWidth = '';
                submitBtn.style.minHeight = '';
                submitBtn.style.borderRadius = '';
            }, 3000);

        } catch (error) {
            submitBtn.innerHTML = '<i class="bi bi-x-circle me-2"></i>' + t.error;
            submitBtn.classList.remove('btn-primary-custom');
            submitBtn.classList.add('btn-danger');

            showNotification(t.errorMsg, 'error');

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.classList.remove('btn-danger');
                submitBtn.classList.add('btn-primary-custom');
                submitBtn.disabled = false;
                submitBtn.style.minWidth = '';
                submitBtn.style.minHeight = '';
                submitBtn.style.borderRadius = '';
            }, 2000);
        }
    });
}

/* ============================================
   NOTIFICATION SYSTEM
   ============================================ */
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="bi bi-x"></i>
        </button>
    `;

    // Find submit button to place notification above it
    const submitBtn = document.querySelector('.contact-form-pro button[type="submit"]') ||
                      document.querySelector('.contact-form-card button[type="submit"]') ||
                      document.querySelector('#contactForm button[type="submit"]');

    if (submitBtn) {
        // Inline: insert above the submit button, match its width
        notification.style.cssText = `
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 16px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            width: ${submitBtn.offsetWidth}px;
            font-size: 0.85rem;
            margin-bottom: 12px;
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        `;
        submitBtn.parentElement.insertBefore(notification, submitBtn);
    } else {
        // Fallback: fixed centered at bottom
        notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            width: calc(100% - 32px);
            max-width: 400px;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    // Animate in
    requestAnimationFrame(() => {
        if (submitBtn) {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        } else {
            notification.style.transform = 'translateX(-50%) translateY(0)';
            notification.style.opacity = '1';
        }
    });

    // Auto remove
    setTimeout(() => {
        if (submitBtn) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(8px)';
        } else {
            notification.style.transform = 'translateX(-50%) translateY(100px)';
            notification.style.opacity = '0';
        }
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const navbarHeight = document.getElementById('mainNavbar')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   PARALLAX EFFECT (Optional Enhancement)
   ============================================ */
function initParallax() {
    const shapes = document.querySelectorAll('.hero-bg-shapes .shape');

    if (!shapes.length) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        shapes.forEach((shape, index) => {
            const speed = 0.1 * (index + 1);
            shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

/* ============================================
   BUTTON RIPPLE EFFECT
   ============================================ */
document.querySelectorAll('.btn-primary-custom').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

/* ============================================
   DRONE VIDEO PLAYER
   ============================================ */
function initDroneVideos() {
    document.querySelectorAll('.drone-video-wrapper').forEach(wrapper => {
        const video = wrapper.querySelector('.drone-video');
        const overlay = wrapper.querySelector('.drone-overlay');
        const controls = wrapper.querySelector('.drone-controls');
        const loader = wrapper.querySelector('.drone-loader');
        const playBtn = wrapper.querySelector('.drone-play-btn');
        const pauseBtn = wrapper.querySelector('.drone-pause-btn');
        const muteBtn = wrapper.querySelector('.drone-mute-btn');

        if (!video) return;

        let loaderTimer = null;

        function showLoaderDelayed() {
            clearTimeout(loaderTimer);
            loaderTimer = setTimeout(() => {
                if (loader) loader.classList.remove('hidden');
            }, 300);
        }

        function hideLoader() {
            clearTimeout(loaderTimer);
            if (loader) loader.classList.add('hidden');
        }

        // Play button
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (overlay) overlay.classList.add('hidden');
                showLoaderDelayed();
                video.muted = false;
                video.play();
            });
        }

        // Toggle play/pause
        function togglePlayPause() {
            const pauseIcon = pauseBtn ? pauseBtn.querySelector('i') : null;
            if (video.paused) {
                video.play();
                if (pauseIcon) pauseIcon.className = 'bi bi-pause-fill';
            } else {
                video.pause();
                if (pauseIcon) pauseIcon.className = 'bi bi-play-fill';
            }
        }

        // Pause button
        if (pauseBtn) {
            pauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlayPause();
            });
        }

        // Click anywhere on video
        video.style.cursor = 'pointer';
        video.addEventListener('click', () => togglePlayPause());

        // Mute button
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const icon = muteBtn.querySelector('i');
                video.muted = !video.muted;
                if (icon) icon.className = video.muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill';
            });
        }

        // Playing: cancel timer, hide loader, show controls
        video.addEventListener('playing', () => {
            hideLoader();
            if (controls) controls.classList.remove('hidden');
        });

        // Waiting/buffering: show loader after 300ms
        video.addEventListener('waiting', () => {
            showLoaderDelayed();
        });

        // Ended: restore thumbnail
        video.addEventListener('ended', () => {
            hideLoader();
            if (overlay) overlay.classList.remove('hidden');
            if (controls) controls.classList.add('hidden');
            const pauseIcon = pauseBtn ? pauseBtn.querySelector('i') : null;
            if (pauseIcon) pauseIcon.className = 'bi bi-pause-fill';
            video.currentTime = 0;
        });
    });
}

/* ============================================
   SERVICES DROPDOWN TOGGLE (Mobile)
   ============================================ */
function initDropdownToggle() {
    // Handled inside initMobileMenu now
}

/* ============================================
   LANGUAGE SELECTOR
   ============================================ */
function initLanguageSelector() {
    const langSelector = document.getElementById('langSelector');

    if (!langSelector) return;

    // Fix language links: replace language prefix in current path
    const currentPath = window.location.pathname;
    const langLinks = langSelector.querySelectorAll('.language-dropdown a[hreflang]');
    langLinks.forEach(link => {
        const targetLang = link.getAttribute('hreflang');
        if (currentPath === '/' || currentPath === '') {
            // Root path = AZ homepage, map to other language homepages
            link.setAttribute('href', targetLang === 'az' ? '/' : '/' + targetLang + '/');
        } else {
            // Replace /en/, /az/, /tr/, /ru/ prefix with target language
            const newPath = currentPath.replace(/^\/(en|az|tr|ru)(\/|$)/, '/' + targetLang + '$2');
            link.setAttribute('href', newPath);
        }
    });

    const langBtn = langSelector.querySelector('.language-btn');

    // Mobile toggle functionality
    if (langBtn) {
        langBtn.addEventListener('click', (e) => {
            if (window.innerWidth < 992) {
                e.preventDefault();
                langSelector.classList.toggle('open');
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!langSelector.contains(e.target)) {
            langSelector.classList.remove('open');
        }
    });

    // Close dropdown on language selection (mobile)
    const langLinksAll = langSelector.querySelectorAll('.language-dropdown a');
    langLinksAll.forEach(link => {
        link.addEventListener('click', () => {
            langSelector.classList.remove('open');
        });
    });
}

/* ============================================
   MOBILE NAV ACTIONS (contact + lang next to hamburger)
   ============================================ */
function initMobileNavActions() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;
    const container = navbar.querySelector('.container');
    const toggler = navbar.querySelector('.navbar-toggler');
    if (!container || !toggler) return;

    // Get existing contact button and language selector from inside collapse
    const contactBtn = navbar.querySelector('.navbar-buttons .btn-contact');
    const langSelector = navbar.querySelector('#langSelector');
    if (!contactBtn && !langSelector) return;

    // Create mobile actions wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'navbar-mobile-actions';

    // Contact button (small)
    if (contactBtn) {
        const mc = document.createElement('a');
        mc.href = contactBtn.href;
        mc.className = 'btn-contact-topbar';
        mc.textContent = contactBtn.textContent.trim();
        wrapper.appendChild(mc);
    }

    // Language button (small with dropdown)
    if (langSelector) {
        const origBtn = langSelector.querySelector('.language-btn');
        const origDropdown = langSelector.querySelector('.language-dropdown');
        if (origBtn && origDropdown) {
            const langWrap = document.createElement('div');
            langWrap.className = 'lang-topbar';

            const btn = document.createElement('button');
            btn.className = 'lang-topbar-btn';
            btn.type = 'button';
            const flagImg = origBtn.querySelector('.flag-icon');
            const codeSpan = origBtn.querySelector('span');
            if (flagImg) btn.appendChild(flagImg.cloneNode(true));
            if (codeSpan) {
                const s = document.createElement('span');
                s.textContent = codeSpan.textContent;
                btn.appendChild(s);
            }
            const chevron = document.createElement('i');
            chevron.className = 'bi bi-chevron-down';
            btn.appendChild(chevron);
            langWrap.appendChild(btn);

            const dropdown = origDropdown.cloneNode(true);
            dropdown.className = 'lang-topbar-dropdown';
            langWrap.appendChild(dropdown);

            // Fix hrefs (already fixed by initLanguageSelector)
            const origLinks = origDropdown.querySelectorAll('a[hreflang]');
            const newLinks = dropdown.querySelectorAll('a[hreflang]');
            origLinks.forEach((ol, i) => {
                if (newLinks[i]) newLinks[i].href = ol.href;
            });

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                langWrap.classList.toggle('open');
            });

            document.addEventListener('click', (e) => {
                if (!langWrap.contains(e.target)) {
                    langWrap.classList.remove('open');
                }
            });

            wrapper.appendChild(langWrap);
        }
    }

    container.insertBefore(wrapper, toggler);
}

/* ============================================
   SCROLL DOWN BUTTON
   ============================================ */
function initScrollDownBtn() {
    const btn = document.querySelector('.scroll-down-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const hero = btn.closest('.hero-section');
        if (!hero) return;
        let nextSection = hero.nextElementSibling;
        while (nextSection && nextSection.offsetHeight === 0) {
            nextSection = nextSection.nextElementSibling;
        }
        if (!nextSection) return;
        const navbarHeight = document.getElementById('mainNavbar')?.offsetHeight || 0;
        const targetPosition = nextSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
}

/* ============================================
   MOBILE MENU - Body scroll lock & link close
   ============================================ */
function initMobileMenu() {
    const navbarCollapse = document.getElementById('navbarNav');
    const toggler = document.querySelector('.navbar-toggler');
    if (!navbarCollapse || !toggler) return;

    // Destroy Bootstrap collapse - remove instance and all its event listeners
    toggler.removeAttribute('data-bs-toggle');
    toggler.removeAttribute('data-bs-target');
    const bsInstance = bootstrap.Collapse.getInstance(navbarCollapse);
    if (bsInstance) bsInstance.dispose();
    navbarCollapse.classList.remove('collapsing', 'show');
    navbarCollapse.classList.add('collapse');
    navbarCollapse.style.height = '';

    // Clone toggler to strip all Bootstrap event listeners
    const newToggler = toggler.cloneNode(true);
    toggler.parentNode.replaceChild(newToggler, toggler);

    let menuOpen = false;

    function openMenu() {
        menuOpen = true;
        navbarCollapse.classList.remove('collapse');
        navbarCollapse.classList.add('show');
        newToggler.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menuOpen = false;
        navbarCollapse.classList.remove('show');
        navbarCollapse.classList.add('collapse');
        newToggler.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        // Close any open dropdowns
        navbarCollapse.querySelectorAll('.nav-item.dropdown.open').forEach(d => d.classList.remove('open'));
    }

    // Hamburger toggle
    newToggler.addEventListener('click', () => {
        if (menuOpen) closeMenu(); else openMenu();
    });

    // Services dropdown toggle - click to open/close
    const dropdowns = navbarCollapse.querySelectorAll('.nav-item.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-link');
        if (!toggle) return;
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth < 992) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('open');
            }
        });
    });

    // Close menu only when clicking actual page links (not dropdown toggles)
    const pageLinks = navbarCollapse.querySelectorAll('.navbar-nav > .nav-item:not(.dropdown) > .nav-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) closeMenu();
        });
    });

    // Close menu when clicking service sub-page links
    const serviceLinks = navbarCollapse.querySelectorAll('.dropdown-menu-custom a');
    serviceLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) closeMenu();
        });
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992 && menuOpen) closeMenu();
    });
}

/* ============================================
   SCROLL TO TOP BUTTON
   ============================================ */
function initScrollToTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-to-top';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<i class="bi bi-chevron-up"></i>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero-section');
        const navbarHeight = document.getElementById('mainNavbar')?.offsetHeight || 0;
        const nextSection = hero ? hero.nextElementSibling : null;
        const threshold = nextSection
            ? nextSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight
            : 300;
        if (window.scrollY >= threshold) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ============================================
   CALL BUTTON - Delay tel: to show press animation
   ============================================ */
function initCallBtnDelay() {
    document.querySelectorAll('.mobile-call-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            this.classList.add('pressed');
            setTimeout(() => {
                this.classList.remove('pressed');
                window.location.href = href;
            }, 200);
        });
    });
}
