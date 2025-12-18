// auth.js - 用户认证系统
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // 检查本地存储中是否有用户数据
        this.loadUsers();
        this.loadCurrentUser();
    }
    
    // 加载用户数据
    loadUsers() {
        if (!localStorage.getItem('users')) {
            // 初始化测试用户
            const testUsers = [
                {
                    id: 1,
                    username: '测试用户',
                    phone: '13800138000',
                    password: '123456',
                    joinDate: '2024-01-15',
                    favorites: [1, 3, 5],
                    uploads: [2, 4],
                    history: [1, 2, 3]
                },
                {
                    id: 2,
                    username: '艺术爱好者',
                    phone: '13900139000',
                    password: '123456',
                    joinDate: '2024-01-20',
                    favorites: [2, 4, 6],
                    uploads: [1, 3, 5],
                    history: [4, 5, 6]
                }
            ];
            
            localStorage.setItem('users', JSON.stringify(testUsers));
        }
    }
    
    // 登录功能
    login(phone, password, captchaInput) {
        console.log('🔐 尝试登录:', phone);
        
        // 基础验证
        if (!phone || !password || !captchaInput) {
            this.showToast('请输入完整信息', 'error');
            return false;
        }
        
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            this.showToast('手机号格式不正确', 'error');
            return false;
        }
        
        if (password.length < 6) {
            this.showToast('密码至少6位', 'error');
            return false;
        }
        
        if (captchaInput.length !== 4) {
            this.showToast('验证码为4位', 'error');
            return false;
        }
        
        // 验证验证码
        if (!validateCaptcha(captchaInput)) {
            this.showToast('验证码错误', 'error');
            return false;
        }
        
        // 获取用户数据
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.phone === phone && u.password === password);
        
        if (user) {
            // 登录成功
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // 记录登录时间
            user.lastLogin = new Date().toISOString();
            this.updateUser(user);
            
            this.showToast('登录成功！', 'success');
            return true;
        } else {
            this.showToast('手机号或密码错误', 'error');
            return false;
        }
    }
    
    // 注册功能
    register(userData, captchaInput) {
        const { phone, username, password, confirmPassword } = userData;
        
        // 基础验证
        if (!phone || !username || !password || !confirmPassword || !captchaInput) {
            this.showToast('请填写完整信息', 'error');
            return false;
        }
        
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            this.showToast('手机号格式不正确', 'error');
            return false;
        }
        
        if (username.length < 2) {
            this.showToast('用户名至少2位', 'error');
            return false;
        }
        
        if (password.length < 6) {
            this.showToast('密码至少6位', 'error');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showToast('两次密码不一致', 'error');
            return false;
        }
        
        if (captchaInput.length !== 4) {
            this.showToast('验证码为4位', 'error');
            return false;
        }
        
        // 验证验证码
        if (!validateCaptcha(captchaInput)) {
            this.showToast('验证码错误', 'error');
            return false;
        }
        
        // 检查用户是否已存在
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.phone === phone)) {
            this.showToast('该手机号已注册', 'error');
            return false;
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now(),
            phone: phone,
            username: username,
            password: password,
            joinDate: new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString(),
            favorites: [],
            uploads: [],
            history: [],
            avatar: null,
            bio: '这个人很懒，什么都没有留下...'
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.currentUser = newUser;
        
        this.showToast('注册成功！', 'success');
        return true;
    }
    
    // 退出登录
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showToast('已退出登录', 'info');
    }
    
    // 检查登录状态
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    // 获取当前用户
    getCurrentUser() {
        if (!this.currentUser) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        }
        return this.currentUser;
    }
    
    // 加载当前用户
    loadCurrentUser() {
        this.currentUser = this.getCurrentUser();
    }
    
    // 更新用户信息
    updateUser(updatedUser) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));
            
            if (this.currentUser && this.currentUser.id === updatedUser.id) {
                this.currentUser = updatedUser;
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
        }
    }
    
    // 重定向到登录页
    redirectToLogin() {
        this.showToast('请先登录', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    // Toast通知
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2ecc71' : 
                        type === 'error' ? '#e74c3c' : 
                        type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// 创建全局实例
window.authSystem = new AuthSystem();

// 导出兼容函数
window.loginUser = function(phone, password, captchaInput) {
    return authSystem.login(phone, password, captchaInput);
};

window.registerUser = function(userData, captchaInput) {
    return authSystem.register(userData, captchaInput);
};

window.logoutUser = function() {
    return authSystem.logout();
};

window.checkAuth = function() {
    if (!authSystem.isLoggedIn()) {
        authSystem.redirectToLogin();
        return false;
    }
    return true;
};