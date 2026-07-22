# 常见问题

## 装了插件但没有渲染效果？

1. 确认打开的是 Markdown 文件（`.md` 等）——插件只在 Markdown 语言模式下激活
2. 试试点击编辑器右上角的眼睛图标（切换 Markdown 渲染），渲染开关是按文件记忆的
3. 差异视图（diff）默认不渲染，方便审阅原始改动；可用 `markdownGongwen.defaultBehaviors.diffView.applyDecorations` 打开

## 活动栏里的"Markdown Gongwen"图标是什么？

那是 Mermaid 图表的内部渲染视图。Mermaid 必须在真实浏览器环境里渲染 SVG，VS Code 插件没有"无头 webview"可用，业界通行做法就是挂一个隐藏的侧边栏 webview（Markless、上游 Markdown Inline Editor 都一样）。

- 图表直接显示在编辑器里，这个视图本身没有任何需要操作的内容
- 只有文档里真正出现 Mermaid 图表时才会初始化（一次短暂的侧边栏切换）
- 不想看到图标：在活动栏图标上点右键即可隐藏，功能不受影响

## 导出的 DOCX 字体不对？

导出使用系统字体（仿宋、黑体、楷体、宋体）。公文大标题指定的方正小标宋简体为商业字体，插件不随包分发；系统未安装时 Word 自动回退到宋体，不影响文档结构。需要严格符合 GB/T 9704 的场合请自行安装方正小标宋。

## 引用块导出后是什么样式？

`>` 引用导出为楷体正文：无斜体、无背景底纹，首行缩进 2 字符，与正文同版式。中文公文排版不使用斜体，引用与正文靠字体（楷体 vs 仿宋）区分。

## 编辑大文件卡顿？

- 装饰渲染做了防抖和增量解析，超过 1MB 的文件仍可能变慢
- 可以用眼睛图标临时关闭当前文件的渲染
- Mermaid 图表多的文档，首次渲染需要逐个生成 SVG，属正常现象

## 链接、@提及、#引用点不开？

- 链接默认 Ctrl/Cmd+点击 打开；想单击直达可开 `markdownGongwen.links.singleClickOpen`
- @提及 和 #123 引用需要仓库有 GitHub 远程（origin）才能解析出目标地址；也可用 `markdownGongwen.mentions.linksEnabled` 强制开或关
- 差异视图中（未开启 diff 渲染时）链接提供器同样跳过，与其他交互行为一致

## 有序列表显示的编号和我写的不一样？

默认开启自动编号：全部写 `1.` 的懒编号列表会按位置显示为 1.、2.、3.，源文件不会被改动。源序号与显示编号不一致时会用警告色提示。不需要可关闭 `markdownGongwen.orderedLists.autoNumber`。

## 反馈问题

请到 [GitHub Issues](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues) 提交，附上 VS Code 版本、插件版本和能复现问题的 Markdown 片段。
