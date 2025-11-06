// 自动调整 textarea 高度的函数
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// 为所有 textarea 添加自动调整高度功能
function initTextareaAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        // 初始化高度
        autoResizeTextarea(textarea);

        // 监听输入事件
        textarea.addEventListener('input', () => {
            autoResizeTextarea(textarea);
        });

        // 监听粘贴事件
        textarea.addEventListener('paste', () => {
            setTimeout(() => autoResizeTextarea(textarea), 0);
        });
    });
}

$(document).ready(function() {
    const $navButtons = $('.nav-link');
    const $sections = $('[data-nav-section]');

    if (!$navButtons.length || !$sections.length) {
        return;
    }

    const updateActive = (activeId) => {
        $navButtons.each(function() {
            $(this).toggleClass('active', $(this).data('target') === activeId);
        });
    };

    $navButtons.on('click', function() {
        const targetId = $(this).data('target');
        const $target = $('#' + targetId);
        if ($target.length) {
            $target[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
            updateActive(targetId);
        }
    });

    $('.collapsible').each(function() {
        $(this).attr({
            'aria-expanded': 'true',
            'role': 'button',
            'tabindex': '0'
        });
        const $content = $(this).next();
        if ($content.length) {
            $content.attr('aria-hidden', 'false');
        }
    }).on('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCollapse(this);
        }
    });

    updateActive($sections.first().attr('id'));

    // 初始化所有现有 textarea 的自动调整高度功能
    initTextareaAutoResize();

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => {
                    if (b.intersectionRatio !== a.intersectionRatio) {
                        return b.intersectionRatio - a.intersectionRatio;
                    }
                    return a.boundingClientRect.top - b.boundingClientRect.top;
                });

            if (visible.length) {
                updateActive(visible[0].target.id);
            }
        }, {
            root: null,
            threshold: 0.35,
            rootMargin: '-20% 0px -45% 0px'
        });

        $sections.each(function() {
            observer.observe(this);
        });
    } else {
        const handleScroll = () => {
            const scrollTop = $(window).scrollTop();
            let currentId = $sections.first().attr('id');
            $sections.each(function() {
                if ($(this).offset().top - 180 <= scrollTop) {
                    currentId = $(this).attr('id');
                }
            });
            updateActive(currentId);
        };

        $(window).on('scroll', handleScroll);
        handleScroll();
    }
});

let characterCount = 0;
let variableCount = 0;

// 初始化时添加一个角色卡和一个变量
$(function() {
    addCharacter();
    addVariable();
});

