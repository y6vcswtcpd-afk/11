// utils.js - 工具函数库
class Utils {
    // 手机号验证
    static validatePhone(phone) {
        return /^1[3-9]\d{9}$/.test(phone);
    }
    
    // 邮箱验证
    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // 密码强度验证
    static validatePassword(password) {
        return password.length >= 6;
    }
    
    // 格式化日期
    static formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    }
    
    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // 本地存储封装
    static storage = {
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('存储失败:', e);
                return false;
            }
        },
        
        get: function(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('读取失败:', e);
                return null;
            }
        },
        
        remove: function(key) {
            localStorage.removeItem(key);
        },
        
        clear: function() {
            localStorage.clear();
        }
    };
}

// 创建全局工具函数
window.utils = Utils;

// 导出常用函数
window.validatePhone = Utils.validatePhone;
window.validateEmail = Utils.validateEmail;
window.validatePassword = Utils.validatePassword;
window.debounce = Utils.debounce;
window.throttle = Utils.throttle;
window.storage = Utils.storage;