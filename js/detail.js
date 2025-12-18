// detail.js - 图片详情页功能
class DetailManager {
    constructor() {
        this.imageId = null;
        this.imageData = null;
        this.relatedImages = [];
    }
    
    init() {
        this.loadImageData();
        this.bindEvents();
        this.updatePage();
        this.loadRelatedImages();
    }
    
    loadImageData() {
        // 从URL获取图片ID
        const urlParams = new URLSearchParams(window.location.search);
        this.imageId = urlParams.get('id');
        
        if (!this.imageId) {
            console.error('未找到图片ID');
            window.location.href = 'gallery.html';
            return;
        }
        
        // 获取图片数据
        const images = JSON.parse(localStorage.getItem('images') || '[]');
        this.imageData = images.find(img => img.id == this.imageId);
        
        if (!this.imageData) {
            console.error('未找到图片数据');
            window.location.href = 'gallery.html';
            return;
        }
        
        // 增加浏览量
        this.incrementViews();
    }
    
    incrementViews() {
        this.imageData.views = (this.imageData.views || 0) + 1;
        this.updateImageData();
    }
    
    updatePage() {
        if (!this.imageData) return;
        
        // 更新页面元素
        document.title = `${this.imageData.title} - 图片详情`;
        document.getElementById('detailImage').src = this.imageData.url;
        document.getElementById('detailImage').alt = this.imageData.title;
        document.getElementById('imageTitle').textContent = this.imageData.title;
        document.getElementById('imageAuthor').textContent = this.imageData.author;
        document.getElementById('imageDescription').textContent = this.imageData.description || '这张图片还没有描述...';
        document.getElementById('likeCount').textContent = this.imageData.likes;
        document.getElementById('viewCount').textContent = this.imageData.views;
        document.getElementById('downloadCount').textContent = this.imageData.downloads || 0;
        document.getElementById('uploadDate').textContent = `上传于 ${utils.formatDate(this.imageData.uploadDate)}`;
        document.getElementById('imageCategory').textContent = this.imageData.category;
        
        // 更新标签
        const tagsContainer = document.getElementById('imageTags');
        if (tagsContainer && this.imageData.tags) {
            tagsContainer.innerHTML = this.imageData.tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        }
        
        // 更新喜欢按钮状态
        const currentUser = authSystem.getCurrentUser();
        if (currentUser && currentUser.favorites.includes(this.imageData.id)) {
            document.getElementById('likeBtn').classList.add('liked');
            document.getElementById('likeBtn').innerHTML = '<i class="fas fa-heart"></i><span>已喜欢</span>';
        }
    }
    
    bindEvents() {
        if (!this.imageData) return;
        
        // 喜欢按钮
        document.getElementById('likeBtn').addEventListener('click', () => {
            this.toggleLike();
        });
        
        // 下载按钮
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadImage();
        });
        
        // 放大镜功能
        const zoomBtn = document.getElementById('zoomBtn');
        const zoomOverlay = document.getElementById('zoomOverlay');
        const zoomedImage = document.getElementById('zoomedImage');
        const closeZoom = document.getElementById('closeZoom');
        
        if (zoomBtn && zoomOverlay && zoomedImage) {
            zoomBtn.addEventListener('click', () => {
                zoomedImage.src = this.imageData.url;
                zoomOverlay.classList.add('active');
            });
            
            closeZoom.addEventListener('click', () => {
                zoomOverlay.classList.remove('active');
            });
            
            zoomOverlay.addEventListener('click', (e) => {
                if (e.target === zoomOverlay) {
                    zoomOverlay.classList.remove('active');
                }
            });
        }
        
        // 标签点击事件
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const tagName = tag.textContent;
                window.location.href = `gallery.html?tag=${encodeURIComponent(tagName)}`;
            });
        });
    }
    
    toggleLike() {
        const currentUser = authSystem.getCurrentUser();
        if (!currentUser) {
            authSystem.showToast('请先登录', 'error');
            return;
        }
        
        const likeBtn = document.getElementById('likeBtn');
        const isLiked = likeBtn.classList.contains('liked');
        
        if (isLiked) {
            // 取消喜欢
            this.imageData.likes--;
            currentUser.favorites = currentUser.favorites.filter(id => id != this.imageData.id);
            likeBtn.classList.remove('liked');
            likeBtn.innerHTML = '<i class="far fa-heart"></i><span>喜欢</span>';
            authSystem.showToast('已取消喜欢', 'info');
        } else {
            // 喜欢
            this.imageData.likes++;
            currentUser.favorites.push(this.imageData.id);
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = '<i class="fas fa-heart"></i><span>已喜欢</span>';
            authSystem.showToast('已添加到喜欢', 'success');
        }
        
        // 更新计数显示
        document.getElementById('likeCount').textContent = this.imageData.likes;
        
        // 更新数据
        this.updateImageData();
        authSystem.updateUser(currentUser);
    }
    
    downloadImage() {
        const currentUser = authSystem.getCurrentUser();
        if (!currentUser) {
            authSystem.showToast('请先登录', 'error');
            return;
        }
        
        // 模拟下载
        console.log('下载图片:', this.imageData.title);
        authSystem.showToast('开始下载...', 'info');
        
        // 增加下载计数
        this.imageData.downloads = (this.imageData.downloads || 0) + 1;
        document.getElementById('downloadCount').textContent = this.imageData.downloads;
        this.updateImageData();
        
        // 实际下载功能
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = this.imageData.url;
            link.download = `${this.imageData.title.replace(/\s+/g, '_')}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            authSystem.showToast('下载完成', 'success');
        }, 1000);
    }
    
    loadRelatedImages() {
        const images = JSON.parse(localStorage.getItem('images') || '[]');
        this.relatedImages = images
            .filter(img => 
                img.id != this.imageData.id && 
                (img.category === this.imageData.category || 
                 img.tags.some(tag => this.imageData.tags.includes(tag)))
            )
            .slice(0, 6); // 最多显示6张相关图片
        
        const relatedContainer = document.getElementById('relatedImages');
        if (relatedContainer) {
            relatedContainer.innerHTML = this.relatedImages.map(img => `
                <div class="related-item" data-id="${img.id}">
                    <img src="${img.thumbnail}" alt="${img.title}">
                </div>
            `).join('');
            
            // 绑定点击事件
            document.querySelectorAll('.related-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    window.location.href = `detail.html?id=${id}`;
                });
            });
        }
    }
    
    updateUserHistory() {
        const currentUser = authSystem.getCurrentUser();
        if (!currentUser) return;
        
        // 添加到浏览历史
        if (!currentUser.history.includes(this.imageData.id)) {
            currentUser.history.unshift(this.imageData.id);
            
            // 最多保留50条历史记录
            if (currentUser.history.length > 50) {
                currentUser.history = currentUser.history.slice(0, 50);
            }
            
            authSystem.updateUser(currentUser);
        }
    }
    
    updateImageData() {
        const images = JSON.parse(localStorage.getItem('images') || '[]');
        const index = images.findIndex(img => img.id === this.imageData.id);
        if (index !== -1) {
            images[index] = this.imageData;
            localStorage.setItem('images', JSON.stringify(images));
        }
    }
}

// 创建全局实例
window.detailManager = new DetailManager();