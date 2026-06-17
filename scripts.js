/* ===== CLUBE DE BENEFÍCIOS AUTO VALE - Marketplace ===== */
(function() {
    'use strict';

    // Dados mockados dos parceiros
    var partners = [
        { id:1, name:"Auto Posto São Jorge", category:"postos", city:"Linhares - ES", distance:"1.2 km", discount:5, points:10, rating:4.8, logo:"⛽", description:"Combustível de qualidade" },
        { id:2, name:"Lava Jato Premium", category:"lava-jato", city:"Linhares - ES", distance:"2.5 km", discount:15, points:20, rating:4.6, logo:"🚿", description:"Lavagem completa" },
        { id:3, name:"Mecânica Central", category:"mecanica", city:"Linhares - ES", distance:"3.1 km", discount:10, points:30, rating:4.9, logo:"🔧", description:"Mecânica especializada" },
        { id:4, name:"Estética Car Pro", category:"estetica", city:"Linhares - ES", distance:"1.8 km", discount:20, points:25, rating:4.7, logo:"✨", description:"Polimento e cristalização" },
        { id:5, name:"Pneus & Cia", category:"pneus", city:"Linhares - ES", distance:"4.2 km", discount:12, points:40, rating:4.5, logo:"🛞", description:"Todas as marcas" },
        { id:6, name:"Auto Elétrica Rápida", category:"eletrica", city:"Linhares - ES", distance:"2.0 km", discount:8, points:15, rating:4.4, logo:"⚡", description:"Diagnóstico computadorizado" },
        { id:7, name:"Borracharia 24h", category:"borracharia", city:"Linhares - ES", distance:"0.8 km", discount:10, points:10, rating:4.3, logo:"🔩", description:"Atendimento 24 horas" },
        { id:8, name:"Guincho Express", category:"guincho", city:"Linhares - ES", distance:"5.0 km", discount:15, points:50, rating:4.8, logo:"🚗", description:"Guincho e reboque" },
        { id:9, name:"Restaurante Sabor Mineiro", category:"alimentacao", city:"Linhares - ES", distance:"1.5 km", discount:10, points:5, rating:4.6, logo:"🍔", description:"Almoço executivo" },
        { id:10, name:"Farmácia Saúde+", category:"saude", city:"Linhares - ES", distance:"0.5 km", discount:8, points:5, rating:4.7, logo:"🏥", description:"Medicamentos e bem-estar" },
        { id:11, name:"Auto Escola Dirigir Bem", category:"educacao", city:"Linhares - ES", distance:"3.5 km", discount:25, points:100, rating:4.9, logo:"📚", description:"Cursos de direção defensiva" },
        { id:12, name:"Posto Shell Av. Brasil", category:"postos", city:"Linhares - ES", distance:"2.8 km", discount:3, points:8, rating:4.5, logo:"⛽", description:"Promoção combustível aditivado" }
    ];

    // Renderizar cards
    function renderPartners(filter) {
        var grid = document.getElementById('partnersGrid');
        var filtered = filter === 'all' ? partners : partners.filter(function(p) { return p.category === filter; });
        
        grid.innerHTML = filtered.map(function(p) {
            return '<div class="partner-card" data-category="' + p.category + '">' +
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
                    '<div class="card-points">+' + p.points + ' pts</div>' +
                    '<button class="btn-use">Utilizar</button>' +
                '</div>' +
            '</div>';
        }).join('');
    }

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
