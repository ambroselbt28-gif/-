document.addEventListener('DOMContentLoaded', () => {

    const game = {
        state: {},
        worldData: {},
        rules: {},

        async init() {
            this.logMessage('正在初始化游戏...');
            
            // Load the main world book manifest
            this.worldData = await this.loadYamlFile('../世界书/红尘卷书.yaml');
            if (!this.worldData) {
                this.logMessage('错误: 无法加载世界书主文件。');
                return;
            }
            this.logMessage('世界书主文件加载成功。');

            // Find and load the variable update rules
            const updateRulesEntry = this.worldData.条目.find(e => e.名称 === '变量更新规则' && e.启用);
            if (updateRulesEntry) {
                const rulesPath = `../世界书/${updateRulesEntry.文件}.txt`; // Assuming .txt extension
                const rulesData = await this.loadYamlFile(rulesPath);
                if (rulesData) {
                    this.rules = rulesData.变量更新规则;
                    this.logMessage('变量更新规则加载成功。');
                    this.initializeGameState();
                } else {
                    this.logMessage(`错误: 无法加载变量更新规则文件: ${rulesPath}`);
                }
            } else {
                this.logMessage('错误: 在世界书中未找到启用的“变量更新规则”。');
            }

            this.addEventListeners();
            this.updateUI();
        },

        initializeGameState() {
            this.state = {
                round: 0,
                log: ['游戏初始化完成。', '点击“结束回合”开始游戏'],
                // These are from the old static state, will be replaced by dynamic values
                resources: {
                    gold: 1000,
                    food: 1000,
                    lock: 0,
                    kiss: 1,
                    goblin: 100,
                    sword: 0,
                    orb: 0,
                    sparkle: 0
                }
            };

            for (const key in this.rules) {
                const rule = this.rules[key];
                const initialValueMatch = rule.range.match(/初始值为(-?\d+)/);
                let initialValue = null;

                if (initialValueMatch) {
                    initialValue = Number(initialValueMatch[1]);
                } else if (rule.type === 'string') {
                    initialValue = '';
                } else if (rule.type === 'boolean') {
                    const falseMatch = rule.range.match(/初始值为false/);
                    initialValue = !falseMatch;
                } else if (rule.type === 'array') {
                    initialValue = [];
                } else if (rule.type === 'object') {
                    initialValue = {};
                }

                // Set nested state property
                const keys = key.split('.');
                let current = this.state;
                for (let i = 0; i < keys.length - 1; i++) {
                    current = current[keys[i]] = current[keys[i]] || {};
                }
                current[keys[keys.length - 1]] = initialValue;
            }
            
            // Set initial time
            if (this.state.世界 && this.state.世界.当前时间 === '') {
                this.state.世界.当前时间 = '1074年1月1日 星期日 上午 08:00';
            }

            this.logMessage('游戏状态已根据规则初始化。');
            console.log('Initialized Game State:', this.state);
        },

        async loadYamlFile(filePath) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const yamlText = await response.text();
                return jsyaml.load(yamlText);
            } catch (error) {
                console.error(`Error loading/parsing YAML ${filePath}:`, error);
                return null;
            }
        },

        addEventListeners() {
            document.getElementById('btn-end-turn').addEventListener('click', () => this.endTurn());
        },

        endTurn() {
            if (this.state.round === 0) {
                this.state.log = ["游戏开始！"];
            }
            this.state.round++;
            
            // --- Game Logic for the turn happens here ---
            this.advanceTime();

            this.logMessage(`第${this.state.round}回合结束。`);
            this.updateUI();
        },

        advanceTime() {
            // Simple time advancement: add 2 hours
            const currentTime = this.state.世界.当前时间;
            const timeRegex = /(\d{4}年\d{1,2}月\d{1,2}日) (星期.) (上午|下午) (\d{2}):(\d{2})/;
            const match = currentTime.match(timeRegex);

            if (match) {
                let [_, date, day, period, hour, minute] = match;
                let hourNum = parseInt(hour);

                hourNum += 2;

                if (period === '上午' && hourNum >= 12) {
                    period = '下午';
                    if (hourNum > 12) hourNum -= 12;
                } else if (period === '下午' && hourNum >= 12) {
                    // This simple logic doesn't handle day change yet
                    period = '晚上'; // Or handle day change
                }
                
                hour = String(hourNum).padStart(2, '0');
                this.state.世界.当前时间 = `${date} ${day} ${period} ${hour}:${minute}`;
                this.logMessage('时间过去了2小时...');
            }
        },

        logMessage(message) {
            if (!this.state.log) this.state.log = [];
            this.state.log.push(message);
            this.updateUI(); // Update UI every time a message is logged
        },

        updateUI() {
            // Update static elements
            document.querySelector('.round-info').textContent = `第${this.state.round || 0}回合`;
            document.querySelector('.date-display').textContent = this.state.世界?.当前时间 || '加载中...';

            // Update resource stats (example)
            for (const key in this.state.resources) {
                const element = document.getElementById(`stat-${key}`);
                if (element) {
                    let value = this.state.resources[key];
                    if (value >= 1000) {
                        value = `${(value / 1000).toFixed(1)}k`.replace('.0', '');
                    }
                    element.textContent = value;
                }
            }

            // Update log box
            const logContent = document.getElementById('log-content');
            if (logContent && this.state.log) {
                logContent.innerHTML = '';
                this.state.log.forEach(message => {
                    const p = document.createElement('p');
                    p.textContent = message;
                    logContent.appendChild(p);
                });
                logContent.scrollTop = logContent.scrollHeight; // Scroll to bottom
            }
        }
    };

    game.init();

});
