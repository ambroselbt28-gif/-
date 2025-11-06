document.addEventListener('DOMContentLoaded', () => {

    const game = {
        state: {},
        worldData: {},
        rules: {},
        characterSettings: {},
        playerSettings: {},
        backgroundSettings: {},
        taskSettings: {},

        async init() {
            // 检查 jsyaml 库是否加载成功
            if (typeof jsyaml === 'undefined') {
                this.logMessage('system', '错误: YAML 解析库加载失败。请检查网络连接或使用本地版本。');
                alert('游戏初始化失败：无法加载必要的库文件。请检查网络连接后刷新页面。');
                return;
            }

            this.logMessage('system', '游戏引擎初始化...');
            await this.loadGameData();
            this.initializeGameState();
            this.addEventListeners();
            this.updateUI();
            this.renderLeftPanel('inventory'); // 默认显示背包
            this.logMessage('system', '引擎准备就绪。');

            // 显示开场白
            setTimeout(() => this.showOpeningScene(), 1000);
        },

        async loadGameData() {
            this.logMessage('system', '正在加载世界数据...');
            try {
                const configPath = '../反派逆袭系统指南.yaml';
                this.logMessage('system', `正在尝试加载配置文件: ${configPath}`);

                const config = await this.loadYamlFile(configPath);
                if (!config) {
                    this.logMessage('system', `错误: 无法加载配置文件: ${configPath}`);
                    this.logMessage('system', '提示: 请确保文件路径正确，且文件格式为有效的 YAML。');
                    return;
                }
                this.worldData.config = config;
                this.logMessage('system', '配置文件加载成功。');

                if (config.character_book && config.character_book.entries) {
                    const totalEntries = config.character_book.entries.filter(e => e.enabled !== false).length;
                    let loadedCount = 0;

                    for (const entry of config.character_book.entries) {
                        if (entry.enabled === false) continue;

                        let filePath = `../${entry.content}`;
                        this.logMessage('system', `正在加载 [${loadedCount + 1}/${totalEntries}]: ${entry.comment || entry.content}`);

                        // 检查文件是否存在并获取正确扩展名
                        let finalFilePath = '';
                        const extensions = ['.xyaml', '.md', '.txt', ''];
                        for (const ext of extensions) {
                            try {
                                const testResponse = await fetch(filePath + ext, { method: 'HEAD' });
                                if (testResponse.ok) {
                                    finalFilePath = filePath + ext;
                                    break;
                                }
                            } catch (e) {} // Ignore network errors for HEAD requests
                        }

                        if (!finalFilePath) {
                            this.logMessage('system', `警告: 找不到文件: ${entry.content} (已尝试扩展名: ${extensions.join(', ')})`);
                            continue;
                        }

                        let content;
                        try {
                            if (finalFilePath.endsWith('.md') || finalFilePath.endsWith('.txt')) {
                                const response = await fetch(finalFilePath);
                                if (!response.ok) throw new Error(`HTTP 错误! 状态码: ${response.status}`);
                                content = await response.text();
                            } else { // 默认处理 .xyaml
                                content = await this.loadYamlFile(finalFilePath);
                            }
                        } catch (error) {
                            this.logMessage('system', `错误: 加载文件失败 ${finalFilePath} - ${error.message}`);
                            continue;
                        }

                        if (content) {
                            if (entry.comment === '变量更新规则') {
                                this.rules = content.变量更新规则;
                            } else if (entry.comment.startsWith('角色设定_')) {
                                const charName = entry.comment.replace('角色设定_', '');
                                this.characterSettings[charName] = content;
                            } else if (entry.comment.startsWith('玩家角色_')) {
                                this.playerSettings = content;
                            } else if (entry.comment === '背景设定') {
                                this.backgroundSettings = content;
                            } else if (entry.comment === '当前任务') {
                                this.taskSettings = content;
                            }
                            loadedCount++;
                        }
                    }
                    this.logMessage('system', `已成功加载 ${loadedCount}/${totalEntries} 个数据文件。`);
                }
                this.logMessage('system', '世界数据加载完成。');
            } catch (error) {
                console.error("加载游戏数据时出错:", error);
                this.logMessage('system', `错误: 加载世界数据失败。${error.message || '详情请查看控制台。'}`);
            }
        },

        initializeGameState() {
            this.logMessage('system', '正在初始化游戏状态...');

            // 使用变量初始化文件中的默认值
            this.state = {
                round: 0,
                世界: {
                    时间: '2025-06-02T17:21:00',
                    剧情经过时间_分钟: 0,
                    当前地点: '天机阁',
                    当前互动角色: []
                },
                玩家: {
                    境界: '筑基十一层',
                    反派值: 0,
                    当前拥有的物品: ['无'],
                    当前拥有的技能: ['无']
                },
                天命主角: {
                    夜玄宸: { 气运值: 10000, 流派: '仙帝重生流' },
                    龙战: { 气运值: 8000, 流派: '兵王流' },
                    顾淮安: { 气运值: 5000, 流派: '重生流' },
                    秦逸: { 气运值: 3000, 流派: '神豪系统流' },
                    楚凡: { 气运值: 2000, 流派: '签到系统流' },
                    江沐辰: { 气运值: 4000, 流派: '神医下山流' },
                    叶瞳: { 气运值: 1000, 流派: '透视异能流' },
                    凌云: { 气运值: 1500, 流派: '玉佩老爷爷流' },
                    沈岸: { 气运值: 500, 流派: '文抄公系统流' }
                },
                女性角色: {
                    墨诗语: { 好感度: 90, 身体状态: '健康，精神状态良好。', 心理状态: '对父亲充满依恋，心中始终牵挂着家族的事务。', 与主角关系: '女儿' },
                    墨云曦: { 好感度: 90, 身体状态: '健康，气色红润。', 心理状态: '活泼开朗，对父亲的决策充满信心，内心对未来充满期待。', 与主角关系: '女儿' },
                    墨灵儿: { 好感度: 90, 身体状态: '健康，体态轻盈。', 心理状态: '天真可爱，对父亲的话言听计从，心中充满对父亲的崇拜。', 与主角关系: '女儿' },
                    秦岚: { 好感度: 95, 身体状态: '健康，职业装下身姿曼妙，眼神专注。', 心理状态: '忠诚且高效，将阁主的命令视为最高准则，内心对阁主充满敬意。', 与主角关系: '助理' },
                    慕容冰岚: { 好感度: 0, 身体状态: '健康，气质冷艳高贵。', 心理状态: '警惕而理性，对突然的关注感到疑惑，内心保持着商业女性的精明。', 与主角关系: '陌生人' },
                    苏清漪: { 好感度: 0, 身体状态: '健康，气质清雅。', 心理状态: '平静淡然，对外界保持距离，内心对修炼充满执着。', 与主角关系: '陌生人' },
                    萧若烟: { 好感度: 0, 身体状态: '健康，身姿妖娆。', 心理状态: '神秘莫测，对周围的一切保持观察，内心隐藏着不为人知的秘密。', 与主角关系: '陌生人' },
                    洛凝霜: { 好感度: 0, 身体状态: '健康，气质清冷。', 心理状态: '冷漠疏离，对他人保持警戒，内心封闭着过往的伤痛。', 与主角关系: '陌生人' },
                    林幼薇: { 好感度: 0, 身体状态: '健康，容颜清秀。', 心理状态: '温柔善良，对世界充满好奇，内心渴望被理解和保护。', 与主角关系: '陌生人' },
                    上官千雪: { 好感度: 0, 身体状态: '健康，气质高贵。', 心理状态: '骄傲自信，对自己的身份感到自豪，内心渴望证明自己的价值。', 与主角关系: '陌生人' },
                    柳如是: { 好感度: 0, 身体状态: '健康，风韵犹存。', 心理状态: '成熟知性，对人情世故了如指掌，内心藏着温柔与智慧。', 与主角关系: '陌生人' },
                    苏媚瑶: { 好感度: 0, 身体状态: '健康，身姿婀娜。', 心理状态: '妩媚动人，善于察言观色，内心渴望找到真正理解她的人。', 与主角关系: '陌生人' },
                    顾倾城: { 好感度: 60, 身体状态: '健康，肤若凝脂，眼神中带着一丝羞涩。', 心理状态: '对你产生好感，内心既期待又紧张，常常会想起与你的每一次交谈。', 与主角关系: '暧昧' }
                },
                当前任务: {
                    任务内容: '赶在龙战之前，不惜一切代价，夺得《龙象镇狱功》完整古卷。',
                    任务奖励: '反派值+2500，您将获得并解锁《龙象镇狱功》的修炼权限。',
                    任务时限: '24小时'
                }
            };

            this.logMessage('system', '游戏状态已初始化完成。');
            this.logMessage('system', `当前境界: ${this.state.玩家.境界}, 反派值: ${this.state.玩家.反派值}`);
            console.log('Initialized Game State:', this.state);
        },

        async loadYamlFile(filePath) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`文件不存在: ${filePath}`);
                    }
                    throw new Error(`HTTP 错误! 状态码: ${response.status}`);
                }
                const yamlText = await response.text();

                if (!yamlText || yamlText.trim() === '') {
                    throw new Error(`文件为空: ${filePath}`);
                }

                try {
                    return jsyaml.load(yamlText);
                } catch (yamlError) {
                    throw new Error(`YAML 解析失败: ${yamlError.message}`);
                }
            } catch (error) {
                console.error(`加载或解析YAML文件时出错 ${filePath}:`, error);
                this.logMessage('system', `文件加载错误: ${filePath} - ${error.message}`);
                return null;
            }
        },

        addEventListeners() {
            const btnSend = document.getElementById('btn-send');
            const dialogueInput = document.getElementById('dialogue-input');
            const leftNav = document.getElementById('left-nav');

            if (!btnSend || !dialogueInput || !leftNav) {
                this.logMessage('system', '错误: 无法找到必要的 UI 元素。页面可能损坏。');
                console.error('Missing UI elements:', { btnSend, dialogueInput, leftNav });
                return;
            }

            btnSend.addEventListener('click', () => this.processUserInput());
            dialogueInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.processUserInput();
            });

            leftNav.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-btn')) {
                    const panelType = e.target.dataset.panel;
                    this.renderLeftPanel(panelType);
                }
            });
        },

        renderLeftPanel(panelType) {
            const contentDiv = document.getElementById('left-panel-content');
            let html = '';

            document.querySelectorAll('#left-nav .nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.panel === panelType);
            });

            switch (panelType) {
                case 'inventory':
                    html = `<h3>背包物品</h3><div class="panel-list">`;
                    const items = Array.isArray(this.state.玩家?.当前拥有的物品)
                        ? this.state.玩家.当前拥有的物品
                        : (this.state.玩家?.当前拥有的物品?.split(';') || ['无']);
                    items.forEach(item => {
                        if (item && item !== '无') {
                            html += `<div class="panel-item">📦 ${item}</div>`;
                        }
                    });
                    if (items.length === 0 || (items.length === 1 && items[0] === '无')) {
                        html += `<div class="panel-item-empty">暂无物品</div>`;
                    }
                    html += `</div>`;
                    break;

                case 'protagonists':
                    html = `<h3>天命主角</h3><div class="panel-list">`;
                    const protagonists = Object.entries(this.state.天命主角).sort((a, b) => b[1].气运值 - a[1].气运值);
                    protagonists.forEach(([name, char]) => {
                        const percentage = Math.floor((char.气运值 / 30000) * 100);
                        html += `
                            <div class="panel-item">
                                <div class="char-name">⚔️ ${name}</div>
                                <div class="char-detail">流派: ${char.流派}</div>
                                <div class="char-detail">气运值: ${char.气运值} / 30000</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${percentage}%"></div>
                                </div>
                            </div>`;
                    });
                    html += `</div>`;
                    break;

                case 'characters':
                    html = `<h3>女性角色</h3><div class="panel-list">`;
                    const characters = Object.entries(this.state.女性角色).sort((a, b) => b[1].好感度 - a[1].好感度);
                    characters.forEach(([name, char]) => {
                        const percentage = Math.floor(((char.好感度 + 100) / 200) * 100);
                        const heartIcon = char.好感度 >= 80 ? '❤️' : char.好感度 >= 40 ? '💗' : char.好感度 >= 0 ? '💛' : '💔';
                        html += `
                            <div class="panel-item character-item" data-character="${name}" onclick="game.showCharacterDetail('${name}')">
                                <div class="char-name">${heartIcon} ${name}</div>
                                <div class="char-detail">关系: ${char.与主角关系}</div>
                                <div class="char-detail">好感度: ${char.好感度}</div>
                                <div class="progress-bar">
                                    <div class="progress-fill favor" style="width: ${percentage}%"></div>
                                </div>
                                <div class="char-hint">点击查看详情</div>
                            </div>`;
                    });
                    html += `</div>`;
                    break;

                case 'skills':
                    html = `<h3>技能功法</h3><div class="panel-list">`;
                    const skills = Array.isArray(this.state.玩家?.当前拥有的技能)
                        ? this.state.玩家.当前拥有的技能
                        : (this.state.玩家?.当前拥有的技能?.split(';') || ['无']);
                    skills.forEach(skill => {
                        if (skill && skill !== '无') {
                            html += `<div class="panel-item">✨ ${skill}</div>`;
                        }
                    });
                    if (skills.length === 0 || (skills.length === 1 && skills[0] === '无')) {
                        html += `<div class="panel-item-empty">暂无技能</div>`;
                    }
                    html += `</div>`;
                    break;

                default:
                    html = '<div class="panel-item-empty">请选择一个面板</div>';
            }
            contentDiv.innerHTML = html;
        },

        processUserInput() {
            const inputField = document.getElementById('dialogue-input');
            const inputText = inputField.value.trim();
            if (inputText === '') return;

            this.logMessage('user', inputText);
            inputField.value = '';

            // 检查是否是系统指令
            if (this.handleSystemCommand(inputText)) {
                return;
            }

            // 否则作为对话处理，生成动态提示词并发送给AI
            this.handleDialogue(inputText);
        },

        handleSystemCommand(input) {
            const lowerInput = input.toLowerCase();
            let systemResponse = null;

            switch (lowerInput) {
                case '状态':
                case 'status':
                    systemResponse = this.getStatusReport();
                    break;
                case '帮助':
                case 'help':
                    systemResponse = this.getHelpText();
                    break;
                case '保存':
                case 'save':
                    this.saveGameState();
                    systemResponse = '游戏状态已保存到浏览器本地存储。';
                    break;
                case '加载':
                case 'load':
                    if (this.loadGameState()) {
                        systemResponse = '游戏状态已从本地存储加载。';
                        this.updateUI();
                        this.renderLeftPanel('inventory');
                    } else {
                        systemResponse = '未找到保存的游戏状态。';
                    }
                    break;
                case '开场':
                case 'opening':
                    this.showOpeningScene();
                    return true;
                default:
                    return false; // 不是系统指令
            }

            if (systemResponse) {
                setTimeout(() => { this.logMessage('system', systemResponse); }, 100);
                return true;
            }
            return false;
        },

        getStatusReport() {
            const player = this.state.玩家;
            const world = this.state.世界;
            return `=== 当前状态 ===
境界: ${player.境界}
反派值: ${player.反派值}
物品: ${player.当前拥有的物品}
技能: ${player.当前拥有的技能}

时间: ${world.时间}
地点: ${world.当前地点}
互动角色: ${world.当前互动角色 || '无'}

当前任务: ${this.state.当前任务?.任务内容 || '无'}`;
        },

        getHelpText() {
            return `=== 可用指令 ===
状态/status - 查看当前状态
帮助/help - 显示此帮助信息
保存/save - 保存游戏进度
加载/load - 加载游戏进度
开场/opening - 重新播放开场白

其他输入将作为对话发送给AI进行处理。`;
        },

        async handleDialogue(userInput) {
            // 生成动态提示词
            const prompt = this.generateDynamicPrompt(userInput);

            // 显示生成的提示词（调试用）
            console.log('Generated Prompt:', prompt);

            // 发送到酒馆AI
            await this.sendToTavern(prompt, userInput);
        },

        generateDynamicPrompt(userInput) {
            // 构建基础上下文
            const player = this.state.玩家;
            const world = this.state.世界;
            const task = this.state.当前任务;

            let baseContext = `# 当前游戏状态
- 玩家境界: ${player.境界}
- 反派值: ${player.反派值}
- 当前地点: ${world.当前地点}
- 当前时间: ${world.时间}
- 物品: ${player.当前拥有的物品}
- 技能: ${player.当前拥有的技能}`;

            if (task && task.任务内容 && task.任务内容 !== '无') {
                baseContext += `\n- 当前任务: ${task.任务内容}`;
            }

            // 根据当前互动角色添加特定指令
            let instruction = '';
            if (world.当前互动角色) {
                const char = this.characterSettings[world.当前互动角色];
                if (char) {
                    instruction = `\n\n# 当前互动角色
你正在扮演角色: ${world.当前互动角色}
角色信息: ${JSON.stringify(char, null, 2)}

玩家对你说: "${userInput}"

请根据当前游戏状态和角色设定，生成一个符合场景的回应。`;
                }
            } else {
                // 没有特定互动角色，作为旁白或系统回应
                instruction = `\n\n# 场景描述
玩家在${world.当前地点}，说了: "${userInput}"

请作为游戏旁白/系统，根据当前状态描述场景的变化或给出合适的反馈。`;
            }

            // 根据游戏规则添加变量更新提示
            let ruleHint = '\n\n# 重要规则';
            ruleHint += '\n请在你的回复末尾，使用以下格式标记任何状态变化：';
            ruleHint += '\n{{state_update::变量名=新值}}';
            ruleHint += '\n\n可更新的变量示例：';
            ruleHint += '\n- 玩家.反派值 - 玩家的反派值（数字）';
            ruleHint += '\n- 玩家.境界 - 玩家的修炼境界';
            ruleHint += '\n- 女性角色.角色名.好感度 - 角色对玩家的好感度（-100到100）';
            ruleHint += '\n- 女性角色.角色名.身体状态 - 角色的身体状况描述（50字左右）';
            ruleHint += '\n- 女性角色.角色名.心理状态 - 角色的内心想法和情绪（50字左右）';
            ruleHint += '\n- 女性角色.角色名.与主角关系 - 角色与主角的关系';
            ruleHint += '\n- 天命主角.主角名.气运值 - 天命主角的气运值';
            ruleHint += '\n\n注意：与角色互动后，必须更新该角色的身体状态和心理状态！';

            const finalPrompt = baseContext + instruction + ruleHint;
            return finalPrompt;
        },

        async sendToTavern(prompt, userInput) {
            // 检查是否在酒馆环境中且有TavernHelper API
            const isInTavern = typeof window !== 'undefined' &&
                             window.parent !== window &&
                             typeof TavernHelper !== 'undefined';

            if (isInTavern) {
                // 使用TavernHelper API与酒馆通信
                await this.sendViaTavernHelper(prompt, userInput);
            } else {
                // 独立运行模式，模拟AI回复
                this.simulateAIResponse(userInput);
            }
        },

        async sendViaTavernHelper(prompt, userInput) {
            try {
                this.logMessage('system', '正在向AI发送请求...');

                // 构建AI生成配置
                const generateConfig = {
                    injects: [{
                        role: 'user',
                        content: prompt,
                        position: 'in_chat',
                        should_scan: true
                    }],
                    should_stream: false
                };

                // 调用TavernHelper.generate发送到AI
                const aiResponse = await TavernHelper.generate(generateConfig);

                // 处理AI回复
                await this.processAIResponse(aiResponse);

                // 将游戏状态同步到消息数据中（同层游玩机制）
                await this.syncStateToMessages(aiResponse);

            } catch (error) {
                console.error('TavernHelper通信失败:', error);
                this.logMessage('system', `错误: AI通信失败 - ${error.message}`);
                // 降级到模拟模式
                this.simulateAIResponse(userInput);
            }
        },

        async syncStateToMessages(aiResponse) {
            try {
                // 获取第0层消息（同层游玩的状态存储层）
                const messages = await TavernHelper.getChatMessages('0');
                if (messages && messages.length > 0) {
                    const messageZero = messages[0];
                    messageZero.message = aiResponse; // AI回复文本
                    messageZero.data = {
                        game_state: this.state,
                        timestamp: new Date().toISOString()
                    };

                    // 静默更新，不刷新界面
                    await TavernHelper.setChatMessages([messageZero], { refresh: 'none' });
                    console.log('[同层游玩] 游戏状态已同步到消息层');
                }
            } catch (error) {
                console.error('[同层游玩] 状态同步失败:', error);
            }
        },

        // 旧的postMessage方法保留作为备用
        sendViaPostMessage(prompt, userInput) {
            const message = {
                type: 'TAVERN_GAME_ACTION',
                action: 'send_message',
                data: {
                    prompt: prompt,
                    userInput: userInput,
                    gameState: this.state
                }
            };

            // 发送消息到父窗口（酒馆）
            window.parent.postMessage(message, '*');

            this.logMessage('system', '已发送到AI，等待回复...');

            // 监听AI回复
            if (!this._messageListenerAdded) {
                window.addEventListener('message', (event) => this.handleTavernResponse(event));
                this._messageListenerAdded = true;
            }
        },

        handleTavernResponse(event) {
            // 验证消息来源和格式
            if (event.data && event.data.type === 'TAVERN_AI_RESPONSE') {
                const aiResponse = event.data.response;
                this.processAIResponse(aiResponse);
            }
        },

        simulateAIResponse(userInput) {
            // 独立运行时的模拟回复
            this.logMessage('system', '【模拟模式】正在生成AI回复...');

            setTimeout(() => {
                let response = '';
                const world = this.state.世界;

                // 检查是否提到了某个女性角色
                let mentionedCharacter = null;
                for (const charName in this.state.女性角色) {
                    if (userInput.includes(charName)) {
                        mentionedCharacter = charName;
                        break;
                    }
                }

                if (mentionedCharacter) {
                    const char = this.state.女性角色[mentionedCharacter];
                    response = `${mentionedCharacter}听到你的话，微微一笑。她的眼神中流露出一丝温柔，显然你的话语触动了她的心弦。`;

                    // 示例状态更新
                    const newFavor = char.好感度 + 2;
                    response += `\n\n{{state_update::女性角色.${mentionedCharacter}.好感度=${newFavor}}}`;
                    response += `\n{{state_update::女性角色.${mentionedCharacter}.身体状态=脸颊微红，眼神中带着一丝羞涩，呼吸略显急促。}}`;
                    response += `\n{{state_update::女性角色.${mentionedCharacter}.心理状态=心跳加速，对你的话语感到开心，内心涌起一股暖意，开始期待下次见面。}}`;
                } else if (world.当前地点 === '天机阁') {
                    response = `系统旁白：在天机阁中，你的话语回荡在空旷的大厅里。这里是你的根据地，是策划一切阴谋的起点。`;

                    // 随机增加反派值
                    if (Math.random() > 0.7) {
                        response += '\n\n{{state_update::玩家.反派值=' + (this.state.玩家.反派值 + 1) + '}}';
                    }
                } else {
                    response = `系统旁白：你说了"${userInput}"，周围的环境似乎没有太大变化。`;
                }

                this.processAIResponse(response);
            }, 1000);
        },

        processAIResponse(response) {
            // 提取状态更新指令
            const stateUpdatePattern = /\{\{state_update::(.+?)=(.+?)\}\}/g;
            let cleanResponse = response;
            let matches;

            while ((matches = stateUpdatePattern.exec(response)) !== null) {
                const varPath = matches[1].trim();
                const newValue = matches[2].trim();

                // 执行状态更新
                this.updateStateVariable(varPath, newValue);

                // 从显示的回复中移除状态更新标记
                cleanResponse = cleanResponse.replace(matches[0], '');
            }

            // 显示AI回复
            this.logMessage('ai', cleanResponse.trim());

            // 更新UI
            this.updateUI();
            this.renderLeftPanel('inventory');

            // 增加回合数
            this.state.round++;
        },

        updateStateVariable(varPath, newValue) {
            try {
                // 解析路径，例如 "玩家.反派值" -> ["玩家", "反派值"]
                const keys = varPath.split('.');
                let current = this.state;

                // 导航到目标位置
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }

                // 设置新值，尝试转换类型
                const finalKey = keys[keys.length - 1];
                let parsedValue = newValue;

                // 尝试解析为数字
                if (!isNaN(newValue)) {
                    parsedValue = Number(newValue);
                }
                // 尝试解析为布尔值
                else if (newValue.toLowerCase() === 'true') {
                    parsedValue = true;
                } else if (newValue.toLowerCase() === 'false') {
                    parsedValue = false;
                }
                // 尝试解析为JSON（数组或对象）
                else if ((newValue.startsWith('[') && newValue.endsWith(']')) ||
                         (newValue.startsWith('{') && newValue.endsWith('}'))) {
                    try {
                        parsedValue = JSON.parse(newValue);
                    } catch (e) {
                        // 保持字符串
                    }
                }

                current[finalKey] = parsedValue;

                this.logMessage('system', `状态更新: ${varPath} = ${parsedValue}`);
                console.log('State updated:', varPath, '=', parsedValue);
            } catch (error) {
                console.error('更新状态变量失败:', error);
                this.logMessage('system', `警告: 状态更新失败: ${varPath}`);
            }
        },

        logMessage(sender, message) {
            const logContent = document.getElementById('log-box');
            if (!logContent) return;
            const entry = document.createElement('div');
            entry.classList.add('log-entry', sender);
            entry.textContent = message;
            logContent.appendChild(entry);
            logContent.scrollTop = logContent.scrollHeight;
        },

        updateUI() {
            if (!this.state || !this.state.玩家) return;

            document.getElementById('status-jingjie').textContent = this.state.玩家.境界 || 'N/A';
            document.getElementById('status-fanpaizhi').textContent = this.state.玩家.反派值 || 0;
            document.getElementById('status-time').textContent = this.state.世界?.时间 || 'N/A';
            document.getElementById('status-location').textContent = this.state.世界?.当前地点 || '燕京';

            const task = this.state.当前任务;
            const taskDiv = document.getElementById('status-task');
            if (task && task.任务内容 && task.任务内容 !== '无') {
                taskDiv.innerHTML = `
                    <div class="status-item">
                        <span class="status-label">任务:</span>
                        <span class="status-value">${task.任务内容}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">奖励:</span>
                        <span class="status-value">${task.任务奖励}</span>
                    </div>
                     <div class="status-item">
                        <span class="status-label">时限:</span>
                        <span class="status-value">${task.任务时限}</span>
                    </div>
                `;
            } else {
                taskDiv.innerHTML = `<div class="status-item"><span class="status-value">无</span></div>`;
            }
        },

        saveGameState() {
            try {
                const saveData = {
                    state: this.state,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('villain_game_save', JSON.stringify(saveData));
                console.log('Game state saved:', saveData);
                return true;
            } catch (error) {
                console.error('保存游戏状态失败:', error);
                this.logMessage('system', '保存失败: ' + error.message);
                return false;
            }
        },

        loadGameState() {
            try {
                const saveData = localStorage.getItem('villain_game_save');
                if (!saveData) {
                    return false;
                }
                const parsed = JSON.parse(saveData);
                this.state = parsed.state;
                console.log('Game state loaded:', parsed);
                return true;
            } catch (error) {
                console.error('加载游戏状态失败:', error);
                this.logMessage('system', '加载失败: ' + error.message);
                return false;
            }
        },

        showCharacterDetail(characterName) {
            const char = this.state.女性角色[characterName];
            if (!char) return;

            const percentage = Math.floor(((char.好感度 + 100) / 200) * 100);
            const heartIcon = char.好感度 >= 80 ? '❤️' : char.好感度 >= 40 ? '💗' : char.好感度 >= 0 ? '💛' : '💔';

            // 创建弹窗
            const modal = document.createElement('div');
            modal.className = 'character-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${heartIcon} ${characterName}</h2>
                        <button class="modal-close" onclick="game.closeCharacterModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-section">
                            <h3>基本信息</h3>
                            <div class="detail-item">
                                <span class="detail-label">关系：</span>
                                <span class="detail-value">${char.与主角关系}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">好感度：</span>
                                <span class="detail-value">${char.好感度}</span>
                            </div>
                            <div class="progress-bar-large">
                                <div class="progress-fill favor" style="width: ${percentage}%"></div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3>💪 身体状态</h3>
                            <p class="status-description">${char.身体状态}</p>
                        </div>

                        <div class="detail-section">
                            <h3>💭 心理状态</h3>
                            <p class="status-description">${char.心理状态}</p>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // 添加点击背景关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeCharacterModal();
                }
            });

            // 添加动画
            setTimeout(() => modal.classList.add('show'), 10);
        },

        closeCharacterModal() {
            const modal = document.querySelector('.character-modal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        },

        showOpeningScene() {
            const opening = `燕京,天机集团总部大楼顶层。

巨大的落地窗外，是整座城市璀璨的灯火，宛如一片星海铺陈在你的脚下。夜风微拂，吹动你笔挺的衣角。

"阁主，"一身干练职业装，身姿曼妙的秦岚站在你身后，恭敬地汇报着，"我们已经彻底掌控了凰天资本的总裁慕容冰岚的所有动向，都在监控之中。一切尽在掌握。"

你没有回头，只是端着一杯红酒，静静地俯瞰着这座钢铁森林。对你而言，这不过是一场乏味的商业游戏。

就在这时，一道只有你能看见的幽蓝色虚拟屏幕，悄无声息地在你眼前展开。`;

            const systemNotice = `【反派逆袭系统】已启动...

【检测到天命主角"龙战"的重大机缘】
> 目标姓名：龙战（兵王流）
> 机缘类型：功法补全
> 机缘详情：燕京地下黑市明晚将举行一场秘密拍卖会，压轴拍品正是《龙象镇狱功》的完整古卷。此功法为龙战主修功法的完整版，他已通过特殊渠道获得入场资格，正准备前往。一旦被他获得，其实力将突破瓶颈，对您的潜在威胁将大幅提升。
> 天命轨迹：龙战成功拍得古卷，实力大增，并在后续的冲突中，数次凭借功法优势死里逃生。

【新任务发布：夺取机缘】
> 任务目标：赶在龙战之前，不惜一切代价，夺得《龙象镇狱功》完整古卷。
> 任务说明：天命主角的气运并非无敌，真正的反派，敢于逆天改命，将主角的机缘化为自己的垫脚石。
> 成功奖励：反派值+2500，您将获得并解锁《龙象镇狱功》的修炼权限。
> 失败惩罚：龙战获得完整功法，气运大涨，并会察觉到有人在暗中与他竞争，增加对您的警觉。
> 时限：24小时。`;

            const ending = `你看着眼前的任务，嘴角勾起一抹玩味的弧度。

主角的机缘？现在，是我的了。

"秦岚。"你轻呷一口红酒，淡淡开口。

"在。"

"通知下去，明晚的黑市拍卖会，压轴的东西，我要了。"`;

            // 分段显示开场白
            this.logMessage('opening', opening);
            setTimeout(() => {
                this.logMessage('system-highlight', systemNotice);
            }, 2000);
            setTimeout(() => {
                this.logMessage('opening', ending);
            }, 4000);
            setTimeout(() => {
                this.logMessage('system', '————————————————————————');
                this.logMessage('system', '游戏开始。输入"帮助"查看可用指令。');
            }, 6000);
        }
    };

    // 将 game 对象暴露到全局作用域，以便 onclick 可以访问
    window.game = game;

    game.init();

});
