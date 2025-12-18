// profile.js - 个人中心功能
class ProfileManager {
    constructor() {
        this.currentTab = 'uploads';
        this.init();
    }
    
    init() {
        this.loadCurrentUser();
        this.bindEvents();
        this.loadTabContent();
    }
    
    loadCurrentUser() {
        this.currentUser = authSystem.getCurrentUser();
        if (!this.currentUser) {
            authSystem.redirectToLogin();
            return;
        }
        
        // 初始化用户数据
        this.currentUser.uploads = this.currentUser.uploads || [];
        this.currentUser.favorites = this.currentUser.favorites || [];
        this.currentUser.history = this.currentUser.history || [];
    }
    
    bindEvents() {
        // 标签切换
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link.getAttribute('data-tab'));
            });
        });
        
        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', () => {
            authSystem.logout();
        });
        
        // 编辑资料
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            this.switchTab('settings');
        });
        
        // 上传图片
        document.getElementById('uploadNewBtn').addEventListener('click', () => {
            this.showUploadModal();
        });
        
        // 清空历史记录
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });
        
        // 头像上传
        document.getElementById('avatarUpload').addEventListener('click', () => {
            this.uploadAvatar();
        });
    }
    
    switchTab(tabId) {
        this.currentTab = tabId;
        
        // 更新活动标签样式
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
            }
        });
        
        // 显示对应内容
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
            if (tab.id === tabId) {
                tab.classList.add('active');
            }
        });
        
        // 加载对应内容
        this.loadTabContent();
    }
    
    loadTabContent() {
        if (!this.currentUser) return;
        
        const images = JSON.parse(localStorage.getItem('images') || '[]');
        
        switch (this.currentTab) {
            case 'uploads':
                this.loadUploads(images);
                break;
            case 'favorites':
                this.loadFavorites(images);
                break;
            case 'history':
                this.loadHistory(images);
                break;
            case 'settings':
                // 设置页不需要额外加载
                break;
        }
    }
    
    loadUploads(images) {
        const uploadsGrid = document.getElementById('uploadsGrid');
        if (!uploadsGrid) return;
        
        // 清空现有内容
        uploadsGrid.innerHTML = '';
        
        // 获取用户上传的图片
        const uploadedImages = images.filter(img => 
            this.currentUser.uploads.includes(img.id)
        );
        
        if (uploadedImages.length === 0) {
            uploadsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <h3 class="empty-text">您还没有上传任何图片</h3>
                    <button class="btn btn-primary" id="uploadEmptyBtn">
                        <i class="fas fa-plus"></i> 上传第一张图片
                    </button>
                </div>
            `;
            
            // 绑定上传按钮事件
            document.getElementById('uploadEmptyBtn').addEventListener('click', () => {
                this.showUploadModal();
            });
            
            return;
        }
        
        // 显示上传的图片
        uploadedImages.forEach(image => {
            uploadsGrid.appendChild(this.createImageCard(image));
        });
    }
    
    loadFavorites(images) {
        const favoritesGrid = document.getElementById('favoritesGrid');
        if (!favoritesGrid) return;
        
        // 清空现有内容
        favoritesGrid.innerHTML = '';
        
        // 获取用户收藏的图片
        const favoriteImages = images.filter(img => 
            this.currentUser.favorites.includes(img.id)
        );
        
        if (favoriteImages.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <h3 class="empty-text">您还没有收藏任何图片</h3>
                    <button class="btn btn-primary" onclick="window.location.href='gallery.html'">
                        <i class="fas fa-search"></i> 去发现美图
                    </button>
                </div>
            `;
            return;
        }
        
        // 显示收藏的图片
        favoriteImages.forEach(image => {
            favoritesGrid.appendChild(this.createImageCard(image, true));
        });
    }
    
    loadHistory(images) {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        // 清空现有内容
        historyList.innerHTML = '';
        
        if (this.currentUser.history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <h3 class="empty-text">您的浏览历史为空</h3>
                    <button class="btn btn-primary" onclick="window.location.href='gallery.html'">
                        <i class="fas fa-search"></i> 去发现美图
                    </button>
                </div>
            `;
            return;
        }
        
        // 显示浏览历史
        this.currentUser.history.forEach(imageId => {
            const image = images.find(img => img.id == imageId);
            if (image) {
                historyList.appendChild(this.createHistoryItem(image));
            }
        });
    }
    
    createImageCard(image, isFavorite = false) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.setAttribute('data-id', image.id);
        
        card.innerHTML = `
            <div class="image-container">
                <img src="${image.thumbnail}" alt="${image.title}">
            </div>
            <div class="image-info">
                <h3 class="image-title">${image.title}</h3>
                <div class="image-stats">
                    <span><i class="fas fa-heart"></i> ${image.likes || 0}</span>
                    <span><i class="fas fa-eye"></i> ${image.views || 0}</span>
                </div>
            </div>
        `;
        
        // 点击查看详情
        card.addEventListener('click', () => {
            window.location.href = `detail.html?id=${image.id}`;
        });
        
        return card;
    }
    
    createHistoryItem(image) {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        item.innerHTML = `
            <div class="history-thumbnail">
                <img src="${image.thumbnail}" alt="${image.title}">
            </div>
            <div class="history-info">
                <h4 class="history-title">${image.title}</h4>
                <div class="history-meta">
                    <span>${image.author}</span>
                    <span>${utils.formatDate(image.uploadDate)}</span>
                </div>
            </div>
            <div class="history-actions">
                <button class="action-btn" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 点击查看详情
        item.querySelector('.history-thumbnail, .history-info').addEventListener('click', () => {
            window.location.href = `detail.html?id=${image.id}`;
        });
        
        // 删除历史记录
        item.querySelector('.action-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFromHistory(image.id);
            item.remove();
        });
        
        return item;
    }
    
    showUploadModal() {
        document.getElementById('uploadModal').style.display = 'block';
        
        // 关闭模态框
        document.getElementById('closeUploadModal').addEventListener('click', () => {
            document.getElementById('uploadModal').style.display = 'none';
        });
        
        // 提交表单
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpload();
        });
    }
    
    handleUpload() {
        const fileInput = document.getElementById('imageFile');
        const title = document.getElementById('imageTitle').value;
        const description = document.getElementById('imageDescription').value;
        const category = document.getElementById('imageCategory').value;
        const tags = document.getElementById('imageTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        if (!fileInput.files || fileInput.files.length === 0) {
            authSystem.showToast('请选择图片文件', 'error');
            return;
        }
        
        if (!title) {
            authSystem.showToast('请输入图片标题', 'error');
            return;
        }
        
        if (!category) {
            authSystem.showToast('请选择图片分类', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        if (!file.type.match('image.*')) {
            authSystem.showToast('请选择图片文件', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            authSystem.showToast('图片大小不能超过5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            authSystem.showToast('正在上传图片...', 'info');
            
            setTimeout(() => {
                // 创建新图片数据
                const images = JSON.parse(localStorage.getItem('images') || '[]');
                const newImage = {
                    id: Date.now(),
                    title: title,
                    author: this.currentUser.username,
                    url: event.target.result,
                    thumbnail: event.target.result, // 实际项目中应该生成缩略图
                    description: description,
                    category: category,
                    tags: tags,
                    likes: 0,
                    views: 0,
                    uploadDate: new Date().toISOString()
                };
                
                // 添加到图片列表
                images.push(newImage);
                localStorage.setItem('images', JSON.stringify(images));
                
                // 更新用户上传记录
                this.currentUser.uploads.push(newImage.id);
                authSystem.updateUser(this.currentUser);
                
                // 更新显示
                this.updateProfileStats();
                this.loadUploads(images);
                
                // 关闭模态框并重置表单
                document.getElementById('uploadModal').style.display = 'none';
                document.getElementById('uploadForm').reset();
                
                authSystem.showToast('图片上传成功', 'success');
            }, 1500);
        };
        reader.readAsDataURL(file);
    }
    
    uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!file.type.match('image.*')) {
                authSystem.showToast('请选择图片文件', 'error');
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                authSystem.showToast('图片大小不能超过2MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                this.currentUser.avatar = event.target.result;
                authSystem.updateUser(this.currentUser);
                
                document.getElementById('userAvatar').src = event.target.result;
                authSystem.showToast('头像更新成功', 'success');
            };
            reader.readAsDataURL(file);
        };
        
        input.click();
    }
    
    clearHistory() {
        if (confirm('确定要清空所有浏览历史吗？')) {
            this.currentUser.history = [];
            authSystem.updateUser(this.currentUser);
            this.loadHistory([]);
            authSystem.showToast('已清空浏览历史', 'success');
        }
    }
    
    removeFromHistory(imageId) {
        this.currentUser.history = this.currentUser.history.filter(id => id != imageId);
        authSystem.updateUser(this.currentUser);
        authSystem.showToast('已从历史记录中移除', 'success');
    }
    
    updateProfileStats() {
        const images = JSON.parse(localStorage.getItem('images') || '[]');
        
        // 更新上传数
        document.getElementById('uploadCount').textContent = this.currentUser.uploads.length;
        
        // 更新收藏数
        document.getElementById('favoriteCount').textContent = this.currentUser.favorites.length;
        
        // 计算获赞数
        const likeCount = images
            .filter(img => this.currentUser.uploads.includes(img.id))
            .reduce((sum, img) => sum + (img.likes || 0), 0);
        document.getElementById('likeCount').textContent = likeCount;
    }
}

// 创建全局实例
window.profileManager = new ProfileManager();