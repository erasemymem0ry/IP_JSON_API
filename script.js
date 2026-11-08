const api = 'https://jsonplaceholder.typicode.com';

const selector = document.getElementById('album-selector');
const loadingEl = document.getElementById('loading-indicator');
const errorEl = document.getElementById('error-message');
const authorSec = document.getElementById('author-section');
const gallerySec = document.getElementById('gallery-section');
const authorDetails = document.querySelector('.author-details');
const galleryContainer = document.getElementById('photo-gallery');

let loadedAlbums = [];

async function initApp() {
    loadingEl.classList.remove('is-hidden');
    try {
        const response = await fetch(`${api}/albums`);
        if (!response.ok) {
            throw new Error(`Не удалось загрузить альбомы. Статус: ${response.status}`);
        }
        
        loadedAlbums = await response.json();
        
        const options = loadedAlbums.map(album => 
            `<option value="${album.id}">${album.title}</option>`
        ).join('');
        
        selector.innerHTML = `<option value="">-- Выберите альбом --</option>${options}`;
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('is-hidden');
    } finally {
        loadingEl.classList.add('is-hidden');
    }
}

selector.addEventListener('change', async function() {
    const albumId = this.value;
    
    authorDetails.innerHTML = '';
    galleryContainer.innerHTML = '';
    errorEl.classList.add('is-hidden');

    if (!albumId) {
        authorSec.classList.add('is-hidden');
        gallerySec.classList.add('is-hidden');
        return;
    }

    loadingEl.classList.remove('is-hidden');

    const albumInfo = loadedAlbums.find(a => a.id == albumId);

    try {
        const [authorReq, photosReq] = await Promise.all([
            fetch(`${api}/users/${albumInfo.userId}`),
            fetch(`${api}/photos?albumId=${albumInfo.id}`)
        ]);

        if (!authorReq.ok || !photosReq.ok) {
            throw new Error('Сбой при запросе данных к API');
        }

        const authorData = await authorReq.json();
        const photosData = await photosReq.json();

        authorDetails.innerHTML = `
            <p><strong>Имя:</strong> ${authorData.name}</p>
            <p><strong>Username:</strong> ${authorData.username}</p>
            <p><strong>Email:</strong> ${authorData.email}</p>
            <p><strong>Количество фото:</strong> ${photosData.length}</p>
        `;
        
        authorSec.classList.remove('is-hidden');

        const galleryHTML = photosData.map(photo => `
            <div class="photo-item">
                <a href="${photo.url}" target="_blank" rel="noopener noreferrer">
                    <img src="${photo.thumbnailUrl}" alt="${photo.title}">
                </a>
                <p class="photo-desc" title="${photo.title}">${photo.title}</p>
            </div>
        `).join('');

        galleryContainer.innerHTML = galleryHTML;
        gallerySec.classList.remove('is-hidden');

    } catch (err) {
        errorEl.textContent = `Ошибка: ${err.message}`;
        errorEl.classList.remove('is-hidden');
        authorSec.classList.add('is-hidden');
        gallerySec.classList.add('is-hidden');
    } finally {
        loadingEl.classList.add('is-hidden');
    }
});

document.addEventListener('DOMContentLoaded', initApp);