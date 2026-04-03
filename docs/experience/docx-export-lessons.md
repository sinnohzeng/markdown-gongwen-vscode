# DOCX 导出功能开发经验

> 日期：2026-04-03

## 成功经验

### 1. 选择 `docx` npm 包而非 Pandoc

- **决策理由**：Pandoc 需要用户额外安装，且会注入约 30 个冗余语法高亮样式（AlertTok、AnnotationTok 等），即使文档中没有代码块
- **结果**：`docx` 包只输出显式定义的样式，最终 DOCX 只有 7 个干净的中文命名样式
- **教训**：对于 VS Code 扩展，纯 JS 方案始终优于外部二进制依赖

### 2. 使用 Word 内建样式 ID

- **问题**：最初计划使用自定义样式 ID（如 `"公文标题"`）
- **发现**：Word 的 TOC field code、导航窗格、大纲视图只识别内建 ID（`Title`、`Heading1` 等）
- **方案**：使用内建 `id` + 中文 `name` 显示名，两全其美
- **教训**：OOXML 样式的 `id` 是机器识别的，`name` 是人看的，不要混淆

### 3. OOXML rFonts 四槽位机制

- **发现**：Word 按字符 Unicode 范围自动选择 `eastAsia`/`ascii`/`hAnsi`/`cs` 字体
- **好处**：中英混排时只需在样式中声明一次，无需逐字符切换
- **教训**：`docx` 库的 `font` 属性支持对象格式 `{ eastAsia, ascii, hAnsi }`，直接映射到 OOXML

### 4. 纯函数架构分层

- **设计**：`ast-to-docx.ts` 零 VS Code 依赖，是纯 AST → docx 映射
- **好处**：可以直接用 Jest 测试，不需要 VS Code 测试环境
- **教训**：VS Code 扩展中应尽量将业务逻辑抽离为纯函数

### 5. 图片尺寸快速读取

- **方案**：直接解析 PNG IHDR chunk（byte 16-23）和 JPEG SOF marker
- **好处**：避免依赖 `sharp` 或 `image-size` 等 native 包（在 VS Code 扩展中 native 依赖有兼容性风险）
- **教训**：对于简单需求，手写二进制解析比引入新依赖更可靠

## 踩坑经验

### 1. VS Code 编辑器不支持 `text-align: justify`

- **背景**：用户希望在编辑器中实现两端对齐
- **调研结果**：VS Code 的 `TextEditorDecorationType` 只支持字符级 CSS，不支持块级布局属性
- **结论**：这是 Monaco Editor 的架构限制，无法通过扩展解决。DOCX 导出功能正好弥补了这个缺口

### 2. `docx` 库的尺寸单位

- **半磅（half-point）**：字号用半磅，16pt = 32
- **twip**：行距和缩进用 twip（1/20 磅），28pt = 560 twip
- **mm 到 twip**：使用 `convertMillimetersToTwip()` 转换
- **教训**：OOXML 的单位系统很混乱，必须用命名常量消除 magic number

### 3. GB/T 9704 行距计算

- **标准要求**：每页 22 行，版心高度 225mm
- **理论值**：225mm / 22 = 10.227mm/行 = 28.96pt
- **实际值**：固定行距 28pt（略小于理论值，但实践中最可靠）
- **教训**：公文排版不能照搬理论计算，要以实际效果为准

### 4. macOS 字体差异

- **Windows**：`FangSong`、`SimHei`、`KaiTi` 是系统自带
- **macOS**：没有 `FangSong`，对应的是 `STFangsong`（华文仿宋）
- **方案**：在 OOXML 中使用 Windows 字体名，Word/WPS 会自动回退到 macOS 对应字体
- **教训**：不需要在代码中做平台判断，让 Word 引擎处理回退

### 5. esbuild 单 bundle vs 分离 chunk

- **最初计划**：将 `docx` 包构建为独立 chunk，延迟加载
- **实际发现**：V8 引擎使用惰性解析，模块代码在首次执行时才完全编译；`docx` 模块只在用户触发导出时才被调用
- **结论**：单 bundle 已经具备运行时延迟效果，拆分 chunk 增加的构建复杂度不值得
- **教训**：不要过度优化；先测量，再优化

## 项目决策记录

| 决策 | 选择 | 替代方案 | 理由 |
|------|------|---------|------|
| DOCX 生成库 | `docx` npm | Pandoc、html-to-docx | 零外部依赖、样式干净、CJK 原生支持 |
| 样式覆盖方式 | `styles.default.headingN` | `paragraphStyles` + 自定义 name | 前者覆盖内建样式，后者会创建重复 |
| 字体编码 | 非 GB2312 | GB2312 后缀 | 用户明确要求 |
| Bundle 策略 | 单 bundle | 分离 chunk | 复杂度不值得 |
| 图片尺寸 | 手写解析 | image-size 包 | 避免 native 依赖 |
| 强调样式 | 楷体（不加粗） | 黑体 / CSS bold | 黑体太重，楷体更柔和；公文不用粗体强调 |
| 公文标题字体 | 方正小标宋简体 | 华文中宋 | GB/T 9704 标准指定字体 |

## 关键踩坑：Word 样式重复

**问题**：使用 `paragraphStyles` + `id: "Heading1"` + `name: "一级标题"` 时，Word 同时显示内建"标题 1"和自定义"一级标题"。

**根因**：Word 通过 `w:name`（不是 `w:styleId`）识别内建样式。`w:name="一级标题"` 被 Word 当作全新自定义样式。

**修复**：改用 `styles.default.heading1` API，它保留 `w:name="heading 1"`，Word 识别为内建样式的覆盖。中文 Word 自动显示为"标题 1"。

**教训**：`w:styleId` 是文档内部引用键，`w:name` 才是 Word 识别内建样式的依据。

## 关键踩坑：Title 继承全局首行缩进

**问题**：公文标题（Title）虽然设了 `alignment: CENTER`，但仍然有首行缩进，导致居中偏移。

**根因**：`styles.default.document` 中设了全局 `indent: { firstLine: 640 }`，Title 样式继承了这个属性，但没有显式覆盖。

**修复**：在 Title 样式中显式设 `indent: { firstLine: 0 }`。

**教训**：Word 样式继承中，子样式只有显式设定的属性才会覆盖父级。如果父级设了缩进，子级必须主动设 0 来取消。

## 关键踩坑：页码一字线字符

**问题**：初始用英文短横线 `-`（U+002D），实际应该是 Em Dash `—`（U+2014）。

**根因**：GB/T 9704 说"一字线"——指占一个汉字宽度的横线，不是英文标点。

**修复**：改为 `\u2014`（Em Dash）。

## 关键踩坑：字体变量命名

**问题**：最初用 `FONT_HEADING_H1`、`FONT_HEADING_H2` 命名——按标题级别命名字体常量不优雅。

**尝试过中文变量名**：`黑体`、`楷体` 等。虽然 TS 支持，但不符合行业最佳实践（工具链兼容性、团队协作）。

**最终方案**：拼音 PascalCase——`HeiTi`、`KaiTi`、`FangSong`、`SongTi`、`XiaoBiaoSong`、`CodeFont`。直接表达字体身份，ASCII 兼容。

**教训**：字体常量应按字体本身命名，不按使用场景命名。一个字体可能用于多个场景。