// 添加角色卡片
function addCharacter() {
    characterCount++;
    const cardHtml = `
    <div class="character-card" id="character-${characterCount}">
        <h3>角色 ${characterCount}</h3>

        <!-- 角色定位 -->
        <div class="form-group">
            <label>📍 角色定位</label>
            <div class="checkbox-group">
                <div class="checkbox-item">
                    <input type="checkbox" class="char-role-main" value="主角（NPC）">
                    <label>主角（NPC）</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" class="char-role-important" value="重要配角">
                    <label>重要配角</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" class="char-role-normal" value="普通 NPC">
                    <label>普通 NPC</label>
                </div>
            </div>
        </div>

        <!-- 模式切换 -->
        <div class="mode-toggle-container">
            <span style="font-size: 0.9em; color: var(--text-light);">填写模式：</span>
            <button type="button" class="mode-toggle-btn active" onclick="toggleCharacterMode(${characterCount}, 'simple')">📝 简略模式</button>
            <button type="button" class="mode-toggle-btn" onclick="toggleCharacterMode(${characterCount}, 'detailed')">📋 详细模式</button>
        </div>

        <!-- 简略模式 -->
        <div class="simple-mode active" id="character-${characterCount}-simple">
            <div class="form-group">
                <label>角色名称</label>
                <input type="text" class="char-name" placeholder="填写角色名称">
            </div>
            <div class="form-group">
                <label>人物设定大纲</label>
                <textarea class="char-outline" placeholder="简要描述角色的核心信息，例如：&#10;- 姓名：艾莉克斯&#10;- 性别/年龄：女/28岁&#10;- 职业：工程师&#10;- 核心性格：聪明、谨慎&#10;- 外貌：黑色长发，深褐色眼睛，中等身材&#10;- 背景：避难所高级工程师，父亲是传奇工程师&#10;- 目标：揭开'伊甸园计划'的真相" style="min-height: 160px;"></textarea>
            </div>
        </div>

        <!-- 详细模式 -->
        <div class="detailed-mode" id="character-${characterCount}-detailed">
            <!-- 基本信息 -->
            <div class="form-group">
                <label>🏷️ 基本信息</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <input type="text" class="char-name" placeholder="角色名称">
                    <input type="text" class="char-gender" placeholder="性别（例如：女/男/其他）">
                    <input type="text" class="char-age" placeholder="年龄（例如：28岁）">
                    <input type="text" class="char-race" placeholder="种族（例如：人类/精灵/机械人）">
                </div>
            </div>

            <!-- 外貌特征 -->
            <div class="form-group">
                <label>👤 外貌特征</label>
                <div style="display: grid; gap: 8px;">
                    <input type="text" class="char-height" placeholder="身高/体型（例如：168cm，中等身材）">
                    <input type="text" class="char-hair" placeholder="发型/发色（例如：黑色长发，通常扎马尾）">
                    <input type="text" class="char-eyes" placeholder="眼睛（例如：深褐色眼睛，眼神锐利）">
                    <textarea class="char-appearance" placeholder="其他外貌特征（例如：&#10;- 肤色白皙，有几处浅疤&#10;- 左手有机械义肢&#10;- 总是戴着护目镜）" style="min-height: 160px;"></textarea>
                </div>
            </div>

            <!-- 服饰风格 -->
            <div class="form-group">
                <label>👔 服饰风格</label>
                <div style="display: grid; gap: 8px;">
                    <input type="text" class="char-outfit-daily" placeholder="日常着装（例如：工装裤、黑色背心、工具腰带）">
                    <input type="text" class="char-outfit-special" placeholder="特殊场合着装（可选）">
                    <textarea class="char-accessories" placeholder="配饰与装备（例如：&#10;- 总是携带一个改装过的多功能工具箱&#10;- 戴着父亲留下的怀表）" style="min-height: 160px;"></textarea>
                </div>
            </div>

            <!-- 性格特质 -->
            <div class="form-group">
                <label>💭 性格特质</label>
                <div style="display: grid; gap: 8px;">
                    <textarea class="char-personality" placeholder="核心性格（例如：&#10;- 冷静、理性、善于分析&#10;- 对待工作一丝不苟&#10;- 不善于表达情感，但内心温暖）" style="min-height: 160px;"></textarea>
                    <input type="text" class="char-speech" placeholder="说话方式（例如：语速较快，喜欢用技术术语）">
                    <input type="text" class="char-catchphrase" placeholder="口头禅/习惯用语（例如：'让我算算...'）">
                    <textarea class="char-habits" placeholder="行为习惯（例如：&#10;- 思考时会摆弄手中的工具&#10;- 遇到问题喜欢独自钻研&#10;- 对机械设备有强迫症般的整理欲）" style="min-height: 160px;"></textarea>
                </div>
            </div>

            <!-- 背景故事 -->
            <div class="form-group">
                <label>📖 背景故事</label>
                <div style="display: grid; gap: 8px;">
                    <input type="text" class="char-occupation" placeholder="职业/身份（例如：避难所高级工程师）">
                    <textarea class="char-backstory" placeholder="过去经历（例如：&#10;- 出生在避难所，父亲是传奇工程师&#10;- 12岁时父亲在事故中去世&#10;- 继承父亲遗志，成为最年轻的高级工程师&#10;- 一直在寻找父亲生前研究的'伊甸园计划'真相）" style="min-height: 160px;"></textarea>
                </div>
            </div>

            <!-- 人际关系 -->
            <div class="form-group">
                <label>👥 人际关系</label>
                <textarea class="char-relationships" placeholder="与其他角色的关系（例如：&#10;- 与避难所理事会关系微妙，被重用但不被完全信任&#10;- 有一个青梅竹马的好友，现在是军事派成员&#10;- 对{{user}}：初次见面持警惕态度，但逐渐建立信任）" style="min-height: 160px;"></textarea>
            </div>

            <!-- 动机与目标 -->
            <div class="form-group">
                <label>🎯 动机与目标</label>
                <div style="display: grid; gap: 8px;">
                    <textarea class="char-goals" placeholder="目标与愿望（例如：&#10;- 揭开父亲'伊甸园计划'的真相&#10;- 让避难所的供电系统更加稳定&#10;- 证明自己不是靠父亲的名声）" style="min-height: 160px;"></textarea>
                    <textarea class="char-fears" placeholder="恐惧与弱点（例如：&#10;- 害怕辜负父亲的期望&#10;- 对失去控制的局面感到不安&#10;- 不擅长处理人际关系，容易被孤立）" style="min-height: 160px;"></textarea>
                </div>
            </div>

            <!-- 技能与能力 -->
            <div class="form-group">
                <label>⚡ 技能与能力</label>
                <textarea class="char-skills" placeholder="擅长的技能（例如：&#10;- 精通机械维修和改造&#10;- 优秀的电路设计能力&#10;- 能够快速分析和解决技术问题&#10;- 基础战斗技能（主要是防身）&#10;- 对旧时代科技有深入研究）" style="min-height: 160px;"></textarea>
            </div>

            <!-- 补充说明 -->
            <div class="form-group">
                <label>📝 补充说明</label>
                <textarea class="char-notes" placeholder="其他补充信息、创作灵感、注意事项等" style="min-height: 160px;"></textarea>
            </div>
        </div>

        ${characterCount > 1 ? '<button class="remove-character-btn" onclick="removeCharacter(' + characterCount + ')">删除此角色</button>' : ''}
    </div>
    `;
    $('#charactersContainer').append(cardHtml);

    // 为新添加的 textarea 初始化自动调整高度功能
    setTimeout(() => {
        $('#character-' + characterCount + ' textarea').each(function() {
            autoResizeTextarea(this);
            this.addEventListener('input', () => autoResizeTextarea(this));
            this.addEventListener('paste', () => {
                setTimeout(() => autoResizeTextarea(this), 0);
            });
        });
    }, 0);
}

// 删除角色卡片
function removeCharacter(id) {
    $('#character-' + id).remove();
}

// 添加变量卡片
function addVariable() {
    variableCount++;
    const cardHtml = `
    <div class="variable-card" id="variable-${variableCount}">
        <div class="form-group variable-name-group">
            <label>变量名</label>
            <input type="text" class="var-name" placeholder="例如：好感度">
        </div>
        <div class="form-group">
            <label>说明/要求</label>
            <textarea class="var-desc" placeholder="例如：数值范围 0-100，影响角色对话风格"></textarea>
        </div>
        ${variableCount > 1 ? '<div class="remove-btn-container"><button class="remove-character-btn" onclick="removeVariable(' + variableCount + ')">删除</button></div>' : ''}
    </div>
    `;
    $('#mvuVariablesContainer').append(cardHtml);

    // 为新添加的 textarea 初始化自动调整高度功能
    setTimeout(() => {
        $('#variable-' + variableCount + ' textarea').each(function() {
            autoResizeTextarea(this);
            this.addEventListener('input', () => autoResizeTextarea(this));
            this.addEventListener('paste', () => {
                setTimeout(() => autoResizeTextarea(this), 0);
            });
        });
    }, 0);
}

