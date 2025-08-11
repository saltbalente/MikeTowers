// Main JavaScript for Spiritual Services Landing Page
// Optimized for Core Web Vitals and SEO

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize all app functionality
function initializeApp() {
    loadServicesSection();
    loadTestimonialsSection();
    loadGallerySection();
    loadLocationsSection();
    loadContactForm();
    loadFAQSection();
    initializeLazyLoading();
    initializeScrollEffects();
    initializePerformanceOptimizations();
}

// Load Services Section
function loadServicesSection() {
    const servicesGrid = document.getElementById('services-grid');
    if (!servicesGrid) return;
    
    const services = [
        {
            icon: '💕',
            title: 'Amarres de Amor Poderosos',
            description: 'Rituales efectivos para enamorar y reconquistar a tu pareja. Nuestros brujos expertos utilizan magia blanca para unir corazones.',
            keywords: 'amarres de amor, magia para enamorar, como reconquistar a tu pareja',
            service: 'Amarre de Amor'
        },
        {
            icon: '🔮',
            title: 'Limpias Espirituales',
            description: 'Purificación energética profunda para eliminar malas vibras, envidias y obstáculos en tu camino hacia el amor.',
            keywords: 'limpias espirituales, curanderos, purificación energética',
            service: 'Limpia Espiritual'
        },
        {
            icon: '🃏',
            title: 'Lectura de Cartas Gratis',
            description: 'Descubre tu futuro amoroso con nuestras lecturas de tarot. Primera consulta completamente gratis.',
            keywords: 'lectura de cartas gratis, quiero saber mi futuro gratis por internet, psíquicos en linea',
            service: 'Lectura de Cartas'
        },
        {
            icon: '🌟',
            title: 'Consultas Amorosas',
            description: 'Orientación espiritual personalizada para encontrar el amor verdadero y mantener relaciones duraderas.',
            keywords: 'consulta amorosa gratis, encontrar el amor, brujo gratis para hacer preguntas',
            service: 'Consulta Amorosa'
        }
    ];
    
    servicesGrid.className = 'services-grid';
    servicesGrid.innerHTML = services.map((service, index) => {
        const serviceTypes = ['amarres', 'limpias', 'tarot', 'consultas'];
        const serviceType = serviceTypes[index] || 'consultas';
        
        return `
            <div class="service-card fade-in-up" data-service="${serviceType}">
                <div class="service-content">
                    <span class="service-icon">${service.icon}</span>
                    <h3 class="service-title">${service.title}</h3>
                    <p class="service-description">${service.description}</p>
                    <p class="service-keywords">Especialidades: ${service.keywords}</p>
                    <button class="service-cta" onclick="sendWhatsApp('Cliente Interesado', '${service.service}', 'Hola, estoy interesado en ${service.service}. ¿Pueden darme más información?')">
                        Consultar por WhatsApp
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Load Testimonials Section
function loadTestimonialsSection() {
    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (!testimonialsGrid) return;
    
    const testimonials = [
        {
            quote: 'Gracias a los amarres de amor, pude reconquistar a mi pareja después de 6 meses separados. Los brujos de Catemaco realmente funcionan.',
            author: 'María González',
            location: 'Los Angeles, CA',
            service: 'Amarre de Amor',
            initial: 'M',
            backgroundImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=red%20candles%20heart%20shape%20love%20ritual%20romantic%20atmosphere%20rose%20petals%20mystical%20lighting&image_size=landscape_4_3'
        },
        {
            quote: 'La limpia espiritual cambió mi vida completamente. Encontré el amor verdadero después de años de mala suerte en las relaciones.',
            author: 'Carlos Rodríguez',
            location: 'Miami, FL',
            service: 'Limpia Espiritual',
            initial: 'C',
            backgroundImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=sage%20burning%20spiritual%20herbs%20palo%20santo%20cleansing%20ritual%20mystical%20smoke%20purification%20ceremony&image_size=landscape_4_3'
        },
        {
            quote: 'Las lecturas de cartas fueron increíblemente precisas. Me ayudaron a entender mi futuro amoroso y tomar las decisiones correctas.',
            author: 'Ana Martínez',
            location: 'Houston, TX',
            service: 'Lectura de Cartas',
            initial: 'A',
            backgroundImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=tarot%20cards%20spread%20mystical%20table%20candles%20crystal%20ball%20fortune%20telling%20divination%20spiritual%20reading&image_size=landscape_4_3'
        }
    ];
    
    testimonialsGrid.className = 'testimonials-grid';
    testimonialsGrid.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial-card fade-in-up" style="background-image: url('${testimonial.backgroundImage}'); background-size: cover; background-position: center; position: relative;">
            <div class="testimonial-overlay">
                <div class="testimonial-stars">⭐⭐⭐⭐⭐</div>
                <p class="testimonial-quote">"${testimonial.quote}"</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">${testimonial.initial}</div>
                    <div class="testimonial-info">
                        <h3>${testimonial.author}</h3>
                        <p>${testimonial.location} - ${testimonial.service}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load Gallery Section
function loadGallerySection() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    const galleryImages = [
        {
            src: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=spiritual%20altar%20with%20candles%20crystals%20tarot%20cards%20mystical%20atmosphere%20warm%20lighting%20realistic%20photography&image_size=square_hd',
            alt: 'Altar espiritual real con velas rojas, cristales y cartas del tarot para amarres de amor poderosos - Brujos de Catemaco',
            title: 'Altar Espiritual Completo',
            description: 'Altar preparado con velas rojas, cristales y elementos sagrados para rituales de amor poderosos'
        },
        {
            src: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=red%20candles%20heart%20shape%20love%20ritual%20romantic%20atmosphere%20rose%20petals%20mystical%20lighting&image_size=square_hd',
            alt: 'Velas rojas en forma de corazón con pétalos de rosa para amarres de amor efectivos - Magia para enamorar',
            title: 'Ritual de Velas Rojas',
            description: 'Velas dispuestas en forma de corazón con pétalos de rosa para amarres de amor efectivos'
        },
        {
            src: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=elaborate%20red%20altar%20multiple%20candles%20spiritual%20objects%20love%20magic%20ritual%20setup%20mystical%20atmosphere&image_size=square_hd',
            alt: 'Altar rojo elaborado con múltiples velas para magia amorosa y hechizos de amor - Brujos expertos',
            title: 'Altar de Magia Amorosa',
            description: 'Altar elaborado con múltiples velas rojas y objetos espirituales para trabajos de amor intensos'
        },
        {
            src: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=red%20candle%20with%20roses%20romantic%20ritual%20setup%20intimate%20lighting%20love%20spell%20atmosphere&image_size=square_hd',
            alt: 'Vela roja ceremonial con rosas para hechizos de amor y reconquistar pareja - Rituales efectivos',
            title: 'Hechizo con Vela y Rosas',
            description: 'Vela roja ceremonial rodeada de rosas para hechizos de amor y reconquista'
        },
        {
            src: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=heart%20shaped%20candles%20rose%20petals%20romantic%20love%20ritual%20warm%20lighting%20spiritual%20ceremony&image_size=square_hd',
            alt: 'Corazón de velas sagradas con pétalos de rosa para rituales de amor verdadero - Encontrar el amor',
            title: 'Corazón de Velas Sagradas',
            description: 'Corazón formado por velas y pétalos de rosa para rituales de amor verdadero'
        }
    ];
    
    galleryGrid.className = 'gallery-grid';
    galleryGrid.innerHTML = galleryImages.map((image, index) => `
        <div class="gallery-item fade-in-up" data-index="${index}">
            <div class="gallery-image-container">
                <img src="${image.src}" alt="${image.alt}" class="gallery-image lazy-load" loading="lazy" decoding="async">
                <div class="gallery-overlay">
                    <h3 class="gallery-title">${image.title}</h3>
                    <p class="gallery-description">${image.description}</p>
                    <button class="gallery-cta" onclick="sendWhatsApp('Cliente Interesado en Rituales', 'Consulta sobre ${image.title}', 'Hola, vi la imagen de ${image.title} en su galería. ¿Pueden darme más información sobre este tipo de ritual?')">
                        Consultar este Ritual
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load Locations Section
function loadLocationsSection() {
    const locationsGrid = document.getElementById('locations-grid');
    if (!locationsGrid) return;
    
    const locations = [
        { city: 'Los Angeles', state: 'California', size: 'large' },
        { city: 'Miami', state: 'Florida', size: 'medium' },
        { city: 'Houston', state: 'Texas', size: 'large' },
        { city: 'Phoenix', state: 'Arizona', size: 'small' },
        { city: 'New York', state: 'New York', size: 'extra-large' },
        { city: 'California', state: '', size: 'medium' },
        { city: 'Florida', state: '', size: 'small' },
        { city: 'Texas', state: '', size: 'medium' },
        { city: 'Arizona', state: '', size: 'small' }
    ];
    
    locationsGrid.className = 'word-cloud-container';
    locationsGrid.innerHTML = `
        <div class="word-cloud">
            ${locations.map((location, index) => {
                const word = location.state ? `${location.city} ${location.state}` : location.city;
                const delay = Math.random() * 2;
                return `
                    <span class="cloud-word ${location.size}" 
                          style="animation-delay: ${delay}s;"
                          onclick="sendWhatsApp('Cliente interesado', 'Consulta Local', 'Hola, estoy interesado en sus servicios en ${word}. ¿Tienen disponibilidad?')">
                        ${word}
                    </span>
                `;
            }).join('')}
        </div>
        <div class="locations-cta">
            <button class="main-location-cta" onclick="sendWhatsApp('Cliente', 'Consulta General', 'Hola, me gustaría saber más sobre sus servicios espirituales. ¿Pueden ayudarme?')">
                Contactar Ahora 💬
            </button>
        </div>
    `;
}

// Load Contact Form
function loadContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.innerHTML = `
        <div class="contact-form">
            <h3 style="text-align: center; margin-bottom: 2rem; font-size: 1.8rem;">Consulta Amorosa Gratis</h3>
            <p style="text-align: center; margin-bottom: 2rem; opacity: 0.9;">Completa el formulario y te contactaremos por WhatsApp para tu consulta gratuita</p>
            
            <form id="whatsapp-form" onsubmit="submitWhatsAppForm(event)">
                <div class="form-group">
                    <label for="name">Nombre Completo</label>
                    <input type="text" id="name" name="name" placeholder="Tu nombre completo" required>
                </div>
                
                <div class="form-group">
                    <label for="situation">Describe tu Situación</label>
                    <textarea id="situation" name="situation" rows="4" placeholder="Cuéntanos brevemente tu situación amorosa..." required></textarea>
                </div>
                
                <button type="submit" class="form-submit">
                    Enviar Consulta por WhatsApp 💬
                </button>
            </form>
        </div>
    `;
}

// Load FAQ Section
function loadFAQSection() {
    const faqContent = document.getElementById('faq-content');
    if (!faqContent) return;
    
    const faqs = [
        {
            question: '¿Los amarres de amor realmente funcionan?',
            answer: 'Sí, nuestros amarres de amor han ayudado a miles de personas a reconquistar a sus parejas. Utilizamos rituales ancestrales y magia blanca efectiva.'
        },
        {
            question: '¿Dónde puedo encontrar brujos cerca de mi?',
            answer: 'Tenemos brujos expertos en Los Angeles, Miami, Houston, Phoenix y New York. También ofrecemos consultas virtuales para todo Estados Unidos.'
        },
        {
            question: '¿La consulta amorosa es realmente gratis?',
            answer: 'Sí, la primera consulta es completamente gratuita. Te ayudamos a entender tu situación y te recomendamos el mejor ritual para tu caso.'
        },
        {
            question: '¿Qué incluyen las limpias espirituales?',
            answer: 'Las limpias espirituales incluyen purificación energética, eliminación de malas vibras, protección contra envidias y apertura de caminos para el amor.'
        },
        {
            question: '¿Cuánto tiempo tardan en hacer efecto los hechizos?',
            answer: 'Los resultados pueden verse entre 7 a 21 días, dependiendo de la situación específica y la energía de las personas involucradas.'
        },
        {
            question: '¿Trabajan con brujos de Catemaco?',
            answer: 'Sí, trabajamos con auténticos brujos de Catemaco y curanderos tradicionales que mantienen las prácticas ancestrales mexicanas.'
        }
    ];
    
    faqContent.innerHTML = `
        <div class="faq-container">
            ${faqs.map((faq, index) => `
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFAQ(${index})">
                        <span>${faq.question}</span>
                        <span class="faq-icon">▼</span>
                    </button>
                    <div class="faq-answer" id="faq-answer-${index}">
                        <p>${faq.answer}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// WhatsApp Functions
function sendWhatsApp(name, service, message) {
    const phone = "14133912149";
    const text = `Hola, soy ${name}. Estoy interesado en ${service}. ${message}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    
    // Track event for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
            'event_category': 'engagement',
            'event_label': service
        });
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
}

function submitWhatsAppForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const situation = formData.get('situation');
    
    const message = `
Nombre: ${name}
Situación: ${situation}

¡Espero su respuesta para mi consulta amorosa gratis!`;
    
    sendWhatsApp(name, 'Consulta Amorosa Gratis', message);
    
    // Show success message
    showNotification('¡Formulario enviado! Te contactaremos por WhatsApp pronto.', 'success');
    
    // Reset form
    event.target.reset();
}

// FAQ Toggle Function
function toggleFAQ(index) {
    const question = document.querySelector(`#faq-content .faq-item:nth-child(${index + 1}) .faq-question`);
    const answer = document.getElementById(`faq-answer-${index}`);
    const icon = question.querySelector('.faq-icon');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-question').forEach((q, i) => {
        if (i !== index) {
            q.classList.remove('active');
            document.getElementById(`faq-answer-${i}`).classList.remove('active');
        }
    });
    
    // Toggle current FAQ
    question.classList.toggle('active');
    answer.classList.toggle('active');
}

// Lazy Loading Implementation
function initializeLazyLoading() {
    const lazyElements = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window) {
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        lazyElements.forEach(element => {
            lazyObserver.observe(element);
        });
    } else {
        // Fallback for older browsers
        lazyElements.forEach(element => {
            element.classList.add('loaded');
        });
    }
}

// Scroll Effects
function initializeScrollEffects() {
    const animatedElements = document.querySelectorAll('.fade-in-up');
    
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = `${Math.random() * 0.3}s`;
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1
        });
        
        animatedElements.forEach(element => {
            animationObserver.observe(element);
        });
    }
}



// Performance Optimizations
function initializePerformanceOptimizations() {
    // Preload critical resources
    const criticalImages = [
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mystical%20spiritual%20candles%20crystals%20love%20ritual%20purple%20golden%20background%20realistic%20photography&image_size=landscape_16_9'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
    
    // Optimize images loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
    });
    
    // Service Worker registration for caching
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : '#6B46C1'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Track errors for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            'description': e.error.toString(),
            'fatal': false
        });
    }
});

// Performance monitoring
window.addEventListener('load', function() {
    // Measure Core Web Vitals
    if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
            let clsValue = 0;
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }
});