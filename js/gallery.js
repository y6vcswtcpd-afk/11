// gallery.js - 图库管理系统
class GalleryManager {
    constructor() {
        this.images = [];
        this.filteredImages = [];
        this.currentPage = 1;
        this.imagesPerPage = 12;
        this.currentCategory = 'all';
        this.currentSort = 'newest';
        this.currentTag = 'all';
        this.currentSearch = '';
        this.isLoading = false;
    }
    
    init() {
        this.loadImages();
        this.bindEvents();
        this.render();
    }
    
    loadImages() {
        // 从本地存储加载图片数据
        this.images = JSON.parse(localStorage.getItem('images') || '[]');
        
        // 如果没有数据，生成示例数据
        if (this.images.length === 0) {
            this.generateSampleImages();
            localStorage.setItem('images', JSON.stringify(this.images));
        }
    }
    
    generateSampleImages() {
        const categories = ['nature', 'portrait', 'abstract', 'landscape', 'city', 'animal', 'food', 'travel'];
        const authors = ['摄影师小明', '艺术爱好者', '城市探索者', '自然观察家', '旅行摄影师'];
        const tags = {
            nature: ['自然', '风景', '户外', '生态'],
            portrait: ['人物', '肖像', '人像', '表情'],
            abstract: ['抽象', '创意', '现代', '设计'],
            landscape: ['风景', '山水', '远景', '地平线'],
            city: ['城市', '都市', '建筑', '街拍'],
            animal: ['动物', '宠物', '野生动物', '自然'],
            food: ['美食', '饮食', '烹饪', '食材'],
            travel: ['旅行', '旅游', '探险', '文化']
        };
        
        for (let i = 1; i <= 50; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const author = authors[Math.floor(Math.random() * authors.length)];
            
            this.images.push({
                id: i,
                title: `示例图片 ${i}`,
                author: author,
                url: `https://picsum.photos/800/600?random=${i}`,
                thumbnail: `https://picsum.photos/300/200?random=${i}`,
                category: category,
                tags: tags[category],
                likes: Math.floor(Math.random() * 200),
                views: Math.floor(Math.random() * 1000),
                isFavorited: Math.random() > 0.7,
                uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
    }
    
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce(() => {
                this.currentSearch = searchInput.value.trim();
                this.currentPage = 1;
                this.render();
            }, 500));
        }
        
        // 图片点击事件委托
        document.addEventListener('click', (e) => {
            // 收藏按钮
            if (e.target.closest('.favorite-btn')) {
                const btn = e.target.closest('.favorite-btn');
                const imageId = parseInt(btn.closest('.image-card').getAttribute('data-id'));
                this.toggleFavorite(imageId);
                return;
            }
            
            // 图片点击
            if (e.target.closest('.image-card') && !e.target.closest('.image-actions')) {
                const card = e.target.closest('.image-card');
                const imageId = parseInt(card.getAttribute('data-id'));
                this.viewImage(imageId);
                return;
            }
            
            // 标签点击
            if (e.target.classList.contains('tag')) {
                const tag = e.target.textContent;
                this.filterByTag(tag);
                document.getElementById('tagFilter').value = tag;
                return;
            }
        });
    }
    