// 删除变量卡片
function removeVariable(id) {
    $('#variable-' + id).remove();
}

// 清空所有变量
function clearAllVariables() {
    if (confirm('确定要清空所有变量吗？此操作不可撤销。')) {
        $('#mvuVariablesContainer').empty();
        variableCount = 0;
        // 添加一个空白变量
        addVariable();
    }
}

// 加载预设变量
function loadPresetVariables() {
    if (confirm('确定要加载预设变量吗？这将清空当前所有变量。')) {
        // 清空现有变量
        $('#mvuVariablesContainer').empty();
        variableCount = 0;

        // 预设变量列表（通用版本）
        const presetVariables = [
            {
                name: '世界.当前时间',
                desc: '格式为 yyyy年mm月dd日 星期X 上午/下午 hh:mm（24小时制），每次对话或场景转换后根据实际经历的时间自然推进'
            },
            {
                name: '世界.当前地点',
                desc: '具体的房间或场所名称，当角色明确移动到新地点时立即更新'
            },
            {
                name: '角色名.好感度',
                desc: '数值范围 0-100，初始值为0，每次对话后根据角色对{{user}}行为的感受更新，单次变化±1~5（多角色时为每个角色创建独立的好感度变量，如"艾莉克斯.好感度"）'
            },
            {
                name: '角色名.当前着装',
                desc: '详细描述角色当前的穿着，在起床后、洗澡后、外出前等场景需要更新（多角色时为每个角色创建独立的着装变量，如"艾莉克斯.当前着装"）'
            },
            {
                name: '角色名.当前姿势',
                desc: '描述角色此刻的身体姿态和动作，每次对话或场景变化时更新，反映当前状态和情绪（多角色时为每个角色创建独立的姿势变量，如"艾莉克斯.当前姿势"）'
            },
            {
                name: '角色名.当前想法',
                desc: '描述角色当前内心的真实想法，可能与外在表现不一致，每次对话后更新，展现内心活动（多角色时为每个角色创建独立的想法变量，如"艾莉克斯.当前想法"）'
            },
            {
                name: '角色名.关系状态',
                desc: '描述角色与{{user}}的关系阶段，如"陌生人"、"初识"、"朋友"、"亲密"等，随着好感度变化而更新（多角色时为每个角色创建独立的关系状态变量，如"艾莉克斯.关系状态"）'
            }
        ];

        // 添加预设变量
        presetVariables.forEach(preset => {
            variableCount++;
            const cardHtml = `
            <div class="variable-card" id="variable-${variableCount}">
                <div class="form-group variable-name-group">
                    <label>变量名</label>
                    <input type="text" class="var-name" placeholder="例如：好感度" value="${preset.name}">
                </div>
                <div class="form-group">
                    <label>说明/要求</label>
                    <textarea class="var-desc" placeholder="例如：数值范围 0-100，影响角色对话风格">${preset.desc}</textarea>
                </div>
                <div class="remove-btn-container"><button class="remove-character-btn" onclick="removeVariable(${variableCount})">删除</button></div>
            </div>
            `;
            $('#mvuVariablesContainer').append(cardHtml);
        });

        // 为新添加的所有 textarea 初始化自动调整高度功能
        setTimeout(() => {
            $('#mvuVariablesContainer textarea').each(function() {
                autoResizeTextarea(this);
                this.addEventListener('input', () => autoResizeTextarea(this));
                this.addEventListener('paste', () => {
                    setTimeout(() => autoResizeTextarea(this), 0);
                });
            });
        }, 0);

        alert('✅ 已加载 ' + presetVariables.length + ' 个预设变量！你可以根据需要进行修改或删除。');
    }
}

// 切换折叠
function toggleCollapse(element) {
    const $element = $(element);
    $element.toggleClass('collapsed');
    const $content = $element.next();
    if ($content.length) {
        $content.toggleClass('collapsed');
        const isCollapsed = $content.hasClass('collapsed');
        $element.attr('aria-expanded', !isCollapsed);
        $content.attr('aria-hidden', isCollapsed);
    }
}

// 切换背景设定模式
function toggleBackgroundMode(mode) {
    const $simple = $('#background-simple');
    const $detailed = $('#background-detailed');
    const $buttons = $('#step-1 .mode-toggle-btn');

    if (mode === 'simple') {
        $simple.addClass('active');
        $detailed.removeClass('active');
        $buttons.eq(0).addClass('active');
        $buttons.eq(1).removeClass('active');
    } else {
        $simple.removeClass('active');
        $detailed.addClass('active');
        $buttons.eq(0).removeClass('active');
        $buttons.eq(1).addClass('active');
    }
}

// 切换开场白模式
function toggleOpeningMode(mode) {
    const $simple = $('#opening-simple');
    const $detailed = $('#opening-detailed');
    const $buttons = $('#step-3 .mode-toggle-btn');

    if (mode === 'simple') {
        $simple.addClass('active');
        $detailed.removeClass('active');
        $buttons.eq(0).addClass('active');
        $buttons.eq(1).removeClass('active');
    } else {
        $simple.removeClass('active');
        $detailed.addClass('active');
        $buttons.eq(0).removeClass('active');
        $buttons.eq(1).addClass('active');
    }
}

