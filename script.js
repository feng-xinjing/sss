const i18n = {
    translations: {},
    currentLang: '',

    // 初始化语言 | Initialize language
    async init() {
        console.info('(开始初始化语言环境) | Starting to initialize the language environment');
        const userPref = localStorage.getItem('userLangPreference');
        const browserLang = 'zh-CN';  // 强制设置为中文

        console.info(`(检测到原始浏览器语言: ${browserLang}) | Detected original browser language: ${browserLang}`);
        this.currentLang = browserLang || userPref;
        console.info(`(最终使用的语言: ${this.currentLang}) | Final language to be used: ${this.currentLang}`);
        try {
            await this.loadTranslations(this.currentLang);
            console.info(`(成功加载 ${this.currentLang} 语言文件) | Successfully loaded the ${this.currentLang} language file`);
        } catch (error) {
            console.warn(`(加载 ${this.currentLang} 语言文件失败，默认加载 en.json) | Failed to load the ${this.currentLang} language file, loading en.json by default`);
            await this.loadTranslations('en');
        }

        this.applyTranslations();
        console.info('(已应用语言翻译到页面) | Applied language translations to the page');
        return this.translations;
    },

    // 加载语言文件 | Load translations
    async loadTranslations(lang) {
        const filePath = `i18n/${lang}.json`;
        console.info(`(尝试加载语言文件路径: ${filePath}) | Trying to load the language file from path: ${filePath}`);
        try {
            const response = await fetch(filePath);
            this.translations = await response.json();
            console.info(`(成功加载语言: ${lang}) | Successfully loaded language: ${lang}`);
        } catch (error) {
            console.error(`(解析 ${lang}.json 文件时出错: ${error.message}) | Error parsing the ${lang}.json file: ${error.message}`, error);
            throw new Error(`(加载 ${lang} 失败) | Failed to load ${lang}`);
        }
    },

    // 应用翻译到页面上 | Apply translations to the page
    applyTranslations() {
        console.info('(开始应用语言翻译到页面元素) | Starting to apply language translations to page elements');
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach((element) => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translations[key];
            if (translation) {
                element.textContent = translation;
                console.debug(`(已将 ${key} 翻译应用到元素) | Applied the translation of ${key} to the element`);
            }
        });
    },

    // 切换语言 | Switch language
    async switchLanguage(lang) {
        console.info(`(开始切换语言到 ${lang}) | Starting to switch the language to ${lang}`);
        this.currentLang = lang;
        localStorage.setItem('userLangPreference', lang);
        await this.loadTranslations(lang);
        this.applyTranslations();
        console.info(`(已成功切换语言到 ${lang}) | Successfully switched the language to ${lang}`);
    },

    template(str, data) {
        console.debug('(开始执行模板替换操作) | Starting the template replacement operation');
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            const value = data[key]? data[key] : '';
            console.debug(`(替换模板中的 ${key} 为: ${value}) | Replaced ${key} in the template with: ${value}`);
            return value;
        });
    }
};


// 页面加载完成后执行初始化操作 | Perform initialization operations after the page is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.info('(页面加载完成，开始初始化操作) | Page loaded, starting initialization operations');
    // 初始化语言环境
    await i18n.init();
   

    // 获取元素引用 | Get elements
    const elements = {
        nameInput: document.getElementById('usernameInput'),
        confirmButton: document.getElementById('confirmNameButton'),
        questionText: document.getElementById('question'),
        yesButton: document.getElementById('yes'),
        noButton: document.getElementById('no'),
        nameInputContainer: document.getElementById('nameInputContainer'),
        confessionContainer: document.getElementById('confessionContainer'),
        mainImage: document.getElementById('mainImage')
    };
    console.info('(已获取页面元素引用) | Successfully obtained references to page elements', elements);

    
    let clickCount = 0; // 记录点击 No 的次数 | Record the number of clicks on the No button
    // No 按钮点击事件 | No button click event
    elements.noButton.addEventListener('click', function () {
        clickCount++;
        console.info(`(用户点击了 No 按钮，点击次数: ${clickCount}) | User clicked the No button, click count: ${clickCount}`);
        // 让 Yes 变大，每次放大 2 倍 | Make Yes button bigger, double the size each time
        let yesSize = 1 + clickCount * 1.2;
        elements.yesButton.style.transform = `scale(${yesSize})`;
        console.info(`(将 Yes 按钮放大到 ${yesSize} 倍) | Scaled the Yes button to ${yesSize} times`);
        // 挤压 No 按钮，每次右移 50px | Squeeze the No button and move it 50px to the right each time
        let noOffset = clickCount * 50;
        elements.noButton.style.transform = `translateX(${noOffset}px)`;
        console.info(`(将 No 按钮右移 ${noOffset}px) | Moved the No button ${noOffset}px to the right`);
        // 让图片和文字往上移动 | Move the image and text up
        let moveUp = clickCount * 25;
        elements.mainImage.style.transform = `translateY(-${moveUp}px)`;
        elements.questionText.style.transform = `translateY(-${moveUp}px)`;
        console.info(`(将图片和文字上移 ${moveUp}px) | Moved the image and text up by ${moveUp}px`);
        // 更新 No 按钮文字（前 5 次） | Update the text of the No button (first 5 times)
        if (i18n.translations.noTexts && clickCount <= i18n.translations.noTexts.length) {
            elements.noButton.innerText = i18n.translations.noTexts[clickCount - 1];
            console.info(`(更新 No 按钮文字为: ${elements.noButton.innerText}) | Updated the text of the No button to: ${elements.noButton.innerText}`);
        }
        // 使用映射更新图片 | Update the image using the mapping
        const imageMap = {
            1: "assets/images/shocked.webp",  // 震惊
            2: "assets/images/think.webp",    // 思考
            3: "assets/images/angry.webp",    // 生气
            4: "assets/images/crying.webp",   // 哭
        };
        if (clickCount in imageMap) {
            elements.mainImage.src = imageMap[clickCount];
            console.info(`(将主图片更新为: ${imageMap[clickCount]}) | Updated the main image to: ${imageMap[clickCount]}`);
        } else if (clickCount >= 5) {
            elements.mainImage.src = "assets/images/crying.webp";
            console.info('(将主图片更新为哭泣图片) | Updated the main image to the crying image');
        }
    });

    // Yes 按钮点击事件，进入表白成功页面 | Yes button click event, enter the successful confession page
    const loveTest = (username) => i18n.template(i18n.translations.loveMessage, { username: username });
    elements.yesButton.addEventListener('click', function () {
        console.info('(用户点击了 Yes 按钮) | User clicked the Yes button');
        
        // 确保用户名安全地插入 | Ensure the username is inserted safely
        document.body.innerHTML = `
            <div class="yes-screen">
                <h1 class="yes-text"></h1>
                <img src="assets/images/hug.webp" alt="Hug" class="yes-image">
            </div>
        `;
        console.info('(已替换页面内容为表白成功页面) | Replaced the page content with the successful confession page');
        // 确保用户名安全地插入
        document.querySelector(".yes-text").innerText = loveTest();
        
        // 禁止滚动，保持页面美观 | Disable scrolling to keep the page beautiful
        document.body.style.overflow = "hidden";
        console.info('(已禁止页面滚动) | Disabled page scrolling');
        // 给表白成功页面添加慢慢浮现动画类名 | Add a fade-in animation class name to the successful confession page
        document.querySelector('.yes-screen').classList.add('fade-in');
        console.info('(已为表白成功页面添加渐显动画效果) | Added fade-in animation effect to the successful confession page');
    });
});