const games = [
    {
        title: "Cyberpunk 2077",
        genre: "RPG • AÇÃO",
        categories: ["RPG", "AÇÃO"],
        rating: "9.5",
        platform: "PC, PlayStation e Xbox",
        release: "2020",
        description: "Explore Night City em uma aventura de mundo aberto cheia de escolhas, ação e tecnologia.",
        image: "../assets/cyberpunk.jpg"
    },
    {
        title: "Resident Evil 4",
        genre: "TERROR",
        categories: ["TERROR"],
        rating: "9.2",
        platform: "PC, PlayStation e Xbox",
        release: "2023",
        description: "Uma jornada de sobrevivência intensa com combates estratégicos e uma atmosfera assustadora.",
        image: "../assets/resident-evil-4.jpg.webp"
    },
    {
        title: "Hollow Knight",
        genre: "AVENTURA",
        categories: ["AVENTURA"],
        rating: "9.0",
        platform: "PC, Nintendo Switch e PlayStation",
        release: "2017",
        description: "Desça às profundezas de um reino misterioso e descubra seus segredos em uma aventura desafiadora.",
        image: "../assets/hollow-knight.jpg.webp"
    },
    {
        title: "Elden Ring",
        genre: "AÇÃO • RPG",
        categories: ["AÇÃO", "RPG"],
        rating: "8.8",
        platform: "PC, PlayStation e Xbox",
        release: "2022",
        description: "Enfrente criaturas lendárias e descubra um vasto mundo de fantasia com liberdade para explorar.",
        image: "../assets/elden-ring.jpg.jpg"
    }
];

function renderGames(list) {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    grid.innerHTML = list.length ? list.map(game => `
        <article class="game-card" data-game-title="${game.title}" tabindex="0" role="button" aria-label="Ver detalhes de ${game.title}">
            <div class="game-image">
                <img src="${game.image}" alt="Capa de ${game.title}" loading="lazy">
                <button type="button" class="favorite-button${isFavorite(game) ? ' active' : ''}" data-favorite="${game.title}" aria-label="${isFavorite(game) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}" aria-pressed="${isFavorite(game)}">♥</button>
                <span class="game-score">${game.rating}</span>
            </div>
            <div class="game-info">
                <span class="game-genre">${game.genre}</span>
                <h4>${game.title}</h4>
                <p class="game-stars" aria-label="Avaliação ${game.rating} de 10">★★★★★</p>
            </div>
        </article>
    `).join('') : '<p class="empty-state">Nenhum jogo encontrado.</p>';
}

const searchInput = document.querySelector('input');
const searchButton = document.querySelector('[data-search-button]');
const categoryFilters = document.getElementById('category-filters');
const sortSelect = document.getElementById('sort-games');
let activeCategory = 'TODOS';
let favoriteTitles = JSON.parse(localStorage.getItem('game-score-favorites') || '[]');
let sortMode = 'featured';

function sortGames(list) {
    return [...list].sort((firstGame, secondGame) => {
        if (sortMode === 'rating') return Number(secondGame.rating) - Number(firstGame.rating);
        if (sortMode === 'title') return firstGame.title.localeCompare(secondGame.title, 'pt-BR');
        return games.indexOf(firstGame) - games.indexOf(secondGame);
    });
}

renderGames(sortGames(games));

function normalizeText(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function isFavorite(game) {
    return favoriteTitles.includes(game.title);
}

function saveFavorites() {
    localStorage.setItem('game-score-favorites', JSON.stringify(favoriteTitles));
}

function renderCategories() {
    if (!categoryFilters) return;

    const categories = ['TODOS', ...new Set(games.flatMap(game => game.categories)), 'FAVORITOS'];
    categoryFilters.innerHTML = categories.map(category => `
        <button type="button" class="category-button${category === activeCategory ? ' active' : ''}" data-category="${category}">
            ${category === 'TODOS' ? 'Todos' : category === 'FAVORITOS' ? 'Favoritos' : category}
        </button>
    `).join('');
}

function searchGames() {
    const query = normalizeText(searchInput ? searchInput.value : '');
    renderGames(sortGames(games.filter(game =>
        normalizeText(`${game.title} ${game.genre}`).includes(query) &&
        (activeCategory === 'TODOS' ||
            (activeCategory === 'FAVORITOS' ? isFavorite(game) : game.categories.includes(activeCategory)))
    )));
}

renderCategories();

if (searchButton && searchInput) {
    searchButton.addEventListener('click', searchGames);
    searchInput.addEventListener('input', searchGames);
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') searchGames();
    });
}

if (categoryFilters) {
    categoryFilters.addEventListener('click', event => {
        const categoryButton = event.target.closest('[data-category]');
        if (!categoryButton) return;

        activeCategory = categoryButton.dataset.category;
        renderCategories();
        searchGames();
    });
}

if (sortSelect) {
    sortSelect.addEventListener('change', event => {
        sortMode = event.target.value;
        searchGames();
    });
}

const gamesGrid = document.getElementById('games-grid');
const gameModal = document.getElementById('game-modal');
const modalClose = document.querySelector('[data-modal-close]');

function openGameModal(game) {
    if (!gameModal) return;

    gameModal.querySelector('[data-modal-image]').src = game.image;
    gameModal.querySelector('[data-modal-image]').alt = `Capa de ${game.title}`;
    gameModal.querySelector('[data-modal-title]').textContent = game.title;
    gameModal.querySelector('[data-modal-genre]').textContent = game.genre;
    gameModal.querySelector('[data-modal-rating]').textContent = game.rating;
    gameModal.querySelector('[data-modal-platform]').textContent = game.platform;
    gameModal.querySelector('[data-modal-release]').textContent = game.release;
    gameModal.querySelector('[data-modal-description]').textContent = game.description;
    gameModal.hidden = false;
    document.body.classList.add('modal-open');
    modalClose.focus();
}

function closeGameModal() {
    if (!gameModal) return;

    gameModal.hidden = true;
    document.body.classList.remove('modal-open');
}

if (gamesGrid) {
    gamesGrid.addEventListener('click', event => {
        const favoriteButton = event.target.closest('[data-favorite]');
        if (favoriteButton) {
            const title = favoriteButton.dataset.favorite;
            favoriteTitles = isFavorite({ title })
                ? favoriteTitles.filter(favoriteTitle => favoriteTitle !== title)
                : [...favoriteTitles, title];
            saveFavorites();
            renderCategories();
            searchGames();
            return;
        }

        const card = event.target.closest('[data-game-title]');
        if (!card) return;

        openGameModal(games.find(game => game.title === card.dataset.gameTitle));
    });

    gamesGrid.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;

        const card = event.target.closest('[data-game-title]');
        if (!card) return;

        event.preventDefault();
        openGameModal(games.find(game => game.title === card.dataset.gameTitle));
    });
}

if (modalClose) modalClose.addEventListener('click', closeGameModal);

if (gameModal) {
    gameModal.addEventListener('click', event => {
        if (event.target === gameModal) closeGameModal();
    });
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeGameModal();
});