// captcha.js - 图形验证码生成系统
class CaptchaSystem {
    constructor(options = {}) {
        this.options = {
            width: options.width || 120,
            height: options.height || 50,
            length: options.length || 4,
            chars: options.chars || 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // 去掉了容易混淆的字符
            bgColors: options.bgColors || ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
            textColor: options.textColor || '#ffffff',
            fontSize: options.fontSize || 24,
            fontFamily: options.fontFamily || 'Arial, sans-serif',
            noise: options.noise !== false,
            lines: options.lines !== false,
            ...options
        };
        
        this.currentCode = '';
    }
    
    // 生成随机验证码
    generateCode() {
        let code = '';
        const chars = this.options.chars;
        
        for (let i = 0; i < this.options.length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        this.currentCode = code;
        return code;
    }
    
    // 生成SVG验证码图片
    generateSVG(code = null) {
        if (!code) {
            code = this.generateCode();
        }
        
        const width = this.options.width;
        const height = this.options.height;
        
        // 随机背景色
        const bgColor = this.options.bgColors[
            Math.floor(Math.random() * this.options.bgColors.length)
        ];
        
        // 创建SVG字符串
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        
        // 背景
        svg += `<rect width="100%" height="100%" fill="${bgColor}" rx="8"/>`;
        
        // 干扰线
        if (this.options.lines) {
            svg += this._generateLines(width, height);
        }
        
        // 验证码文字
        svg += this._generateText(code, width, height);
        
        // 噪点
        if (this.options.noise) {
            svg += this._generateNoise(width, height);
        }
        
        svg += '</svg>';
        
        return svg;
    }
    
    // 生成完整的验证码（包含SVG和代码）
    generateCaptcha() {
        const code = this.generateCode();
        const svg = this.generateSVG(code);
        
        return {
            code: code,
            svg: svg,
            dataURL: 'data:image/svg+xml,' + encodeURIComponent(svg)
        };
    }
    
    // 生成干扰线
    _generateLines(width, height) {
        let lines = '';
        const lineCount = Math.floor(Math.random() * 3) + 2; // 2-4条线
        
        for (let i = 0; i < lineCount; i++) {
            const x1 = Math.random() * width;
            const y1 = Math.random() * height;
            const x2 = Math.random() * width;
            const y2 = Math.random() * height;
            
            lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                           stroke="rgba(255,255,255,0.3)" stroke-width="1" 
                           stroke-linecap="round"/>`;
        }
        
        return lines;
    }
    
    // 生成验证码文字
    _generateText(code, width, height) {
        let text = '<g>';
        const charWidth = width / (code.length + 1);
        
        for (let i = 0; i < code.length; i++) {
            const char = code.charAt(i);
            const x = charWidth * (i + 0.5);
            const y = height / 2 + (Math.random() * 10 - 5); // 轻微垂直偏移
            const rotate = Math.random() * 30 - 15; // -15° 到 15° 旋转
            
            text += `<text x="${x}" y="${y}" 
                          font-family="${this.options.fontFamily}" 
                          font-size="${this.options.fontSize}" 
                          font-weight="bold" 
                          fill="${this.options.textColor}" 
                          text-anchor="middle" 
                          dominant-baseline="middle"
                          transform="rotate(${rotate} ${x} ${y})"
                          style="user-select: none;">
                        ${char}
                    </text>`;
        }
        
        text += '</g>';
        return text;
    }
    
    // 生成噪点
    _generateNoise(width, height) {
        let noise = '';
        const dotCount = Math.floor(Math.random() * 20) + 10; // 10-30个噪点
        
        for (let i = 0; i < dotCount; i++) {
            const cx = Math.random() * width;
            const cy = Math.random() * height;
            const r = Math.random() * 2 + 0.5; // 0.5-2.5半径
            
            noise += `<circle cx="${cx}" cy="${cy}" r="${r}" 
                             fill="rgba(255,255,255,0.2)"/>`;
        }
        
        return noise;
    }
    
    // 验证输入
    validateCaptcha(input, caseSensitive = false) {
        if (!input || !this.currentCode) return false;
        
        if (caseSensitive) {
            return input === this.currentCode;
        } else {
            return input.toUpperCase() === this.currentCode.toUpperCase();
        }
    }
    
    // 获取当前验证码
    getCurrentCode() {
        return this.currentCode;
    }
    
    // 批量生成验证码（用于调试）
    generateBatch(count = 5) {
        const captchas = [];
        for (let i = 0; i < count; i++) {
            captchas.push(this.generateCaptcha());
        }
        return captchas;
    }
}

// 创建全局实例
window.captchaSystem = new CaptchaSystem();

// 导出兼容函数
window.generateCaptcha = function() {
    return captchaSystem.generateCaptcha();
};

window.validateCaptcha = function(input, caseSensitive = false) {
    return captchaSystem.validateCaptcha(input, caseSensitive);
};

window.getCurrentCaptchaCode = function() {
    return captchaSystem.getCurrentCode();
};