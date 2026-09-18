# DOCX 导出：踩过的坑和做对的事

> 2026-04-03 开发记录

## 做对的事

### 选 `docx` npm 包，不选 Pandoc

Pandoc 功能强大，但对 VS Code 扩展来说有两个硬伤：一是用户必须自己装 Pandoc，二是它会往 `styles.xml` 里塞进约 30 个语法高亮的样式（AlertTok、AnnotationTok 之类），哪怕文档里一行代码都没有。`docx` 包只输出你亲手定义的样式，干净利落。

### 核心转换做成纯函数

`ast-to-docx.ts` 不引入任何 VS Code API，拿到语法树和图片 buffer，直接出 Word 文档对象。好处是 Jest 直接测，不用启动 Extension Development Host。VS Code 扩展里凡是能抽成纯函数的逻辑，都该抽出来。

### 图片尺寸自己读，不装额外的包

PNG 的宽高藏在 IHDR chunk 里（byte 16-23），JPEG 的藏在 SOF marker 里。手写几十行解析代码，就省掉了 `sharp` 或 `image-size` 这类 native 依赖。VS Code 扩展跨平台跑，native 包越少越安心。

### 字体常量按字体本身命名

最初写成 `FONT_HEADING_H1`、`FONT_HEADING_H2`，后来发现不对：一种字体可能用在好几个地方，按标题级别命名就绑死了。改成 `HeiTi`、`KaiTi`、`FangSong`、`SongTi`、`XiaoBiaoSong`，一眼就知道是什么字体。

中间还试过中文变量名（`黑体`、`楷体`），TypeScript 语法上没问题，但工具链兼容性和团队协作是隐患，最终用了拼音 PascalCase。

---

## 踩过的坑

### Word 样式重复：`w:name` 才是命门

用 `paragraphStyles` 定义样式时，写了 `id: "Heading1"` 和 `name: "一级标题"`。结果 Word 里同时冒出来“标题 1”和“一级标题”两个样式。

原因：Word 不看 `w:styleId`，它看 `w:name`。`w:name` 写的是“一级标题”，Word 不认为它是内建样式，就当作新样式处理了。而内建的“标题 1”（`w:name="heading 1"`）照常存在。

改用 `styles.default.heading1` API 就好了，这个 API 保留 `w:name="heading 1"` 不变，只覆盖字体、字号等格式属性。中文版 Word 自动把“heading 1”显示为“标题 1”。（2026-09 起改为 `importedStyles` 整体替换，见文末补记，`w:name` 的结论不变。）

一句话总结：**`w:styleId` 是文档内部的引用键，`w:name` 才是 Word 识别内建样式的依据。**

### 公文标题继承了全局缩进

在 `styles.default.document`（相当于 Normal 样式）里设了全局首行缩进 2 字符。Title 样式本该居中，结果居中之后还带着缩进，整个标题偏了。

Word 的样式继承规则：子样式只有显式设定的属性才会覆盖父级。你不写 `indent: { firstLine: 0 }`，它就老老实实继承父级的 640 twip。

### 页码的一字线不是英文短横线

GB/T 9704 说“数字左右各放一条一字线”。一字线是占一个汉字宽度的横线，对应 Unicode 的 Em Dash `—`（U+2014），不是键盘上的短横线 `-`（U+002D）。

### `docx` 库的单位换算

字号用半磅，16pt 写成 32。行距和缩进用 twip（一磅的二十分之一），28pt 写成 560。毫米转 twip 有现成的 `convertMillimetersToTwip()` 函数。这套单位体系很容易出错，全靠命名常量兜底。

### macOS 没有仿宋

Windows 上 `FangSong` 是系统字体，macOS 上不存在。但不用在代码里做平台判断，Word 自有一套字体回退机制，会自动找到 `STFangsong`（华文仿宋）。黑体回退到 Heiti SC，楷体回退到 Kaiti SC，都是 Word 自己处理的。

### 不需要拆分 bundle

本来打算把 `docx` 包构建成独立 chunk 做延迟加载。后来想明白了：esbuild 的 CJS 输出里，每个模块都是惰性初始化的，只有在首次 `require()` 时才执行。`docx` 模块只在用户点击导出按钮后才会被触发，单 bundle 已经自带延迟效果。拆分只增加了构建复杂度，没有实际收益。

---

## 决策一览