// 切换角色模式
function toggleCharacterMode(charId, mode) {
    const $simple = $('#character-' + charId + '-simple');
    const $detailed = $('#character-' + charId + '-detailed');
    const $buttons = $('#character-' + charId + ' .mode-toggle-btn');

    if (mode === 'simple') {
        $simple.addClass('active');
        $detailed.removeClass('active');
        $buttons.eq(0).addClass('active');
        $buttons.eq(1).removeClass('active');
    } else {
        $simple.removeClass('active');
        $detailed.addClass('active');
        $buttons.eq(0).removeClass('active');
        $buttons.eq(1).addClass('active');
    }
}

// 单选checkbox处理
$(document).on('change', 'input[type="checkbox"][name]', function() {
    if ($(this).prop('checked')) {
        const name = $(this).attr('name');
        $(`input[name="${name}"]`).not(this).prop('checked', false);
    }
});

// 生成 Markdown
function generateMarkdown() {
    const workName = $('#workName').val() || '作品名称';
    let md = '# 角色卡创作任务清单\n\n';
    md += '> 💡 **使用说明**：此文件由任务清单生成器自动生成，在创作过程中可以随时更新和调整。\n\n';
    md += '> 📁 **文件组织建议**：\n';
    md += `> - 请在 \`作品\` 目录下创建一个名为 \`${workName}\` 的文件夹\n`;
    md += '> - 将此 to-do.md 文件放入该文件夹\n';
    md += '> - 后续创作的所有相关文件（背景设定、角色卡、开场白等）也都放入此文件夹中\n';
    md += '> - 这样可以保持项目文件的整洁和有序\n\n';
    md += '---\n\n';

    // 基本信息
    md += '## 基本信息\n\n';
    md += `**作品名称：** ${$('#workName').val() || '_[待填写]_'}\n\n`;
    md += `**作品类型：** ${$('#workType').val() || '_[待填写]_'}\n\n`;
    md += '---\n\n';

    // 第一步：世界观构建
    md += '## 创作任务清单\n\n';
    md += '### ✅ 第一步：世界观构建\n\n';

    const needBackground = $('#needBackground').prop('checked');
    const noBackground = $('#noBackground').prop('checked');

    md += '**背景设定需求：**\n';
    md += `- [${needBackground ? 'x' : ' '}] 需要\n`;
    md += `- [${noBackground ? 'x' : ' '}] 不需要\n\n`;

    if (noBackground) {
        md += '**状态：** 不需要\n\n';
    } else {

    // 背景设定信息（检查简略和详细模式）
    const bgSimpleMode = $('#background-simple').hasClass('active');
    const bgOutlineSimple = $('#backgroundOutlineSimple').val();

    if (bgSimpleMode && bgOutlineSimple) {
        // 使用简略模式的数据
        md += '**📋 背景设定大纲：**\n\n';
        md += '```\n' + bgOutlineSimple + '\n```\n\n';
    } else {
        // 使用详细模式的数据
        const bgEra = $('#bgEra').val();
        const bgLocation = $('#bgLocation').val();
        const bgDescription = $('#bgDescription').val();
        const bgSpecialRules = $('#bgSpecialRules').val();
        const bgOutline = $('#backgroundOutline').val();

        md += '**📋 背景设定详细信息：**\n\n';
        md += `- **时代/时期：** ${bgEra || '_[待填写]_'}\n`;
        md += `- **主要地点：** ${bgLocation || '_[待填写]_'}\n\n`;

        md += '- **背景描述：**\n';
        if (bgDescription) {
            md += '```\n' + bgDescription + '\n```\n\n';
        } else {
            md += '_[待填写]_\n\n';
        }

        if (bgSpecialRules) {
            md += '- **特殊规则/系统：**\n';
            md += '```\n' + bgSpecialRules + '\n```\n\n';
        }

        if (bgOutline) {
            md += '- **补充说明：**\n';
            md += '```\n' + bgOutline + '\n```\n\n';
        }
    }

    md += '**参考模板：** `基础模板/Z.1.背景模板.md`\n\n';
    }
    md += '---\n\n';

    // 第二步：角色设定
    md += '### ✅ 第二步：角色设定\n\n';

    const needCharacter = $('#needCharacter').prop('checked');
    const noCharacter = $('#noCharacter').prop('checked');

    md += '**角色设定需求：**\n';
    md += `- [${needCharacter ? 'x' : ' '}] 需要\n`;
    md += `- [${noCharacter ? 'x' : ' '}] 不需要\n\n`;

    if (noCharacter) {
        md += '**状态：** 不需要\n\n';
    } else {
        const $characterCards = $('.character-card');
        md += `**主要角色数量：** ${$characterCards.length}\n\n`;

        $characterCards.each(function(index) {
        const $card = $(this);
        md += `#### 角色 ${index + 1}\n\n`;

        // 角色定位
        md += '**📍 角色定位：**\n';
        md += `- [${$card.find('.char-role-main').prop('checked') ? 'x' : ' '}] 主角（NPC）\n`;
        md += `- [${$card.find('.char-role-important').prop('checked') ? 'x' : ' '}] 重要配角\n`;
        md += `- [${$card.find('.char-role-normal').prop('checked') ? 'x' : ' '}] 普通 NPC\n\n`;

        // 检查是否使用简略模式
        const charId = $card.attr('id').replace('character-', '');
        const $simpleDiv = $card.find('#character-' + charId + '-simple');
        const simpleMode = $simpleDiv.hasClass('active');
        const outline = $simpleDiv.find('.char-outline').val();

        if (simpleMode && outline) {
            // 使用简略模式的数据
            const name = $simpleDiv.find('.char-name').val();
            md += `**角色名称：** ${name || '_[待填写]_'}\n\n`;
            md += '**人物设定大纲：**\n\n';
            md += '```\n' + outline + '\n```\n\n';
            md += '**参考模板：** `基础模板/Z.2.人物模板.md`\n\n';
        } else {
            // 使用详细模式的数据
            const $detailedDiv = $card.find('#character-' + charId + '-detailed');

            // 基本信息
            const name = $detailedDiv.find('.char-name').val();
            const gender = $detailedDiv.find('.char-gender').val();
            const age = $detailedDiv.find('.char-age').val();
            const race = $detailedDiv.find('.char-race').val();

            md += '**🏷️ 基本信息：**\n\n';
            md += `- **姓名：** ${name || '_[待填写]_'}\n`;
            md += `- **性别：** ${gender || '_[待填写]_'}\n`;
            md += `- **年龄：** ${age || '_[待填写]_'}\n`;
            md += `- **种族：** ${race || '_[待填写]_'}\n\n`;

            // 外貌特征
            const height = $detailedDiv.find('.char-height').val();
            const hair = $detailedDiv.find('.char-hair').val();
            const eyes = $detailedDiv.find('.char-eyes').val();
            const appearance = $detailedDiv.find('.char-appearance').val();

            md += '**👤 外貌特征：**\n\n';
            md += `- **身高/体型：** ${height || '_[待填写]_'}\n`;
            md += `- **发型/发色：** ${hair || '_[待填写]_'}\n`;
            md += `- **眼睛：** ${eyes || '_[待填写]_'}\n`;
            if (appearance) {
                md += '- **其他特征：**\n```\n' + appearance + '\n```\n\n';
            } else {
                md += '- **其他特征：** _[待填写]_\n\n';
            }

            // 服饰风格
            const outfitDaily = $detailedDiv.find('.char-outfit-daily').val();
            const outfitSpecial = $detailedDiv.find('.char-outfit-special').val();
            const accessories = $detailedDiv.find('.char-accessories').val();

            md += '**👔 服饰风格：**\n\n';
            md += `- **日常着装：** ${outfitDaily || '_[待填写]_'}\n`;
            if (outfitSpecial) {
                md += `- **特殊场合：** ${outfitSpecial}\n`;
            }
            if (accessories) {
                md += '- **配饰与装备：**\n```\n' + accessories + '\n```\n\n';
            } else {
                md += '- **配饰与装备：** _[待填写]_\n\n';
            }

            // 性格特质
            const personality = $detailedDiv.find('.char-personality').val();
            const speech = $detailedDiv.find('.char-speech').val();
            const catchphrase = $detailedDiv.find('.char-catchphrase').val();
            const habits = $detailedDiv.find('.char-habits').val();

            md += '**💭 性格特质：**\n\n';
            if (personality) {
                md += '- **核心性格：**\n```\n' + personality + '\n```\n';
            } else {
                md += '- **核心性格：** _[待填写]_\n';
            }
            md += `- **说话方式：** ${speech || '_[待填写]_'}\n`;
            md += `- **口头禅：** ${catchphrase || '_[待填写]_'}\n`;
            if (habits) {
                md += '- **行为习惯：**\n```\n' + habits + '\n```\n\n';
            } else {
                md += '- **行为习惯：** _[待填写]_\n\n';
            }

            // 背景故事
            const occupation = $detailedDiv.find('.char-occupation').val();
            const backstory = $detailedDiv.find('.char-backstory').val();

            md += '**📖 背景故事：**\n\n';
            md += `- **职业/身份：** ${occupation || '_[待填写]_'}\n`;
            if (backstory) {
                md += '- **过去经历：**\n```\n' + backstory + '\n```\n\n';
            } else {
                md += '- **过去经历：** _[待填写]_\n\n';
            }

            // 人际关系
            const relationships = $detailedDiv.find('.char-relationships').val();

            md += '**👥 人际关系：**\n\n';
            if (relationships) {
                md += '```\n' + relationships + '\n```\n\n';
            } else {
                md += '_[待填写]_\n\n';
            }

            // 动机与目标
            const goals = $detailedDiv.find('.char-goals').val();
            const fears = $detailedDiv.find('.char-fears').val();

            md += '**🎯 动机与目标：**\n\n';
            if (goals) {
                md += '- **目标与愿望：**\n```\n' + goals + '\n```\n';
            } else {
                md += '- **目标与愿望：** _[待填写]_\n';
            }
            if (fears) {
                md += '- **恐惧与弱点：**\n```\n' + fears + '\n```\n\n';
            } else {
                md += '- **恐惧与弱点：** _[待填写]_\n\n';
            }

            // 技能与能力
            const skills = $detailedDiv.find('.char-skills').val();

            md += '**⚡ 技能与能力：**\n\n';
            if (skills) {
                md += '```\n' + skills + '\n```\n\n';
            } else {
                md += '_[待填写]_\n\n';
            }

            // 补充说明
            const notes = $detailedDiv.find('.char-notes').val();

            if (notes) {
                md += '**📝 补充说明：**\n\n';
                md += '```\n' + notes + '\n```\n\n';
            }
        }

        md += '**参考模板：** `基础模板/Z.2.人物模板.md`\n\n';
    });
    }

    // 第三步：开场白
    md += '### ✅ 第三步：开场白\n\n';
    const needOpening = $('#needOpening').prop('checked');
    const noOpening = $('#noOpening').prop('checked');

    md += '**开场白需求：**\n';
    md += `- [${needOpening ? 'x' : ' '}] 需要\n`;
    md += `- [${noOpening ? 'x' : ' '}] 不需要\n\n`;

    if (noOpening) {
        md += '**状态：** 不需要\n\n';
    } else {
        md += `**开场场景：** ${$('#openingScene').val() || '_[待填写]_'}\n\n`;

        md += '**目标篇幅：**\n';
        md += `- [${$('#length1').prop('checked') ? 'x' : ' '}] 简单场景（300-500字）\n`;
        md += `- [${$('#length2').prop('checked') ? 'x' : ' '}] 标准场景（500-800字）\n`;
        md += `- [${$('#length3').prop('checked') ? 'x' : ' '}] 复杂场景（800-1500字）\n\n`;

    // 开场白信息（检查简略和详细模式）
    const openingSimpleMode = $('#opening-simple').hasClass('active');
    const openingOutlineSimple = $('#openingOutlineSimple').val();

    if (openingSimpleMode && openingOutlineSimple) {
        // 使用简略模式的数据
        md += '**📋 开场白大纲：**\n\n';
        md += '```\n' + openingOutlineSimple + '\n```\n\n';
    } else {
        // 使用详细模式的数据
        const openingSpecificScene = $('#openingSpecificScene').val();
        const openingTime = $('#openingTime').val();
        const openingLocation = $('#openingLocation').val();
        const openingAtmosphere = $('#openingAtmosphere').val();
        const openingUserRelation = $('#openingUserRelation').val();
        const openingInitialConflict = $('#openingInitialConflict').val();
        const openingOutline = $('#openingOutline').val();

        md += '**📋 开场白详细信息：**\n\n';
        md += `- **具体场景：** ${openingSpecificScene || '_[待填写]_'}\n`;
        md += `- **时间：** ${openingTime || '_[待填写]_'}\n`;
        md += `- **地点：** ${openingLocation || '_[待填写]_'}\n`;
        md += `- **天气/氛围：** ${openingAtmosphere || '_[待填写]_'}\n`;
        md += `- **与 {{user}} 的关系：** ${openingUserRelation || '_[待填写]_'}\n\n`;

        md += '- **初始情境/冲突：**\n';
        if (openingInitialConflict) {
            md += '```\n' + openingInitialConflict + '\n```\n\n';
        } else {
            md += '_[待填写]_\n\n';
        }

        if (openingOutline) {
            md += '- **补充说明：**\n';
            md += '```\n' + openingOutline + '\n```\n\n';
        }
    }

    md += '**参考模板：** `基础模板/Z.3.开场白.md`\n\n';
    }
    md += '---\n\n';

    // 第四步：对话补充
    md += '### ✅ 第四步：对话补充（可选）\n\n';
    const needDialogue = document.getElementById('needDialogue').checked;
    const noDialogue = document.getElementById('noDialogue').checked;
    md += '**是否需要对话补充：**\n';
    md += `- [${needDialogue ? 'x' : ' '}] 需要\n`;
    md += `- [${noDialogue ? 'x' : ' '}] 不需要\n\n`;

    if (noDialogue) {
        md += '**状态：** 不需要\n\n';
    } else {
        md += `**对应角色：** ${document.getElementById('dialogueCharacter').value || '_[待填写]_'}\n\n`;

        md += '**场景需求：**\n';
        md += `- [${document.getElementById('scene1').checked ? 'x' : ' '}] 日常闲聊\n`;
        md += `- [${document.getElementById('scene2').checked ? 'x' : ' '}] 紧张时刻\n`;
        md += `- [${document.getElementById('scene3').checked ? 'x' : ' '}] 战斗场景\n`;
        md += `- [${document.getElementById('scene4').checked ? 'x' : ' '}] 亲密互动\n`;
        md += `- [${document.getElementById('scene5').checked ? 'x' : ' '}] 情绪波动（高兴/愤怒/悲伤）\n\n`;

    md += '**参考模板：** `基础模板/Z.4.对话补充.md`\n\n';
    }
    md += '---\n\n';

    // 第五步：角色采访
    md += '### ✅ 第五步：角色采访（可选）\n\n';
    const needInterview = document.getElementById('needInterview').checked;
    const noInterview = document.getElementById('noInterview').checked;
    md += '**是否需要角色采访：**\n';
    md += `- [${needInterview ? 'x' : ' '}] 需要\n`;
    md += `- [${noInterview ? 'x' : ' '}] 不需要\n\n`;

    if (noInterview) {
        md += '**状态：** 不需要\n\n';
    } else {
        md += `**对应角色：** ${document.getElementById('interviewCharacter').value || '_[待填写]_'}\n\n`;

        const interviewTopics = document.getElementById('interviewTopics').value;
        md += '**采访主题：**\n';
        if (interviewTopics) {
            md += '```\n' + interviewTopics + '\n```\n\n';
        } else {
            md += '_[待填写]_\n\n';
        }
    }

    md += '**参考模板：** `基础模板/Z.5.角色采访.md`\n\n';
    md += '---\n\n';

    // 第六步：玩家角色设定
    md += '### ✅ 第六步：玩家角色设定（可选）\n\n';
    const needPlayer = document.getElementById('needPlayer').checked;
    const noPlayer = document.getElementById('noPlayer').checked;
    md += '**是否需要玩家设定：**\n';
    md += `- [${needPlayer ? 'x' : ' '}] 需要\n`;
    md += `- [${noPlayer ? 'x' : ' '}] 不需要\n\n`;

    if (noPlayer) {
        md += '**状态：** 不需要\n\n';
    } else {
        md += '**设定深度：**\n';
        md += `- [${document.getElementById('depth1').checked ? 'x' : ' '}] 极简设定（最大自由度）\n`;
        md += `- [${document.getElementById('depth2').checked ? 'x' : ' '}] 简化设定（有基本框架）\n`;
        md += `- [${document.getElementById('depth3').checked ? 'x' : ' '}] 完整设定（明确背景和性格）\n\n`;

        const playerOutline = document.getElementById('playerOutline').value;
        md += '**玩家角色大纲：**\n';
        if (playerOutline) {
            md += '```\n' + playerOutline + '\n```\n\n';
        } else {
            md += '_[待填写]_\n\n';
        }
    }

    md += '**参考模板：** `基础模板/Z.6.玩家模板.md`\n\n';
    md += '---\n\n';

    // 第七步：MVU 组件包
    md += '### ✅ 第七步：MVU 组件包（可选）\n\n';
    const needMVU = document.getElementById('needMVU').checked;
    const noMVU = document.getElementById('noMVU').checked;
    md += '**是否使用 MVU 组件包：**\n';
    md += `- [${needMVU ? 'x' : ' '}] 需要\n`;
    md += `- [${noMVU ? 'x' : ' '}] 不需要\n\n`;

    if (noMVU) {
        md += '**状态：** 不需要\n\n';
    } else {
    md += '**组件选择：**\n';
    md += `- [${document.getElementById('mvu1').checked ? 'x' : ' '}] 变量初始化条目（稳定版）\n`;
    md += `- [${document.getElementById('mvu2').checked ? 'x' : ' '}] 变量初始化条目（Beta版）\n`;
    md += `- [${document.getElementById('mvu3').checked ? 'x' : ' '}] 变量更新规则\n`;
    md += `- [${document.getElementById('mvu4').checked ? 'x' : ' '}] 变量处理指令集（稳定版）\n`;
    md += `- [${document.getElementById('mvu5').checked ? 'x' : ' '}] 变量处理指令集（Beta版）\n`;
    md += `- [${document.getElementById('mvu6').checked ? 'x' : ' '}] 分阶段角色设定\n`;
    md += `- [${document.getElementById('mvu7').checked ? 'x' : ' '}] 动态世界内容\n`;
    md += `- [${document.getElementById('mvu8').checked ? 'x' : ' '}] HTML状态栏\n\n`;

    // 收集变量信息
    const variableCards = document.querySelectorAll('.variable-card');
    md += '**需要追踪的变量：**\n\n';
    if (variableCards.length > 0) {
        variableCards.forEach((card, index) => {
            const varName = card.querySelector('.var-name').value || '_[待填写]_';
            const varDesc = card.querySelector('.var-desc').value || '_[待填写]_';
            md += `${index + 1}. **${varName}**：${varDesc}\n`;
        });
        md += '\n';
    } else {
        md += '_[待填写]_\n\n';
    }

    // 分阶段角色设定
    const stageSettings = document.getElementById('mvuStageSettings').value;
    md += '**分阶段角色设定说明：**\n';
    if (stageSettings) {
        md += '```\n' + stageSettings + '\n```\n\n';
    } else {
        md += '_[待填写]_\n\n';
    }

    // 动态世界内容
    const dynamicWorld = document.getElementById('mvuDynamicWorld').value;
    md += '**动态世界内容说明：**\n';
    if (dynamicWorld) {
        md += '```\n' + dynamicWorld + '\n```\n\n';
    } else {
        md += '_[待填写]_\n\n';
    }

    // HTML 状态栏
    const htmlDisplay = document.getElementById('mvuHtmlDisplay').value;
    md += '**HTML 状态栏显示需求：**\n';
    if (htmlDisplay) {
        md += '```\n' + htmlDisplay + '\n```\n\n';
    } else {
        md += '_[待填写]_\n\n';
    }

    // 其他特殊说明
    const mvuNotes = document.getElementById('mvuNotes').value;
    md += '**其他特殊说明：**\n';
    if (mvuNotes) {
        md += '```\n' + mvuNotes + '\n```\n\n';
    } else {
        md += '_[待填写]_\n\n';
    }

    md += '**参考模板：** `MVU组件包/` 目录下的相关文件\n\n';
    md += '---\n\n';
    }

    // 额外需求
    md += '## 额外需求\n\n';
    const extraReq = document.getElementById('extraRequirements').value;
    md += '**特殊要求或补充说明：**\n';
    if (extraReq) {
        md += '```\n' + extraReq + '\n```\n\n';
    } else {
        md += '_[待填写]_\n\n';
    }
    md += '---\n\n';

    // 创作进度跟踪
    md += '## 创作进度跟踪\n\n';
    md += '- [ ] 背景设定完成\n';
    md += '- [ ] 角色设定完成\n';
    md += '- [ ] 开场白完成\n';
    md += '- [ ] 对话补充完成（如需要）\n';
    md += '- [ ] 角色采访完成（如需要）\n';
    md += '- [ ] 玩家角色完成（如需要）\n';
    md += '- [ ] MVU 组件包配置完成（如需要）\n';
    md += '- [ ] 编写打包配置文件\n';
    md += '- [ ] 运行打包程序生成角色卡\n\n';
    md += '---\n\n';

    // 打包说明
    md += '## 📦 角色卡打包说明\n\n';
    md += '完成所有创作内容后，需要使用打包程序将文件整合成 SillyTavern 可导入的角色卡 JSON 文件。\n\n';

    md += '### 第一步：编写配置文件\n\n';
    md += '在项目根目录创建一个 YAML 配置文件（例如：`' + workName + '.yaml`），内容参考以下格式：\n\n';
    md += '```yaml\n';
    md += '# 基础信息\n';
    md += 'name: ' + workName + '\n';
    md += 'creator: ""\n';
    md += 'character_version: ""\n\n';
    md += '# 主要字段映射\n';
    md += 'fields:\n';
    md += '  description: 作品/' + workName + '/角色设定_主角名.xyaml\n';
    md += '  personality: ""\n';
    md += '  scenario: ""\n';
    md += '  first_mes: 作品/' + workName + '/开场白.md\n';
    md += '  mes_example: ""\n';
    md += '  creator_notes: ""\n';
    md += '  system_prompt: ""\n';
    md += '  post_history_instructions: ""\n\n';
    md += '# 扩展字段\n';
    md += 'extensions:\n';
    md += '  talkativeness: "0.5"\n';
    md += '  fav: false\n';
    md += '  world: ' + workName + '\n';
    md += '  status_bar: 作品/' + workName + '/状态栏.html  # 可选\n\n';
    md += '# 角色书配置\n';
    md += 'character_book:\n';
    md += '  name: ' + workName + '\n';
    md += '  entries:\n';
    md += '    # [InitVar]初始化条目\n';
    md += '    - comment: "[InitVar]初始化"\n';
    md += '      content: 作品/' + workName + '/变量初始化_beta.xyaml\n';
    md += '      enabled: false\n';
    md += '      position: before_char\n';
    md += '      insertion_order: 100\n';
    md += '      depth: 4\n';
    md += '      role: 0\n\n';
    md += '    # 变量更新规则\n';
    md += '    - comment: "变量更新规则"\n';
    md += '      content: 作品/' + workName + '/变量更新规则.xyaml\n';
    md += '      enabled: true\n';
    md += '      position: at_depth\n';
    md += '      insertion_order: 1\n';
    md += '      depth: 1\n';
    md += '      role: 0\n\n';
    md += '    # 变量处理指令集\n';
    md += '    - comment: "变量处理指令集"\n';
    md += '      content: 作品/' + workName + '/变量处理指令集_beta.xyaml\n';
    md += '      enabled: true\n';
    md += '      position: at_depth\n';
    md += '      insertion_order: 2\n';
    md += '      depth: 1\n';
    md += '      role: 0\n\n';
    md += '    # 背景设定\n';
    md += '    - comment: "背景设定"\n';
    md += '      content: 作品/' + workName + '/背景设定.xyaml\n';
    md += '      enabled: true\n';
    md += '      position: before_char\n';
    md += '      insertion_order: 1\n';
    md += '      depth: 4\n';
    md += '      role: 0\n\n';
    md += '    # 玩家角色\n';
    md += '    - comment: "玩家角色_{{user}}"\n';
    md += '      content: 作品/' + workName + '/玩家角色_{{user}}.xyaml\n';
    md += '      enabled: true\n';
    md += '      position: before_char\n';
    md += '      insertion_order: 2\n';
    md += '      depth: 4\n';
    md += '      role: 0\n\n';
    md += '    # 其他设定条目（可添加多个）\n';
    md += '    - comment: "其他设定条目1"\n';
    md += '      content: 作品/' + workName + '/其他设定1.xyaml\n';
    md += '      enabled: true\n';
    md += '      position: after_char\n';
    md += '      insertion_order: 1\n';
    md += '      depth: 4\n';
    md += '      role: 0\n';
    md += '```\n\n';

    md += '**配置说明：**\n\n';
    md += '- `name`: 角色卡名称\n';
    md += '- `fields`: 各个字段对应的文件路径，空字符串 `""` 表示该字段为空\n';
    md += '- `extensions.status_bar`: 状态栏HTML文件路径（可选）\n';
    md += '- `character_book.entries`: 角色书条目列表\n';
    md += '  - `comment`: 条目名称\n';
    md += '  - `content`: 条目内容对应的文件路径\n';
    md += '  - `position`: 插入位置（`before_char`/`after_char`/`at_depth`）\n';
    md += '  - `insertion_order`: 插入顺序（数字越小越靠前）\n';
    md += '  - `depth`: 深度值（1-4）\n';
    md += '  - `role`: 角色类型（0=系统，1=用户，2=AI）\n\n';

    md += '**参考示例：** `config.example.yaml`\n\n';

    md += '### 第二步：运行打包程序\n\n';
    md += '确保已安装 Node.js 和依赖包，然后在项目根目录运行：\n\n';
    md += '```bash\n';
    md += '# 首次使用需要安装依赖\n';
    md += 'npm install\n\n';
    md += '# 运行打包程序\n';
    md += 'node build-card.js ' + workName + '.yaml\n';
    md += '```\n\n';

    md += '程序会自动读取配置文件，整合所有内容，生成 `' + workName + '.json` 文件。\n\n';

    md += '---\n\n';

    // 版本记录
    const today = new Date().toISOString().split('T')[0];
    md += '## 版本记录\n\n';
    md += `**v1.0** - ${today} - 初始版本创建\n\n`;
    md += '---\n\n';
    md += '> 💾 **提示**：建议使用 Git 进行版本管理，每完成一个重要阶段就提交一次，方便回溯和对比不同版本。\n';

    // 下载文件
    downloadMarkdown(md);
}

// 下载 Markdown 文件
function downloadMarkdown(content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'to-do.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✅ Markdown 文件已生成！请查看下载的 to-do.md 文件。');
}

// 重置表单
function resetForm() {
    if (confirm('确定要重置表单吗？所有填写的内容将被清空。')) {
        location.reload();
    }
}