    filterAndSort() {
        // 筛选
        this.filteredImages = [...this.images];
        
        // 搜索筛选
        if (this.currentSearch) {
            const searchTerm = this.currentSearch.toLowerCase();
            this.filteredImages = this.filteredImages.filter(image => 
                image.title.toLowerCase().includes(searchTerm) ||
                image.author.toLowerCase().includes(searchTerm) ||
                image.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // 分类筛选
        if (this.currentCategory !== 'all') {
            this.filteredImages = this.filteredImages.filter(image => image.category === this.currentCategory);
        }
        
        // 标签筛选
        if (this.currentTag !== 'all') {
            this.filteredImages = this.filteredImages.filter(image => 
                image.tags.includes(this.currentTag)
            );
        }
        
        // 排序
        switch (this.currentSort) {
            case 'newest':
                this.filteredImages.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                break;
            case 'oldest':
                this.filteredImages.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
                break;
            case 'popular':
                this.filteredImages.sort((a, b) => b.likes - a.likes);
                break;
            case 'views':
                this.filteredImages.sort((a, b) => b.views - a.likes);
                break;
        }
    }
    
    render(append = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const galleryGrid = document.getElementById('galleryGrid');
        
        if (!galleryGrid) {
            console.error('找不到图片网格容器');
            this.isLoading = false;
            return;
        }
        
        // 筛选和排序
        this.filterAndSort();
        
        // 如果没有图片
        if (this.filteredImages.length === 0) {
            galleryGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="color: #555; margin-bottom: 10px;">没有找到相关图片</h3>
                    <p style="color: #777; margin-bottom: 20px;">尝试调整搜索条件或筛选条件</p>
                    <button onclick="galleryManager.clearFilters()" class="btn btn-primary">
                        清除筛选条件
                    </button>
                </div>
            `;
            
            // 隐藏加载更多按钮
            document.getElementById('loadMore').style.display = 'none';
            this.isLoading = false;
            return;
        }
        
        // 计算要显示的图片范围
        const startIndex = (this.currentPage - 1) * this.imagesPerPage;
        const endIndex = startIndex + this.imagesPerPage;
        const imagesToShow = this.filteredImages.slice(0, endIndex);
        
        // 更新结果统计
        document.getElementById('totalCount').textContent = this.filteredImages.length;
        
        if (!append) {
            galleryGrid.innerHTML = '';
        }
        
        // 渲染图片
        imagesToShow.forEach(image => {
            const card = this.createImageCard(image);
            galleryGrid.appendChild(card);
        });
        
        // 显示/隐藏加载更多按钮
        const loadMore = document.getElementById('loadMore');
        if (loadMore) {
            if (endIndex >= this.filteredImages.length) {
                loadMore.style.display = 'none';
            } else {
                loadMore.style.display = 'block';
            }
        }
        
        this.isLoading = false;
    }
    
    createImageCard(image) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.setAttribute('data-id', image.id);
        
        card.innerHTML = `
            <div class="image-container">
                <img src="${image.thumbnail}" alt="${image.title}" loading="lazy">
                <div class="image-overlay"></div>
            </div>
            <div class="image-info">
                <h3 class="image-title">${image.title}</h3>
                <p class="image-author">by ${image.author}</p>
                <div class="image-tags">
                    ${image.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="image-actions">
                    <button class="action-btn favorite-btn ${image.isFavorited ? 'favorited' : ''}" 
                            title="${image.isFavorited ? '取消收藏' : '收藏'}">
                        <i class="fas fa-heart"></i>
                        <span>${image.likes}</span>
                    </button>
                    <button class="action-btn view-btn" title="查看详情">
                        <i class="fas fa-eye"></i>
                        <span>${image.views}</span>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    toggleFavorite(imageId) {
        const imageIndex = this.images.findIndex(img => img.id === imageId);
        if (imageIndex === -1) return;
        
        const currentUser = authSystem.getCurrentUser();
        if (!currentUser) return;
        
        // 更新图片收藏状态
        this.images[imageIndex].isFavorited = !this.images[imageIndex].isFavorited;
        if (this.images[imageIndex].isFavorited) {
            this.images[imageIndex].likes++;
            if (!currentUser.favorites.includes(imageId)) {
                currentUser.favorites.push(imageId);
            }
        } else {
            this.images[imageIndex].likes--;
            currentUser.favorites = currentUser.favorites.filter(id => id !== imageId);
        }
        
        // 更新本地存储
        localStorage.setItem('images', JSON.stringify(this.images));
        authSystem.updateUser(currentUser);
        
        // 更新UI
        const favoriteBtn = document.querySelector(`.image-card[data-id="${imageId}"] .favorite-btn`);
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('favorited');
            const likesSpan = favoriteBtn.querySelector('span');
            if (likesSpan) {
                likesSpan.textContent = this.images[imageIndex].likes;
            }
        }
    }
    
    viewImage(imageId) {
        window.location.href = `detail.html?id=${imageId}`;
    }
    
    search(query) {
        this.currentSearch = query;
        this.currentPage = 1;
        this.render();
    }
    
    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.render();
    }
    
    filterByTag(tag) {
        this.currentTag = tag;
        this.currentPage = 1;
        this.render();
    }
    
    sortBy(method) {
        this.currentSort = method;
        this.render();
    }
    
    loadMore() {
        if (this.isLoading) return;
        this.currentPage++;
        this.render(true);
    }
    
    clearFilters() {
        this.currentSearch = '';
        this.currentCategory = 'all';
        this.currentTag = 'all';
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('tagFilter').value = 'all';
        this.render();
    }
}

// 创建全局实例
window.galleryManager = new GalleryManager();