/* ===== CLUBE DE BENEFÍCIOS AUTO VALE - Marketplace ===== */
(function() {
    'use strict';

    // Dados mockados dos parceiros
    var partners = [
        { id:1, name:"Auto Posto São Jorge", category:"postos", city:"Linhares - ES", distance:"1.2 km", discount:5, points:10, rating:4.8, logo:"⛽", description:"Combustível de qualidade", fullDescription:"Posto de combustível com bandeira premium, oferecendo gasolina aditivada, etanol e diesel S-10. Programa de fidelidade exclusivo para associados Auto Vale com acúmulo de pontos em cada abastecimento.", phone:"(27) 3264-1234", whatsapp:"(27) 99812-3456", address:"Av. Augusto Pestana, 1250 - Centro, Linhares - ES" },
        { id:2, name:"Lava Jato Premium", category:"lava-jato", city:"Linhares - ES", distance:"2.5 km", discount:15, points:20, rating:4.6, logo:"🚿", description:"Lavagem completa", fullDescription:"Lava jato especializado com lavagem interna e externa completa, higienização de estofados, polimento express e enceramento. Produtos biodegradáveis e reaproveitamento de água.", phone:"(27) 3264-5678", whatsapp:"(27) 99834-5678", address:"Rua Gov. Santos Neves, 450 - Movelar, Linhares - ES" },
        { id:3, name:"Mecânica Central", category:"mecanica", city:"Linhares - ES", distance:"3.1 km", discount:10, points:30, rating:4.9, logo:"🔧", description:"Mecânica especializada", fullDescription:"Oficina mecânica com profissionais certificados, atendendo todas as marcas. Diagnóstico computadorizado, revisão completa, suspensão, freios e motor. Garantia de serviço de 90 dias.", phone:"(27) 3264-9012", whatsapp:"(27) 99856-7890", address:"Rua Rufino de Carvalho, 320 - Centro, Linhares - ES" },
        { id:4, name:"Estética Car Pro", category:"estetica", city:"Linhares - ES", distance:"1.8 km", discount:20, points:25, rating:4.7, logo:"✨", description:"Polimento e cristalização", fullDescription:"Centro de estética automotiva premium. Serviços de polimento técnico, cristalização de pintura, vitrificação, PPF (película protetora), envelopamento e detalhamento interno completo.", phone:"(27) 3264-3456", whatsapp:"(27) 99878-1234", address:"Av. João Felipe Calmon, 890 - Shell, Linhares - ES" },
        { id:5, name:"Pneus & Cia", category:"pneus", city:"Linhares - ES", distance:"4.2 km", discount:12, points:40, rating:4.5, logo:"🛞", description:"Todas as marcas", fullDescription:"Loja especializada em pneus das melhores marcas: Michelin, Pirelli, Continental, Goodyear e Bridgestone. Alinhamento 3D, balanceamento computadorizado e cambagem.", phone:"(27) 3264-7890", whatsapp:"(27) 99890-2345", address:"Rod. ES-010, Km 3 - Interlagos, Linhares - ES" },
        { id:6, name:"Auto Elétrica Rápida", category:"eletrica", city:"Linhares - ES", distance:"2.0 km", discount:8, points:15, rating:4.4, logo:"⚡", description:"Diagnóstico computadorizado", fullDescription:"Auto elétrica com equipamentos de última geração para diagnóstico e reparo de sistemas elétricos e eletrônicos. Instalação de acessórios, alarmes, som automotivo e rastreadores.", phone:"(27) 3264-2345", whatsapp:"(27) 99812-6789", address:"Rua Augusto Luciano, 156 - Aviso, Linhares - ES" },
        { id:7, name:"Borracharia 24h", category:"borracharia", city:"Linhares - ES", distance:"0.8 km", discount:10, points:10, rating:4.3, logo:"🔩", description:"Atendimento 24 horas", fullDescription:"Borracharia com atendimento 24 horas, 7 dias por semana. Socorro na estrada, troca de pneus, conserto de furos, calibragem e rodízio. Atendimento rápido e profissional.", phone:"(27) 3264-6789", whatsapp:"(27) 99834-0123", address:"Rua Principal, 45 - Centro, Linhares - ES" },
        { id:8, name:"Guincho Express", category:"guincho", city:"Linhares - ES", distance:"5.0 km", discount:15, points:50, rating:4.8, logo:"🚗", description:"Guincho e reboque", fullDescription:"Serviço de guincho e reboque 24h com cobertura em toda região de Linhares e municípios vizinhos. Plataforma hidráulica para veículos leves e pesados. Tempo médio de chegada: 30 minutos.", phone:"(27) 3264-0123", whatsapp:"(27) 99856-4567", address:"Av. Industrial, 2200 - Distrito Industrial, Linhares - ES" },
        { id:9, name:"Restaurante Sabor Mineiro", category:"alimentacao", city:"Linhares - ES", distance:"1.5 km", discount:10, points:5, rating:4.6, logo:"🍔", description:"Almoço executivo", fullDescription:"Restaurante com comida caseira mineira de qualidade. Self-service no almoço com mais de 40 pratos, incluindo opções vegetarianas. Marmitex para viagem e delivery na região central.", phone:"(27) 3264-4567", whatsapp:"(27) 99878-5678", address:"Rua Dr. Abelardo, 78 - Centro, Linhares - ES" },
        { id:10, name:"Farmácia Saúde+", category:"saude", city:"Linhares - ES", distance:"0.5 km", discount:8, points:5, rating:4.7, logo:"🏥", description:"Medicamentos e bem-estar", fullDescription:"Farmácia completa com medicamentos, produtos de higiene, beleza e bem-estar. Atendimento farmacêutico personalizado, aferição de pressão, testes rápidos e aplicação de injetáveis.", phone:"(27) 3264-8901", whatsapp:"(27) 99890-6789", address:"Av. Beira Rio, 320 - Centro, Linhares - ES" },
        { id:11, name:"Auto Escola Dirigir Bem", category:"educacao", city:"Linhares - ES", distance:"3.5 km", discount:25, points:100, rating:4.9, logo:"📚", description:"Cursos de direção defensiva", fullDescription:"Auto escola credenciada pelo DETRAN-ES. Cursos de primeira habilitação, reciclagem, direção defensiva e curso para condutores de veículos de emergência. Simulador de direção moderno.", phone:"(27) 3264-5432", whatsapp:"(27) 99812-8901", address:"Rua Castelo Branco, 560 - Colina, Linhares - ES" },
        { id:12, name:"Posto Shell Av. Brasil", category:"postos", city:"Linhares - ES", distance:"2.8 km", discount:3, points:8, rating:4.5, logo:"⛽", description:"Promoção combustível aditivado", fullDescription:"Posto bandeira Shell com combustível V-Power de alta performance. Loja de conveniência Select 24h, calibragem gratuita e programa Shell Box com cashback para associados.", phone:"(27) 3264-6543", whatsapp:"(27) 99834-2345", address:"Av. Brasil, 1800 - Araçás, Linhares - ES" }
    ];

    // Mapeamento de categorias para nomes legíveis
    var categoryNames = {
        'postos': 'Postos de Combustível',
        'lava-jato': 'Lava-Jatos',
        'mecanica': 'Mecânicas',
        'estetica': 'Estética Automotiva',
        'pneus': 'Pneus e Rodas',
        'eletrica': 'Auto Elétricas',
        'borracharia': 'Borracharias',
        'guincho': 'Guincho e Reboque',
        'alimentacao': 'Alimentação',
        'saude': 'Saúde e Bem-estar',
        'educacao': 'Educação'
    };

    // Renderizar cards
    function renderPartners(filter) {
        var grid = document.getElementById('partnersGrid');
        var filtered = filter === 'all' ? partners : partners.filter(function(p) { return p.category === filter; });
        
        grid.innerHTML = filtered.map(function(p) {
            return '<div class="partner-card" data-category="' + p.category + '" data-id="' + p.id + '" onclick="showPartnerDetail(' + p.id + ')">' +
                '<div class="card-header">' +
                    '<div class="card-logo">' + p.logo + '</div>' +
                    '<div class="card-badge">' + p.discount + '% OFF</div>' +
                '</div>' +
                '<div class="card-body">' +
                    '<h3 class="card-title">' + p.name + '</h3>' +
                    '<p class="card-description">' + p.description + '</p>' +
                    '<div class="card-meta">' +
                        '<span class="meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + p.distance + '</span>' +
                        '<span class="meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ' + p.rating + '</span>' +
                    '</div>' +
                    '<div class="card-location">' + p.city + '</div>' +
                '</div>' +
                '<div class="card-footer">' +
                    '<div class="card-points">Ganhe +' + p.points + ' pontos</div>' +
                    '<button class="btn-use" onclick="event.stopPropagation(); showPartnerDetail(' + p.id + ')">Utilizar</button>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    // ===== MODAL DETALHE DO PARCEIRO =====
    window.showPartnerDetail = function(partnerId) {
        var partner = partners.find(function(p) { return p.id === partnerId; });
        if (!partner) return;

        var modal = document.getElementById('partnerModal');
        var content = document.getElementById('modalContent');
        var catName = categoryNames[partner.category] || partner.category;

        // Gerar estrelas
        var fullStars = Math.floor(partner.rating);
        var hasHalf = (partner.rating - fullStars) >= 0.5;
        var starsHtml = '';
        for (var i = 0; i < fullStars; i++) starsHtml += '★';
        if (hasHalf) starsHtml += '½';

        content.innerHTML = 
            '<div class="modal-header-section">' +
                '<div class="modal-logo">' + partner.logo + '</div>' +
                '<div class="modal-header-info">' +
                    '<h2 class="modal-partner-name">' + partner.name + '</h2>' +
                    '<span class="modal-category-badge">' + catName + '</span>' +
                    '<div class="modal-rating">' +
                        '<span class="modal-stars">' + starsHtml + '</span>' +
                        '<span class="modal-rating-value">' + partner.rating + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="modal-body-section">' +
                '<div class="modal-info-grid">' +
                    '<div class="modal-info-item">' +
                        '<span class="modal-info-icon">📍</span>' +
                        '<div class="modal-info-text">' +
                            '<span class="modal-info-label">Localização</span>' +
                            '<span class="modal-info-value">' + partner.city + ' • ' + partner.distance + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-info-item">' +
                        '<span class="modal-info-icon">📞</span>' +
                        '<div class="modal-info-text">' +
                            '<span class="modal-info-label">Telefone</span>' +
                            '<span class="modal-info-value">' + partner.phone + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-info-item">' +
                        '<span class="modal-info-icon">💬</span>' +
                        '<div class="modal-info-text">' +
                            '<span class="modal-info-label">WhatsApp</span>' +
                            '<span class="modal-info-value">' + partner.whatsapp + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-info-item">' +
                        '<span class="modal-info-icon">🏠</span>' +
                        '<div class="modal-info-text">' +
                            '<span class="modal-info-label">Endereço</span>' +
                            '<span class="modal-info-value">' + partner.address + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="modal-description">' +
                    '<h3 class="modal-section-title">Sobre o parceiro</h3>' +
                    '<p class="modal-description-text">' + partner.fullDescription + '</p>' +
                '</div>' +
                '<div class="modal-benefits">' +
                    '<h3 class="modal-section-title">Benefícios disponíveis</h3>' +
                    '<div class="modal-benefits-list">' +
                        '<div class="modal-benefit-item">' +
                            '<div class="benefit-icon-wrap">🎫</div>' +
                            '<div class="benefit-details">' +
                                '<span class="benefit-name">Desconto exclusivo</span>' +
                                '<span class="benefit-value">' + partner.discount + '% de desconto para associados</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="modal-benefit-item">' +
                            '<div class="benefit-icon-wrap">⭐</div>' +
                            '<div class="benefit-details">' +
                                '<span class="benefit-name">Acúmulo de pontos</span>' +
                                '<span class="benefit-value">Ganhe +' + partner.points + ' pontos por utilização</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="modal-benefit-item">' +
                            '<div class="benefit-icon-wrap">🎁</div>' +
                            '<div class="benefit-details">' +
                                '<span class="benefit-name">Cashback Auto Vale</span>' +
                                '<span class="benefit-value">2% de cashback em compras acima de R$50</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="modal-footer-section">' +
                '<button class="modal-btn-use" onclick="alert(\'Benefício utilizado com sucesso! Você ganhou +' + partner.points + ' pontos. Apresente seu código ao parceiro.\')">Utilizar Benefício</button>' +
                '<button class="modal-btn-whatsapp" onclick="window.open(\'https://wa.me/55\' + \'' + partner.whatsapp.replace(/[^0-9]/g, '') + '\', \'_blank\')">💬 WhatsApp</button>' +
            '</div>';

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Trigger animation
        setTimeout(function() { modal.classList.add('active'); }, 10);
    };

    // Fechar modal
    function closePartnerModal() {
        var modal = document.getElementById('partnerModal');
        modal.classList.remove('active');
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    // Event listeners do modal
    document.addEventListener('DOMContentLoaded', function() {
        var modalClose = document.getElementById('modalClose');
        var modalOverlay = document.getElementById('partnerModal');

        if (modalClose) {
            modalClose.addEventListener('click', closePartnerModal);
        }
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) closePartnerModal();
            });
        }
        // Fechar com Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closePartnerModal();
        });
    });

    // Filtro de categorias
    var chips = document.querySelectorAll('.category-chip');
    chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
            chips.forEach(function(c) { c.classList.remove('active'); });
            this.classList.add('active');
            renderPartners(this.getAttribute('data-category'));
        });
    });

    // Theme Toggle
    var toggle = document.getElementById('themeToggle');
    var html = document.documentElement;
    function loadTheme() {
        var saved = localStorage.getItem('autovale-clube-theme');
        if (saved === 'dark') html.classList.add('dark-mode');
        else if (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) html.classList.add('dark-mode');
    }
    toggle.addEventListener('click', function() {
        html.classList.toggle('dark-mode');
        localStorage.setItem('autovale-clube-theme', html.classList.contains('dark-mode') ? 'dark' : 'light');
    });
    loadTheme();

    // Busca
    var searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', function() {
        var term = this.value.toLowerCase();
        var cards = document.querySelectorAll('.partner-card');
        cards.forEach(function(card) {
            var title = card.querySelector('.card-title').textContent.toLowerCase();
            var desc = card.querySelector('.card-description').textContent.toLowerCase();
            card.style.display = (title.indexOf(term) > -1 || desc.indexOf(term) > -1) ? '' : 'none';
        });
    });

    // Render inicial
    renderPartners('all');
})();
