document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initFormValidation();
    initLeadForm();
    initImageSlider();
});

function initHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const navLinks = nav.querySelectorAll('.nav-link');
    
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    const sanitized = input
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:/gi, '')
        .trim();
    
    return sanitized;
}

function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function initFormValidation() {
    const form = document.getElementById('leadForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input:not([type="hidden"]), select');
    
    inputs.forEach(input => {
        if (input.id === 'website') return;
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.parentElement.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(field.id + 'Error');
    let isValid = true;
    let errorMessage = '';
    
    if (field.id === 'website') return true;
    
    if (field.required && !value) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Ingresa un correo electrónico válido';
        }
    } else if (field.id === 'telefono' && value) {
        const phoneRegex = /^[0-9\s\-\+\(\)]{10,20}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Ingresa un número de teléfono válido';
        }
    } else if (field.id === 'nombre' && value) {
        if (value.length < 2 || value.length > 100) {
            isValid = false;
            errorMessage = 'El nombre debe tener entre 2 y 100 caracteres';
        }
        if (/[<>\"\'\\]/.test(value)) {
            isValid = false;
            errorMessage = 'El nombre contiene caracteres no permitidos';
        }
    }
    
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
    
    if (isValid) {
        field.parentElement.classList.remove('error');
    } else {
        field.parentElement.classList.add('error');
    }
    
    return isValid;
}

function validateForm() {
    const form = document.getElementById('leadForm');
    if (!form) return false;
    
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value !== '') {
        console.log('Bot detectado: honeypot activado');
        return false;
    }
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function initLeadForm() {
    const form = document.getElementById('leadForm');
    if (!form) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (key === 'website') continue;
            data[key] = sanitizeInput(value);
        }
        
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loading').style.display = 'flex';
        
        setTimeout(() => {
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: 'Registro de descuento Esquimal',
                    content_category: 'Mascotas'
                });
            }
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'generate_lead', {
                    currency: 'MXN',
                    value: 1
                });
            }
            
            if (typeof ttq !== 'undefined') {
                ttq.track('Lead');
            }
            
            form.style.display = 'none';
            formSuccess.style.display = 'block';
            
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loading').style.display = 'none';
            
        }, 1500);
    });
}

document.addEventListener('scroll', function() {
    const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    if (typeof gtag !== 'undefined' && scrollPercent > 75) {
        gtag('event', 'scroll_depth', {
            percent_scrolled: Math.round(scrollPercent)
        });
    }
}, { passive: true });

function initImageSlider() {
    const slider = document.getElementById('imageSlider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    
    let currentSlide = 0;
    let slideInterval;
    const intervalTime = 5000;
    
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Ir a slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    
    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = index;
        
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    function startAutoPlay() {
        slideInterval = setInterval(nextSlide, intervalTime);
    }
    
    function stopAutoPlay() {
        clearInterval(slideInterval);
    }
    
    nextBtn.addEventListener('click', () => {
        stopAutoPlay();
        nextSlide();
        startAutoPlay();
    });
    
    prevBtn.addEventListener('click', () => {
        stopAutoPlay();
        prevSlide();
        startAutoPlay();
    });
    
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    
    startAutoPlay();
}