| 事项 | 选了什么 | 没选什么 | 为什么 |
|------|---------|---------|--------|
| DOCX 生成 | `docx` npm | Pandoc | 零依赖、样式干净 |
| 样式覆盖 | `importedStyles` 整体替换，沿用 Word 内建 `w:name` | `default.*` / `paragraphStyles` + 自定义 name | 只输出自己定义的样式，且不产生重复样式 |
| 字体编码 | 现代字体名 | `_GB2312` 后缀 | 用户要求 |
| 公文标题 | 方正小标宋简体 | 华文中宋 | 国标指定字体 |
| 强调样式 | 楷体，不加粗 | 黑体 / CSS bold | 楷体更柔和，公文不靠粗细区分 |
| 图片尺寸 | 手写 PNG/JPEG 解析 | `image-size` 包 | 避免 native 依赖 |
| Bundle | 单 bundle | 分离 chunk | 复杂度不值得 |
| 变量命名 | 拼音 PascalCase | 中文变量名 / 按标题级别命名 | 兼顾可读性和工具链兼容 |

---

## 2026-09-17 补记

### 库的默认样式会悄悄进文件

`docx` 库的 `Document({ styles })` 内部是 `new Styles({ ...defaultStyles, ...options.styles })`。只传 `default.headingN` 时，库自带的 Heading 1 到 6、Strong、List Paragraph、Hyperlink、脚注尾注一整套默认样式照样写进 styles.xml，样式面板里就多出一堆蓝色 Calibri 的英文样式。传 `importedStyles` 才是整体替换：数组里有什么，文件里就只有什么。代价是 `default.*` 随之失效，docDefaults 要自己用 `DocumentDefaults` 发射；Normal、Default Paragraph Font、Normal Table 三个 `w:default="1"` 样式要用 `ImportedXmlComponent` 手工拼，因为 `StyleForParagraph` 写不出 `w:default`，而 `ImportedXmlComponent.fromXmlString` 会多包一层 `<undefined>`。

### 标题文字不能打直接格式

目录域带 `\h \u` 时，Word 会把标题 run 上的直接格式（字体、加粗）原样复制进目录条目。标题 run 只留文字，字体全部交给样式，目录条目才会老实用 toc N 样式。顺带的好处：用户在 Word 里改“标题 1”样式就能全局生效。

### 文档默认的首行缩进会渗到所有段落

docDefaults 里的 `firstLine=640` 是所有段落的底色，不只作用于正文。表格单元格、题注、页码段没有显式归零，导出后单元格文字缩进 2 字、居中题注右偏 1 字、偶数页页码“空三字”。规律：凡是不该缩进的段落，都要显式写 `indent: { firstLine: 0 }`，靠“没设置”是靠不住的。前文“公文标题继承了全局缩进”是同一条规律的第一次出现。

### 样式级制表位要走原生 XML

`StyleForParagraph` 的段落属性只有 `rightTabStop` / `leftTabStop`，写不出点线前导符；目录条目样式的 `<w:tab w:val="right" w:leader="dot"/>` 用 `ImportedXmlComponent` 拼。

### 固定行距会把图片裁成一条

`lineRule=exact` 把行高钉死在 28 磅，行内图片比这高的部分直接不画，Word 与 WPS 都如此。v2.3.0 之前 styles.xml 里没有 `w:default="1"` 的 Normal 样式，WPS 没把 docDefaults 的固定行距算到图片段头上，图片碰巧能显示；补齐三个默认样式后固定行距真正生效，图片就只剩一条。规律同上一条：图片段的行距要显式写，独占段用单倍，文字与图片混排的段用“最小值 28 磅”，文字行仍在网格上、图片行按需撑开。

### WPS 不认识 TOC Heading

WPS 的内建样式名表（wpsio、docwriter 两个框架里都有一份）止于 Word 97 那一代：heading、toc、index、caption、footnote text 到 toa heading 为止，没有 Word 2007 才加的 `TOC Heading`。所以同一个 styles.xml，Word 把它认成内建样式显示“TOC 标题”，WPS 当成用户样式原样显示英文名。

WPS 自动目录插出来的“目录”二字不带任何样式，用户实测确认（2026-09-17）。之前从 wpscore 二进制里看到“目录标题”挨着“目录 1”到“目录 4”，推测 WPS 会按这个名字找样式，预定义了同名空壳，实测没匹配上：二进制里的字符串是 WPS 自家 API 的样式名表，不是自动目录块的引用。教训是二进制字符串只能当线索，不能当证据。现在的做法：面板可见的只有“目录标题”（styleId `TOCTitle`，带全部格式），`TOC Heading` 反过来做它的空壳并隐藏，只给 Word 的自动目录用；WPS 用户选中“目录”二字点一下“目录标题”。

### patch 版依赖也能弄坏构建

`@tsconfig/node-lts` 从 24.0.0 到 24.0.1 加了 `"types": ["node"]`，jest 全局类型随之从 tsc 视野里消失，`src/test/__mocks__/vscode.ts` 里的 `jest.fn` 全部报错。本仓库 `tsconfig.json` 现在显式写 `"types": ["node", "jest"]`。`npm update` 之后必须跑一遍 `npm run compile`，`npm test` 走 ts-jest 不会暴露这个问题。
