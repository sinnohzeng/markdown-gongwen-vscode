# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v2.3.2..v2.4.0) - 2026-11-17

### Added

- **(build)** add Makefile for release automation - ([16e167f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/16e167f5a810a1e0876002a26ec632d4b76ffa16))
- **(ci)** add OpenVSX publish step and inline deploy commands - ([816912d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/816912da3b748014a7ed982aa72d23354919309c))
- **(ci)** add automated npm audit fix workflow - ([02ec710](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/02ec7106daf8526df78e99ba3e99b3948fa47a2e))
- **(ci)** add test verification to automated npm audit fix workflow - ([8530678](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8530678697792aee49a3dab650e5a2e2ac9c22b0))
- **(config)** add image, horizontalRule, checkbox color settings - ([75d601e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/75d601e3f30a19bdc5e8b64ecaecb94b9fa58dc0))
- **(decorations)** ensure list markers and checkboxes match text color - ([3ca6419](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3ca641945ba99f5ee731240e1251e040890733c1))
- **(decorations)** add theme-aware background colors for inline code - ([158ca1b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/158ca1b661d156fa60ce28abb0ac1f1c64f32f80))
- **(decorations)** add configurable opacity for frontmatter and code block language - ([60f1555](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/60f1555c7c8df6d672e756716ebc3793149e7866))
- **(decorations)** add customizable inline code background color ([#59](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/59)) - ([1efe8b9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1efe8b907fd723e71539e4b37eb0122eda3e9ee2))
- **(decorations)** inherit markdown heading syntax colors when unset ([#60](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/60)) - ([2122f44](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2122f447f89601ffb65586883aab85bfd69d931a))
- **(decorator)** toggle checkbox on click - ([7aeb4e8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7aeb4e8be2d90a31dddc8cf94f02efc7d0e59f7f))
- **(decorator)** add defaultBehaviors settings for diff view and editor - ([f7d205f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f7d205fa07386540065b0cc6f81bfb6d9b041a36))
- **(decorator)** implement syntax shadowing M1 - keep semantic styling while editing - ([abe024c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/abe024c785cf24487de6e21eb2ebf77e81e776e1))
- **(decorator)** implement 3-state syntax shadowing model (Rendered/Ghost/Raw) - ([601d37c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/601d37c742434519a1479b42a8ab11435edda4a9))
- **(decorator)** 3-state model working correctly - ([0d574a4](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0d574a49b898e6702ea3a0f9813c8b2f22ffe74c))
- **(decorator)** add per-file toggle state with session persistence ([#28](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/28)) - ([487ad71](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/487ad71d5221f58c361e4d3be7a7b058fc377baf))
- **(decorator)** skip fenced and inline code when toggling checkboxes - ([e08ebaf](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e08ebaf748edfdfccad9added1c6ae5f4b6be789))
- **(docs)** add feature file outline validation - ([20bbea8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/20bbea8fa251262a255743178dbed623f24f0071))
- **(e2e)** add VS Code integration test suite - ([4897197](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/48971973b0f2fc1d19028e36b57ce4bbcfde8728))
- **(hover)** add image and link hover providers with comprehensive test coverage - ([9ab7e9a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9ab7e9ab2438deb9a753ab84bfd42af8397db14e))
- **(hover)** add code block hover preview with dynamic sizing - ([10c0dc4](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/10c0dc4daabdcfd1e265900537afd4278b9ac72a))
- **(math)** add support for inline and block LaTeX math rendering - ([dde7c27](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/dde7c27aad3d437bdf1b130422ccd731146f34bf))
- **(mermaid)** bundle Mermaid locally for offline support - ([9285fbf](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9285fbf2fcbc4c26564d1fe304bf485a0d570d42))
- **(mermaid)** add hover indicator and improve height calculation - ([ecca9e1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ecca9e1bdad7387bb3326382d0e90bf79438bdaf))
- **(mermaid)** add error SVG display for rendering failures - ([7a1bc7e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7a1bc7e7fbeb6fefc9aee22d51838485993e3873))
- **(mermaid)** minimize sidebar button visibility and add webview explanation - ([b9d663f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b9d663ffec6c1fc973ff1e23b88059b0103e2eea))
- **(ordered-list)** hide markers and replace with auto-calculated sequential numbers - ([8e98a52](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8e98a521191d9d1b338977fe01b4bcdfcd7ad611))
- **(parser)** implement task list enhancements with GFM compliance - ([6969e2e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6969e2e20d51816b9ac89c280646c423c7dab26d))
- **(parser)** add YAML frontmatter support - ([15ceb9c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/15ceb9cf635586e36e12d0e96c20d0f1135ad532))
- **(parser)** add inline code border styling with transparent backticks - ([d1cad62](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d1cad62783a6382a0018e423b785663e57ad51c3))
- **(parser)** implement autolinks and bare links - ([496770b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/496770bd441973a6e02e2c78b535e3d1ad722143))
- **(parser)** show only checkbox for task list items, not bullet - ([37a2818](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/37a281851e761ae6e953f0fa985cdffde62af25b))
- **(parser)** add support for highlight (==text==) syntax - ([0d424e4](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0d424e4dd2a991e15739802f7b83d81bdb8dddab))
- **(tables)** add preview-style table rendering - ([e87db16](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e87db165926bf215a1f343c02a1c9082848240aa))
- **(tables)** add option to highlight table header cells - ([bc650a1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/bc650a16428edb40efaf4147cc0d2fe58b01f4b4))
- **(upstream)** align architecture through 77d051a - ([c35a69d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c35a69de60e5134ec0105563d641d09619ed581f))
- **(upstream)** merge structural realignment for v2.4.0 - ([99d6e17](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/99d6e17506a7b18ea01af66d039d9c9441e54da4))
- Add emoji shortcode rendering - ([2988d28](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2988d281bbb273b306339cddef2a9f96d90b9c9d))
- add GFM table rendering with visual grid decorations ([#55](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/55)) - ([7869f40](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7869f405e5f2589aabac068cb8598d0a58a0a133))
- restore Gongwen features on modular baseline - ([5a381f7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5a381f75087ac6829c84bcd6ee2e3e4c1620c296))

### Changed

- **(agents)** add release checklist with validation steps - ([8637577](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8637577910574a72d17aa980448699df52d2c765))
- **(agents)** add Makefile quick reference to release section - ([32ba7ba](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/32ba7baf95fa2246d257c2eb1d906ec95176c825))
- **(architecture)** update documentation to reflect refactored structure - ([c4b28cb](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c4b28cb3ffa42b2acacb5cc1417c6124c15c41d7))
- **(assets)** update extension icon - ([dcbe093](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/dcbe093535372991b28cabe4124f579c0fc57f4a))
- **(build)** remove Makefile and streamline build/release with npm scripts - ([68c9391](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/68c93919cdb54363759c268affeef40a41197b72))
- **(bundle)** exclude TypeScript declaration files from package - ([27a1113](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/27a11137d9651d7b3ba416ce4ac440805f5ba2ae))
- **(ci)** split CD jobs into separate vsce and ovsx jobs - ([41569ec](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/41569ec6d969273798879b44be75033f051fda55))
- **(ci)** trigger CI build - ([6f60486](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6f60486bfd5c06c3ee115845e0a7948dc2e83a21))
- **(ci)** update CI workflow and add release job - ([c4b9321](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c4b9321999d176955a8190ad6115914736bd4b0e))
- **(ci)** add explicit GITHUB_TOKEN permissions to CI jobs - ([9e4ce71](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9e4ce7176f8f7adf553f180c2f8457ee6ba8d953))
- **(codeql)** exclude test files from CodeQL analysis - ([39c50a2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/39c50a20ee341df244ec1188b6a1a6887f1ab3f1))
- **(commands)** add CRLF anchor navigation test and update slug trim expectations - ([508895e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/508895e40b58d3a69f4093907e9f7002330660ec))
- **(config)** [**breaking**] remove redundant editor.applyDecorations setting - ([1562309](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/15623090fd2f58c5fe6dd72f8830cdccbce05b1d))
- **(decorations)** use ThemeColor for horizontal rule border - ([1edc6d1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1edc6d1de5a6ff1d309f7480fff0356547d26b80))
- **(decorations)** reduce horizontal rule border width to 1px - ([5e50ff0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5e50ff0c61bb238cf360c33fc326ba8306da7d82))
- **(decorations)** add bold font weight to checkbox decorations - ([6bc3c02](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6bc3c02842533e718c765fc9780776495ae3d18a))
- **(decorator)** eliminate O(n²) scope extraction via parser-emitted scopes - ([d8eb850](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d8eb850e4e0757702b43dd5f8ccf1d5cd25773b2))
- **(decorator)** use Range mock in mermaid diagram decoration tests - ([59c6414](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/59c6414ebea9c76446ba0520836aea57ab1cd21a))
- **(decorator)** toggle parser-recognized checkboxes only - ([96fc352](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/96fc352493f9590cd79298f598518fed7b5ddd1d))
- **(decorator)** add tests for checkbox marker clicks and code block protection - ([5dde601](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5dde601def6598a4cf96c27b252c032ea2834210))
- **(dependabot)** remove invalid monthly day - ([7d304ac](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7d304ac0217d7ef81fdf59758800f7c041cc45a7))
- **(deps)** adjust dependency strategy and add Dependabot - ([b4b2b10](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b4b2b10608c651ba4e56e75abd61506d0d04cc63))
- **(deps)** fix npm audit vulnerabilities - ([e72468f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e72468f108a1d242ebe8dfb10e538f597cf3cbdb))
- **(deps)** downgrade mermaid to v10.9.5 - ([41f3f51](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/41f3f514d087c732892dc73f95725fa27b2c4961))
- **(deps)** update mermaid to 11.12.2 - ([58585ef](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/58585ef9774e7f0eaf4a635759dc38918c699860))
- **(deps)** use fixed mermaid version 10.9.5 - ([7c226f8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7c226f88924df8178644668082c75ca836ba0bd9))
- **(deps)** npm audit fix - resolve high/moderate vulnerabilities - ([b3a8965](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b3a89654fa2ba13126665503a9078b9afee258ad))
- **(deps)** audit fix lockfile (flatted, undici) - ([e4a8d66](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e4a8d66a5385960a347ba924cc61140d19dd22a2))
- **(deps)** bump picomatch - ([fbce4c0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fbce4c0294e6cd39ceeb9114bf1d4c0acda13825))
- **(deps)** update dependencies to latest versions including esbuild, eslint, ts-jest, typescript - ([ad690ea](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ad690ea9819f23ea60ff5155e8389a7b03a7edc8))
- **(deps)** update all dependencies to latest and fix audit - ([1895b9b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1895b9b7552682b161b3eb650eab2090e44e8c00))
- **(deps-dev)** bump handlebars from 4.7.8 to 4.7.9 - ([1239880](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1239880fdfaefbd10990ce0ca3bd34aa13cb25ff))
- **(diff-context)** add tests for split pane diff view detection - ([8eb83f6](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8eb83f60318afc0a34e9d73d100ea8dd65a77df1))
- **(docs)** organize feature files into todo/done folders - ([ecddd75](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ecddd757ba41e10d2bc3192aa44d231f0474b1ce))
- **(docs)** exclude todo.md from feature outline validation - ([9395842](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9395842a68112b5553215ab4fe9d281999f03e63))
- **(e2e)** broaden release smoke for hovers, links, anchors, and parse - ([edc8a09](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/edc8a0972e70fec65b8d513e40ab1a32c6d09d8b))
- **(e2e)** make decoration rendering check deterministic - ([5e60d74](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5e60d747bd26b846eddf65be96c4a0407fe8da1a))
- **(example)** expand Markdown example document with comprehensive formatting and syntax examples - ([12624be](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/12624bed88eab109207c849e6faa38c78840eeac))
- **(features)** add feature request tracking and disable-for-diffs spec - ([9e575ec](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9e575ec59dfd5475bd6371eb4551f0b3212133fb))
- **(features)** add table column alignment feature specification - ([f955791](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f955791919fc1a60594ba744683e0a4ab12d6b65))
- **(features)** rename disable-for-diffs to show-raw-markdown-in-diffs - ([de52503](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/de5250361b0e4b892c6b2c47254895b5f3075a9a))
- **(features)** update status of multiple features to TODO and DONE - ([69a2f27](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/69a2f27d4bfa1a11addcbedaad5204a29b2f21ee))
- **(features)** split syntax-shadowing into milestone-based files - ([1268b33](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1268b33b45caa499e177b197f9f183b18ee49519))
- **(features)** consolidate todo into single list, move latex-math to done - ([c3f6cc9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c3f6cc985ac5521c4bdf06a65d5d6dca8da0cb15))
- **(hover)** add comprehensive tests for hover providers and click handler - ([6d3b995](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6d3b995943e5a50c6e568ba15c41ad8ab428a3c9))
- **(link-provider)** assert non-collapsed range for empty-alt images - ([fda0dcc](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fda0dcc5718a5c133e6a4d5a12f4e88246b713f8))
- **(link-targets)** add tests for relative and absolute paths with heading anchors - ([59f7176](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/59f7176ccd75d950301534f906c96b7b172a0696))
- **(lint)** fix linting errors and warnings - ([641c5ce](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/641c5cea172f943cd66fc763a0ae3f6fd9ac06b6))
- **(markdown)** add global toggle for default decorator rendering behavior - ([a4aa998](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a4aa998df37660abdec659f21b2e388fc2e85a85))
- **(math)** add JSDoc and inline comments to math scanner code-span logic - ([06dca09](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/06dca0987068c24365751b9885ebe5a54ea28141))
- **(mentions)** README, FAQ, and feature docs for mentions/refs - ([d6e1e6f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d6e1e6fbd89011ac4012c8df656c26758647ca11))
- **(mermaid)** implement Phase 1 performance improvements - ([2092b72](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2092b72d279930bd75b733b6c4cb5c36c119d555))
- **(mermaid)** Update mermaid to 11.15.0 - ([e935004](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e935004bdfd591cdfd0cd96829fa411ce3460c03))
- **(parser)** implement lazy loading for emoji map and improve test coverage - ([1141a8c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1141a8c6dc6bfd980384522314af90745982301a))
- **(parser)** add tests for opening frontmatter delimiter validation - ([c8d20c0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c8d20c02f842ab4c2af64b640a5274e6e3b63f6e))
- **(parser)** add tests for links and images with parentheses in URLs - ([e83dd26](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e83dd2611a3709a4a31a1a6e949a4c98c0d44084))
- **(parser)** add tests for mixed and nested table formatting fallback - ([71feb00](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/71feb008e4fc1a333647f8a5194de47931940994))
- **(parser)** add comprehensive tests for highlight syntax and decorations - ([9324c37](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9324c37b85fee66aed5eed527c48672840510cd4))
- **(position-mapping)** extract shared position mapping utility - ([a5fa4cc](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a5fa4cc06bbb70276b9e2edc44c47d0607127b74))
- **(readme)** add video demos section and update demo gif - ([a03743f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a03743f719fbc3e7b97d1195f39b0328e9d13061))
- **(readme)** adjust demo layout sizing - ([a836307](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a83630729a50af0d00c548c35d4826e4a7a3548a))
- **(readme)** add loading attribute to demo GIF for improved performance - ([2529f9a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2529f9af1c10bc5d639cba1e1f5101c8a295dcfd))
- **(readme)** update demo GIF layout for better visibility - ([0c0a7f2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0c0a7f25a414690482889518a89eab689933570e))
- **(readme)** improve marketing and user experience - ([4fa6b18](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4fa6b1811dbf306a9f0903bf9592e56da6dae4e8))
- **(readme)** add contributors to acknowledgments - ([c97f30b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c97f30bfdd24f5822aa3a8a10e9684a179157b12))
- **(readme)** GFM tables, roadmap, and contributors - ([9efdb61](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9efdb6162f7832785dcfd223baa74f8e8649c72a))
- **(readme)** friendlier badge names; rename workflows for marketing clarity - ([da221fa](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/da221fa9e779865076baafb9f9175cd5cd3c66bb))
- **(security)** add SC1 Security Requirements document - ([70d2fbc](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/70d2fbc8d1bfd638df6d782131cba0842375e43a))
- **(security)** add CodeQL workflow and exclude vendored mermaid - ([8e95ebf](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8e95ebfbdd3199918829841cdbeaff1f88b28364))
- **(spec)** mark US5 theme-appropriate math font color as broken - ([68871db](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/68871dbaa114bcd22903e3f8509b4179ef86da24))
- **(speckit)** add constitution, product spec, implementation plan, and tasks - ([46a2136](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/46a21369bcdc5d66b0e517db79685d4963bc6997))
- **(specs)** add 004-code-block-math-environments spec and design artifacts - ([d35a104](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d35a1048be1a645c3950dea6df32488d9301e2a0))
- **(test)** update test report paths to use dist directory - ([bf16d87](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/bf16d87a0f3f8bd30550be522cea17afe3b94f42))
- **(upstream)** merge modular baseline 96fc352 - ([6f3162f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6f3162f8268b79a57fc928fbd558633dd1ac7ec5))
- **(upstream)** record realignment evidence and workflow - ([ea40c7b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ea40c7b61d9d8943641776e18c8fa8cca50d24da))
- **(validation)** record final quality and rendering evidence - ([8efaee4](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8efaee4b1b3b6bf7be743d8fa733ef127e0e85d1))
- checkpoint DOCX typography and selective ports - ([aa19e3c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/aa19e3c7ff6e4c52bfd072b3ca3439cac6c5f047))
- add comprehensive CONTRIBUTING.md guide - ([8aee8b1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8aee8b10c7d35dee61b4e0db9f38c2da1b42dc3a))
- bump version to 1.3.2 - ([d007f78](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d007f78b5d025d37334b2444ec676cb60f7a7706))
- bump version to 1.3.5 - ([9cf141c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9cf141ced314cb93361b3a1c6a51c5bd9183261c))
- bump version to 1.3.6 and rename images folder to assets - ([00e9e39](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/00e9e3959e5c52ffb471191a9d4163312101d0e7))
- update README links and assets - ([f78a074](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f78a074b81f50ef3848b609b441fae3cc4da6261))
- update README - ([d956dd5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d956dd51b4f616151208f20a2b762cfe67f0155e))
- fix image layout in README - ([3209549](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3209549934600c42058d0afb3931de9d4ffa198f))
- reduce extension size from 8MB to 328KB by excluding demo assets - ([4c3a9d0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4c3a9d0528fd1bf5c8a6022e306f46b1c1df71a1))
- reorganize documentation into project and product directories - ([5b5dbcd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5b5dbcdad54e2e74bdfc308d1cfd26136292de13))
- add workflow chart design guidelines and update stages.csv format - ([af08413](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/af08413def883641e9a5f6d1c562c2c7c0b4ebf5))
- enhance example.md with GFM edge cases and formatting examples - ([222b299](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/222b29920aa0d6f8521c9887e8fc586bd5353a5c))
- remove obsolete project documentation files - ([164ac65](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/164ac650e985536b603a3b5db3fa7dfb710f7e2c))
- update PO1-Problem-Definition.md for improved clarity and organization - ([9e9eae5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9e9eae528399cdaced44dde6a6d9d7ca9492e50a))
- remove outdated AI documentation files - ([86d2908](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/86d290827a69059ac25be9c5b6fdaba3b4c4728a))
- refine documentation structure and update content organization - ([9cb50a3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9cb50a33f8ee86d8ea2143844dab96a547a582b0))
- add new use cases for Markdown extension features - ([cf03acf](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/cf03acfe67ceb18365c3343d2fd74aedbcb0d468))
- remove obsolete AI-related documentation files - ([c756db2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c756db20dac364b1c0e60887fa0cf1c4727761ca))
- remove obsolete documentation files and templates - ([2f37b52](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2f37b5273ff3dd541909db81d8dcfbb5febc2fa9))
- streamline documentation by removing outdated files and templates - ([4f86cde](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4f86cdecd5181c43d0790488dc7237648a4bb1f3))
- update artifact paths and validation scripts in workflow documentation - ([0e5abf3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0e5abf399048e260a19790bbea193e6413424775))
- enhance AGENTS.md with clearer human input protocols and execution steps - ([e01c2c1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e01c2c186be7545efa8db992c12779c118059c8b))
- update .gitignore to include new directories - ([d6b4bc9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d6b4bc963dc3e7d21f13788c4ab4ea1b6ffffcb7))
- update .gitignore to reflect new context directory - ([5863892](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5863892b3881f774e07852333c1f7dbc946e637a))
- update README.md to enhance Markdown features section and outline upcoming enhancements - ([655a4f7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/655a4f7307ca51a426ebbe4d8f26550cb83231a9))
- add feature implementation table and split features into separate files - ([fed98a1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fed98a13561363fcf2927496dca19daba7257418))
- add implemented features documentation - ([a8b9f08](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a8b9f08a51d8e95639be2db7153c6047288eedc7))
- add acknowledgements and license attribution - ([ebe8b4b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ebe8b4bfe3c8ee4902886967f6180c16d5363c97))
- update .gitignore to include context-example-repositories and examples directories - ([931e9c1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/931e9c13e50e0f6862e69627fd43b25655c41a7f))
- remove old vsix package file - ([2f450d0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2f450d0a8de5a44a20c47e54c0858f07789feffd))
- add E2E testing strategy for visual decoration verification - ([f8b4efd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f8b4efd94cff4639a6ee29c36919c9843836151e))
- update documentation guidelines and feature workflow - ([283a50f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/283a50fcf7b404453c4c465264e590e86a64a17e))
- add v1.6.0 implementation entry to AGENTS.md - ([41d011e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/41d011e8c37b658b3a718f4f4a57310989100b3c))
- add changelog update reminder to release process - ([242c3b1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/242c3b1fd0fd6f52329c9ab59dd5c0bef71d252a))
- add issue links to upcoming features in README - ([91d1fa7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/91d1fa7e25543faacff1e3254de65d077ff56e8c))
- add verification step for issue list in AGENTS.md - ([73c8f31](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/73c8f312f2e30f2e564365dfebc143f7ab875379))
- update section header for Configuration in README - ([88388f6](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/88388f6311a46d5680364d06ea12946d503cd2ca))
- reorganize upcoming features section in README for clarity - ([c7ba333](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c7ba33397e2a0db9572243e4746a6c822b2bff77))
- move YAML Frontmatter to implemented features section - ([b6f8234](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b6f8234f0bb4302e5d3e8138776c16c74febe5af))
- add OpenVSX and GitHub Releases links to README - ([f33f130](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f33f1303c447e131749d1da03fde8633c03c67d4))
- change list markers from dashes to asterisks in README - ([c75d2b7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c75d2b7f3c632493b260edbcd7f02f9775d3b4dc))
- update architecture documentation for position-mapping utility - ([c5f3365](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c5f3365c97f459205174d5de7a5f43b974b551a5))
- improve code quality, type safety, and DRY compliance - ([cd1e07e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/cd1e07eb10be8659c4661ccb9e93061f43f4ff05))
- remove agent roster and fix documentation inconsistencies - ([7561707](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/756170786c16070f2429d7e8c47a9c8fd133a0be))
- remove unused markdown preview settings and custom CSS - ([58279bd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/58279bd9b525f16124a1fae83680f7ae5884844d))
- uat 1 done - ([85cc44c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/85cc44c62875895a08265f5feffb8221f45ca2b5))
- organize UAT files into separate folder - ([e5aefa6](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e5aefa69144ebf07c3dd8d908a1ebfb26b9f64e0))
- remove M3 milestone and clean up feature documentation - ([94981e0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/94981e0085b37ce794d290be6630cb66222256ed))
- update documentation for implemented features from syntax-shadowing-m2 branch - ([42367bc](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/42367bc7b143915aa82068f2acd8f9d39aac6315))
- showcase syntax shadowing 3-state model in README - ([dce2ef1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/dce2ef132b0335b570752f7fdb11a8ee69fada9b))
- add code blocks and frontmatter screenshot to README - ([e0c5eac](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e0c5eac184217bfb3a5d2d93fcc4bba59669aa74))
- add syntax shadowing screenshot to README - ([f3361fd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f3361fd7651abc9591e79b1ba8d9f10780511671))
- reorganize README layout and improve demo section - ([5a186a3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5a186a345ac7ed2e558b16b21cf263847c09e3d9))
- update README and docs to reflect new test coverage - ([153fc67](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/153fc67781346b5502159616adbef03833b7700f))
- fix hover provider and click handler tests for refactored architecture - ([8091998](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/80919988b09efc8603ce3038beede3e05e1ed4bc))
- optimize VSIX package size by excluding dev files - ([8d00fa0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8d00fa0df5436aa084ad63a2d600a70c24ffdea0))
- update feature documentation and README for emoji support - ([7c62b77](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7c62b777236accb7353cdf7e84eff9e39c6ec604))
- add git-cliff to devDependencies - ([f44225f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f44225fed3fc91fa2b942346d164a519a78d8fba))
- remove duplicate media directory to reduce extension size - ([edc3351](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/edc335125ccf09280b3ffeab946df250ed287c8b))
- update feature documentation and test coverage references - ([e46613e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e46613eef86982580b26dc840a9d7be9712c2be8))
- emphasize pushing tags in release process - ([f766940](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f766940a530dede94381e341c2c4c407f73462b8))
- clean up assets and update feature docs - ([c088b9d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c088b9dba9d3797b2a8453feebe8b03120edd082))
- update autoplay demo gif - ([580d527](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/580d5276db3f946fd81591639c4946ce8439d0ca))
- update icon assets and table column alignment docs - ([2367631](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2367631f66bc4c23a41cdb7e509602cf06174192))
- document customizable syntax colors in README; react to colors config and theme in extension - ([ee79d9e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ee79d9eacc1763f5cbefe6dc10a25cf2cb3b52ed))
- add .eslintignore - ([ae20179](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ae20179cb385b8348e0edd456b80c8ce93f16bbe))
- update README and references for consolidated todo list and LaTeX done - ([33fbcab](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/33fbcababef1252ed335e62a53302ad7dc3626e2))
- improve README - showcase best features early - ([a098673](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a09867318cfc163221f079fbe3e2b0066a0fd41c))
- sync syntax color docs, hex JSDoc, and contributors - ([551119f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/551119f12799320c41c4e25df7ee84f050d1adc2))
- enhance unit test coverage with 80% gate - ([9b7a0c2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9b7a0c2eb84d0b98c36fc6bef5859b372f65b010))
- add Cursor e2e test support with configuration and noise suppression - ([2f594a2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2f594a2b10f905211ef9671ee6ec8634b9ed6e8b))
- Update SECURITY.md to clarify support for versions and reporting vulnerabilities - ([cdff2c3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/cdff2c32f1ff49c2e20b70dc2a3a741f80a9271a))
- Update dependencies - ([9847879](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/984787908d7e986f98aa78f4a5227ee18dbdd14b))
- Update .vscodeignore - ([d327a4c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d327a4c60894701540b0071b6c2141ccfc07a8c9))
- Update ESLint configuration to use defineConfig and add additional ignores - ([0fd7e05](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0fd7e0547312e994ce73e8ad60c42aed8df5ae2b))
- split parser and decorator, streamline extension wiring - ([234b80d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/234b80d562b52299937deb13fda440c03cfbac40))
- migrate from Jest to Vitest - ([d7dd191](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d7dd1919b304142714f38cde5fd4f869545a6272))
- Restructure Changelog generation - ([8c04f22](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8c04f22274b111c10049f6851b6f097cac9c2fe4))
- Update dependencies - ([8aae33c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8aae33cde52827ae212205f004f2a5c91f55276e))
- Update dependencies - ([436c8fd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/436c8fdd48f5b10d1a7e3d5da2e84bca16599587))
- Fix linting features on Windows - ([1417b4d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1417b4d829d12990ea5bcd3330ff23c96c86148b))
- fix lint errors introduced by merged PRs - ([fd7ef4e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fd7ef4ed80392d2e11c0e50abb34833a71ccfcf6))

### Fixed

- **(build)** exclude sourcemaps and dev config from extension package - ([12f2749](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/12f2749c69cb24d0cb76ae0ccef1916ca0150610))
- **(ci)** use npx vsce instead of global vsce command - ([5e4f7da](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5e4f7daccb033cefc3fa54f67f20ace023a60d3a))
- **(ci)** downgrade VS Code engines and fix Jest test script - ([e439c9f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e439c9fd3ff2b8209375ba0570953827f1f4469f))
- **(ci)** remove ci dependency from release jobs - ([43c4bf1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/43c4bf125ae1911482f4abeee73274e4e43cf67e))
- **(ci)** add workflow_dispatch to manually trigger releases - ([1510954](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1510954865018fe811cfc1965052568a67d3387b))
- **(ci)** restore ci dependency for releases with improvements - ([90525ab](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/90525ab66306fff88df5e714659dd8a2562ed1c6))
- **(commands)** support anchor navigation with CRLF line endings and clean slug trimming - ([56661f9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/56661f9ce17e4196de2adf0877f07fd6fcc31af7))
- **(commands)** support CRLF line endings when navigating to heading anchor - ([67784c2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/67784c2f01d6d0308021312d9e3990f2110c3bbd))
- **(config)** exclude examples folder from TypeScript checking - ([81abaf6](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/81abaf68acbf3b1e693808b108dc19a10f980f16))
- **(decorations)** prevent horizontal rule from expanding editor width - ([721a258](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/721a258296536ce138db5e4526375c0d55b3d8b7))
- **(decorations)** remove explicit color override for H4-H6 headings to respect editor theme - ([bba18c3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/bba18c3837a5ce127a6e725155a13c747d08c2bd))
- **(decorations)** use ☑ for checked checkbox to fix blank rectangle ([#47](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/47)) - ([bf507e4](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/bf507e4a49aca129482d8e763b3759e6fbde9fda))
- **(decorations)** make checkbox a hoverable, drawn target - ([b02fd2a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b02fd2a6d4ffae89924a2f6f713e06d8706ce9c2))
- **(decorator)** handle CRLF line endings correctly - ([7766aa6](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7766aa6fa8e41a27d289506cb90cdb26e3207126))
- **(decorator)** reveal horizontal rules in raw state when cursor/selection intersects - ([fa23fd0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fa23fd029316392f5cdb4b689d988ef35da1b6fe))
- **(decorator)** improve inline code scope detection and increase ghost visibility - ([76df38c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/76df38cde9a1f645495373446d8a73668e444ad3))
- **(decorator)** keep leading markers rendered on active line, show raw only on overlap - ([3891a98](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3891a983be92c6bdf11c5a73f2b50a7aca573732))
- **(decorator)** suppress code block background in raw state to restore selection visibility - ([fc88cc1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fc88cc117b106ca8767add4f88586fecc92347aa))
- **(decorator)** add selection overlay to restore visibility in code blocks - ([6d4cc12](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6d4cc12fb677511aeef6dd793340dc346da341b6))
- **(decorator)** toggle only real checkboxes and keep the user's selection - ([1ce4fa3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1ce4fa37858f4b9bb1c0558ff2af3eec35b3f4ae))
- **(decorator)** reveal checkbox as a unit off a dedicated scope - ([20c86cf](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/20c86cfcbaf366b2f1c7f4d30ce6f496798fe16a))
- **(decorator)** scope diff view detection to editor instead of all visible windows - ([ce3453b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ce3453b27a35c77adce6e07036b60b23f7a87002))
- **(decorator)** support clicking rendered checkboxes and protect code blocks - ([ac44bd1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ac44bd1c726af3c29934d586cd7d596f84220870))
- **(deps)** pin xmldom to 0.9.9 - ([72e3146](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/72e314655ab6c6c5020432c1ca29f3b200166eea))
- **(deps)** bump esbuild to 0.28.1 via npm audit fix - ([659726e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/659726e5fd70401484c5537efaeedd4623ac4c11))
- **(docs)** restructure image-ux-improvements to match feature file format - ([ccac3fc](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ccac3fcf6761e345233533a6400f879ab7735d28))
- **(docs)** correct markdown table formatting in UAT template - ([474c494](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/474c4948c18b5a71411a3dcccfb030e3ff3db94e))
- **(hover)** convert Mermaid SVG to data URI for hover popup - ([2087f2d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2087f2d38a7f85a70d502bce72121db91c4d1006))
- **(link-provider)** handle CRLF line endings in table of contents links - ([57f40c7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/57f40c710f860c42c5e60a64d0411d005fdb3261))
- **(link-provider)** expand zero-width document link ranges for empty image alt - ([b8807ea](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b8807ea71c7b8edcceb1c8f1dd67d9473084cb3d))
- **(link-targets)** separate anchor fragments from file paths in link and image targets - ([161e548](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/161e548476443a8a47359ae2bde403276dd762d2))
- **(link-targets)** navigate to heading anchor when clicking file link with fragment - ([4852468](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/485246834f24114db934fff669620028e2c1ccb1))
- **(links)** decode percent-encoded paths and match Unicode heading anchors - ([4610c38](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4610c38eafdc9ff19332cfd80d155083906d88f3))
- **(lint)** resolve all ESLint warnings and improve config - ([ff2479d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ff2479dba205c0322073a179c8505ae607f67ffa))
- **(math)** correct block math SVG height and body line count - ([1a79aa8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1a79aa806291b5ec47daba4ed93e654d9049fc9d))
- **(math)** exclude inline code spans and enforce paragraph bounds in math scanner - ([fffc5e2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fffc5e2d712eeed9f6a0a1b949eb38a1b789900a))
- **(mermaid)** correct SVG extraction from cheerio processing - ([69765bf](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/69765bf812c08a8e8b77985cfda086433244fd31))
- **(mermaid)** render gantt charts in explicit-width container to fix zero-width layout issue - ([ae88bb4](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ae88bb4a28887120cb250b2f5360e12b6c496044))
- **(mermaid)** resolve race condition in concurrent render requests - ([1c2fcb1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1c2fcb13fc8271f2eb08b565f68daa2a75b53b8c))
- **(mermaid)** resolve memory leaks and improve hover rendering - ([0416a0d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0416a0d7000e60df470ea36bc3c3f114c945629d))
- **(mermaid)** handle large SVG rendering in hover dialogs - ([9e21f75](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9e21f75acdc11d44a0981f88f43df42074190e79))
- **(mermaid)** ensure webview is created in VS Code and set view container title - ([98f8c75](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/98f8c7542c66a1ba8375ff05ec650dda9f2b1032))
- **(mermaid)** constrain diagram width to editor viewport ([#50](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/50)) - ([f3dd74f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f3dd74fc87604c3723d28f1832db24bb2b835beb))
- **(mermaid)** correct width constraint, cross-platform build, e2e tests - ([43d398e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/43d398e5919d1a2a06473422bf051ed79446466f))
- **(parser)** prevent ordered lists from being replaced with bullet points - ([67ad46f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/67ad46fc6ef77cd7d15b12276e2d799d2dbc45b1))
- **(parser)** prevent markdown formatting decorations inside code blocks - ([9c75ab8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9c75ab84fbc5c1367a1774957ce8b52ce90c4b67))
- **(parser)** prevent markdown formatting decorations inside code blocks - ([cd5f859](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/cd5f8598d5ca0705e5b6be1b86771cd6f363b1c1))
- **(parser)** render bracket-style mailto/URL links as regular links - ([d88b058](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d88b05880c096ccc9165f1d6ba7790849394f1ca))
- **(parser)** address GFM table findings (boundary, docs, tests) - ([35c09bc](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/35c09bc071d54e2473c71541fc8b2079ff906f86))
- **(parser)** collapse task-list marker and scope checkbox to its syntax - ([d4e46a7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d4e46a7340c118b6044e5f5e437fcaba9cfcee49))
- **(parser)** validate opening frontmatter delimiter line format - ([4f7dcc8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4f7dcc8af674b8032d4eed97bddfc71573c883e7))
- **(parser)** support parentheses inside link and image URLs - ([1f1b9a6](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1f1b9a668a806829fe622fa06c95449fb16eaf0b))
- **(parser)** prevent false whole-cell styling on mixed and nested table content - ([7e5d83c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7e5d83ca0a96368471a8ee41ab399f18bc0bc3fb))
- **(parser)** measure Hangul and fullwidth cells as double-width - ([6137ae8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6137ae85541eab7ff9414b795c3a099147ef338b))
- **(release)** address PR review feedback - ([d58908d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d58908d43071cb7829d00bce0f870196b12610f4))
- **(release)** address PR review feedback - ([2bdc35c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2bdc35c22ce5557de68c2914579ad5dee502de62))
- **(release)** improve git-cliff availability check - ([09bcae2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/09bcae2cac1e5e6c3395a9c189a87e55f68706a7))
- **(scripts)** exclude AGENTS.md from feature validation - ([5286d75](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5286d75bc0dafb9e40ebb6964471d921442c6044))
- **(validation)** restore merged runtime and test contracts - ([7ab5d5d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7ab5d5d7821baecba470f73d6a0bb4f02362d115))
- update workflow node identifiers and enhance validation script paths - ([fe006b3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fe006b3e8c1d7728c88a31ee132541bd53b18f2a))
- restore accidentally deleted icon.png - ([21f565f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/21f565fb457ad0154ec4416f3cf98d422afc2d22))
- update icon.png - ([0d9d040](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0d9d040d80fa6c5af603ae3d2577a60d48001398))
- state audit - ([a21c093](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a21c0938b6349affb503312fa5d9db3dfd960fc2))
- support skill, markdoc, and mdc language IDs (#58, #61) - ([61cf0e2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/61cf0e262a262ce97fcce8d834a65adb243dd683))

### Build

- **(versioning)** add release generation instructions - ([0a61a8b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0a61a8bbad40f69c4afb9d0fb8be21e4fb1c06ae))
- **(versioning)** add release generation instructions - ([4b17246](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4b1724607c56af35591d7d24236c467fae2072c6))

### Ci

- **(audit-fix)** use PAT for checkout and create-pull-request - ([cf1db05](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/cf1db0550fc8a201351fd7fbabb5956ef1f66c10))
- **(codeql)** upgrade to codeql-action v4 and document default-setup conflict - ([b681aa5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b681aa5a90ec7f1e02b83706f6489db874ef5384))
- update GitHub Actions to use latest checkout and setup-node versions - ([0f20630](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0f20630fe1d31dbebb1e8416caf85c11e893ae06))
- add npm-audit workflow for dependency vulnerability badge - ([ea7147a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ea7147a00ee3f75a3e38553178d4822974c36150))
- reorganize CI workflow - ([c43886d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c43886d93e60b9ada99bd8ff7ec326653fe9e1f1))

## [2.3.2](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v2.3.1..v2.3.2) - 2026-09-18

修 2.3.0 样式表收口带出的两处回归，都出在导出的 Word 里。

### 修复

- **图片被裁成一条**：2.3.0 补齐文档默认样式后，固定 28 磅行距真正落到了图片段上，比行高的图片只露一条。现在图片独占段用单倍行距，文字与图片混排的段落和含图片的表格单元格用“最小值 28 磅”，文字行不掉网格，图片行按图高撑开
- **目录标题**：WPS 插自动目录后“目录”二字是宋体五号，样式面板里还多一条英文名的“TOC Heading”。WPS 不认识这个 Word 2007 才加的内建样式，也不会给“目录”二字套样式。现在面板上只留“目录标题”一条，选中“目录”二字点一下即可；“TOC Heading”隐藏起来只给 Word 的自动目录用，外观继承“目录标题”

## [2.3.1](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v2.3.0..v2.3.1) - 2026-09-18

维护版，导出与编辑功能没有改动，换的是插件图标，修的是商店页上那条失效的版本徽章。

### 改进

- **插件图标**：改为透明背景，深色主题下不再顶着一块白底方块。Markdown 标记下方加上 GB/T 9704 字样，等宽字体，与标记齐宽

### 修复

- **版本徽章**：shields.io 在 2026 年 4 月停用了整个 Visual Studio Marketplace 系列徽章，商店页上的“VS Code Marketplace”一栏因此显示成灰色的 retired badge。现已换到仍在维护的徽章来源，显示的是真实版本号

### 其他

- 清掉 `package.json` 里一段不会生效的 `__metadata`，发布脚本改为可以显式指定版本号

## [2.3.0](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v2.2.0..v2.3.0) - 2026-09-17

这一版的重点是目录：导出文件自带“目录标题”与目录条目样式，在 WPS 或 Word 里插入目录后不用再手动改字体。

### 新增

- **目录样式**：预先定义“目录标题”（黑体三号居中）与“目录 1”到“目录 3”（仿宋三号逐级缩进）样式，插入自动目录后“目录”二字直接就位
- **`[TOC]` 目录标记**：Markdown 里单独一行 `[TOC]` 导出为“目录”标题加目录域，收录 `##` 和 `###` 两级标题，打开 Word 时按提示更新域

### 改进

- 表头改为黑体不加粗、水平居中，表体按列对齐标记对齐，所有单元格垂直居中
- 新定义标题 5 到 7、超链接、脚注和尾注的正文与引用标记、默认段落字体，都按国标或公文惯例定好
- 移除 docx 库自带的 List Paragraph、Strong 等无关样式，样式表只剩插件定义的样式
- 标题文字不再带直接格式，在 Word 里修改“标题 N”样式即可全局生效
- 导出日志改用带时间戳与级别的输出通道

### 修复

- 表格单元格、图表题注、偶数页页码此前继承了正文的 2 字首行缩进，现已归零
- 代码块、公式源码不再继承正文的首行缩进与两端对齐，改为左对齐
- 引用块里的表格此前被丢弃，现照常输出
- 普通文档打开 Word 不再弹出“是否更新域”提示，只有含目录的文档才提示

### 内部

- 依赖兼容性更新，`tsconfig` 显式声明 jest 类型，发布脚本改为向 CHANGELOG 追加条目，测试增至 875 项

## [2.2.0](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v2.1.0..v2.2.0) - 2026-08-07

### 新增

- **图表题注导出**：Word 里的表格和插图现在带规范题注，表题在表上方、图题在图下方，黑体小四居中，编号体例符合 GB/T 7713 报告规范。写法：图题就是图片的说明文字；表题写“表1 标题”放在表格上一行
- **导出更可靠**：未保存的新建文档会先提示保存；已有同名文件时可选择另存为；文中有 Mermaid 图等暂未支持导出的内容时，导出后会明确提醒您哪些内容没有呈现，不再静默丢失

### 改进

- Mermaid 渲染更稳：加载失败可一键重试，错误提示改为中文
- Remote-SSH / WSL 远程开发环境下导出不再丢失图片
- 命令与全部设置说明改为中文表述，更易理解
- 安全更新与内部质量提升（修复 1 项依赖安全漏洞，测试增至 853 项全绿）

## [2.1.0](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v2.0.2..v2.1.0) - 2026-07-22

### Added

- 移植上游 v1.24.2 有价值改动，配置改动即时生效 - ([07b1934](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/07b193439b4a4dfb07d7c89d9e383c1528ea5dd3))

### Changed

- 清理技术债，插件包从 9.4 MB 降到 2.4 MB - ([ff64438](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ff64438227f5b56a7322a66472688945244aa25e))
- 重写商店描述，清偿文档债 - ([7cf1fa8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7cf1fa8a99d83929a29a98bce5ed9ddff4d81254))

### Fixed

- **(export)** 引用块改楷体正文、列表保持首行缩进、修复导出通知与取消 - ([491d28d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/491d28df158ac2f55d5dda39673fdf639064a44d))
- **(mermaid)** 渲染视图改懒初始化，中文化占位说明 - ([b06884a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b06884aae09e472e033de1a9f713a3795e2931de))

## [2.0.2](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v2.0.1..v2.0.2) - 2026-04-10

### Changed

- 完善发布教程和经验文档，同步本次发布全流程踩坑记录 - ([0162666](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0162666ec783bd33985073ed39f6e30fbe0ced8d))

### Fixed

- **(export)** 标题启用“与下段同页”，改名 Markdown Gongwen 公文 - ([31fe29c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/31fe29c326de48636d6bfcf6d8f32314e8cbd01b))

## [2.0.1](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v2.0.0..v2.0.1) - 2026-04-04

### Fixed

- 表格导出改为全框线，重写 README，移除版权敏感字体 - ([2cf2253](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2cf2253a79b93e255ecb3fe41ff4eba855e12e13))

## [2.0.0](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v1.1.0..v2.0.0) - 2026-04-04

### Added

- [**breaking**] 全量重命名为 Markdown 公文，与原版插件彻底解耦 - ([3de18d0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3de18d027bd8f895dfe30b26eb962b8e1b6131ae))
- 更换项目 logo 为中国红 Markdown 标志 - ([79ebd0c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/79ebd0c596144c08a951ea4621584d1cf271bb9a))

### Changed

- 润色 DOCX 导出功能文档，去除 AI 腔调 - ([6259bc5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6259bc54e57f75a39efe06a149fa5269a95487f6))
- 重写 CONTRIBUTING.md 和 SECURITY.md，恢复 AGENTS.md 和 CHANGELOG.md 英文原文 - ([696cb5f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/696cb5f0bf256988b19b3a23bd62ca3781655fd2))
- 更新发布教程，修正 Azure DevOps 登录入口和 PAT 创建流程 - ([fe434ad](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fe434ad91e82f6d39b3deb67eb491ee1e9c09715))
- 补充 .vscodeignore 遗漏临时文件的排错条目 - ([f95f047](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f95f0474de766361ca63328f758ce2be9c503e06))

### Fixed

- 清理 ESLint 警告，0 errors 0 warnings - ([4ea6d60](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4ea6d601802d67f01b00359713b89400e9c9f389))
- 修复 DOCX 导出模块编译错误，排除临时文件打包 - ([c27b4d3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c27b4d3b315c941a6771340c25c10ca25066e286))
- 修复 feature 文档校验，支持中英文章节名 - ([e1a757c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e1a757cc194775e8350d69ca43b089b3958d24fb))

## [1.1.0](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v1.0.0..v1.1.0) - 2026-04-03

### Added

- 正文字号/行高配置，修复 fontWeight 与 textDecoration CSS hack 冲突 - ([c0e60f9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c0e60f9f4534502c58c132c566ad993b0825b164))
- 标题字号严格遵循 GB/T 9704，正文改用 editor.fontSize 方案 - ([6619c3c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6619c3c1aa3e5203c1c43a341a02b44dfb218512))
- 加粗和正文全部使用思源宋体，修正 Noto Serif SC 字体名，新增字体安装指南 - ([dbc2733](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/dbc2733046f4e2c2083b9188c564c5b11edccc31))
- 新增一键导出 GB/T 9704 党政公文 DOCX 功能 - ([ca81a86](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ca81a86b1b8ad5f4ba11966b9402a84c3985b739))

### Changed

- README 改为简体中文，新增行间距教程，迁移记忆库到项目目录 - ([875c856](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/875c8563017e1b991783c2f4fb702988e72e0f5b))
- 行间距教程改为 [markdown] 语言作用域，不影响代码文件 - ([69eeef7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/69eeef75e6662604cd3e32a43f5bbc0d32442a23))

### Fixed

- 思源宋体优先级调至字体栈首位，确保已安装时优先使用 - ([1c38f4b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1c38f4b89a23f78f1ba25471ac33ce5ae4258131))

## [1.0.0](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v1.3.1..v1.0.0) - 2026-04-03

### Added

- **(build)** add Makefile for release automation - ([5e67bed](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5e67bedea71970e58d30f180dee2f484b075ae4f))
- **(ci)** add OpenVSX publish step and inline deploy commands - ([bc64d3e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/bc64d3ecc6a322414ddbe1bcd3f3f2438c979c99))
- **(ci)** add automated npm audit fix workflow - ([dabc9f9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/dabc9f909bd1b312b3e42f42053055eef2f08577))
- **(ci)** add test verification to automated npm audit fix workflow - ([f4a9d88](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f4a9d88855306f669f8a35122614615c7e07662c))
- **(config)** add image, horizontalRule, checkbox color settings - ([300adb1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/300adb1e6f9928c8dce228acefd69a0cbd377987))
- **(decorations)** ensure list markers and checkboxes match text color - ([dac65ed](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/dac65ede3d8e23f15401ea07edb57ebda843a7db))
- **(decorations)** add theme-aware background colors for inline code - ([c2fdb46](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c2fdb4627bf5ca97efd96ffd594072db47bed277))
- **(decorations)** add configurable opacity for frontmatter and code block language - ([5176599](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/51765993af4b4c0e4cd31c6af1949532cce2b46a))
- **(decorations)** add customizable inline code background color ([#59](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/59)) - ([be9431d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/be9431d2efe985add907b4ed029836978b7b4c8f))
- **(decorations)** inherit markdown heading syntax colors when unset ([#60](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/60)) - ([61a663f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/61a663ff85b41eb4ee6c1b6303ec436175a2a083))
- **(decorator)** toggle checkbox on click - ([417f168](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/417f168fdbc087d01b58d4896f06d79eee794ac3))
- **(decorator)** add defaultBehaviors settings for diff view and editor - ([8151f54](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8151f5482d7fc172723987a8f30c86d7692674f9))
- **(decorator)** implement syntax shadowing M1 - keep semantic styling while editing - ([259916d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/259916debb4488af45a6dfcf88de2dbd584583c4))
- **(decorator)** implement 3-state syntax shadowing model (Rendered/Ghost/Raw) - ([96fb9c8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/96fb9c82e29769a9701399117c59e691c0e1ba06))
- **(decorator)** 3-state model working correctly - ([72704f9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/72704f9cab9761b0f9cdbc6edaf7daa0185e58a7))
- **(decorator)** add per-file toggle state with session persistence ([#28](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/28)) - ([d9f501b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d9f501be108c66024f07292b2c2da90dbb726ab0))
- **(docs)** add feature file outline validation - ([b614076](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b61407620a06a10e7805702f9cc86523584656be))
- **(e2e)** add VS Code integration test suite - ([e201e91](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e201e91a34d95fd60b5f86b43900908a5905399d))
- **(hover)** add image and link hover providers with comprehensive test coverage - ([af37c16](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/af37c1698b5b4b17f90b4f277dd8821d4a3a2ba9))
- **(hover)** add code block hover preview with dynamic sizing - ([de2eb4c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/de2eb4cee7cf9ad554b2994678e90870d9bca949))
- **(math)** add support for inline and block LaTeX math rendering - ([5e46074](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5e460740d39334a841b5a999a5a3d9858c03b1a5))
- **(mermaid)** bundle Mermaid locally for offline support - ([a0f1f38](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a0f1f38ddb1e73393cee72f3364c2cd27ce4b639))
- **(mermaid)** add hover indicator and improve height calculation - ([255537a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/255537afc084058e56bd8c90db2a803b0633837a))
- **(mermaid)** add error SVG display for rendering failures - ([02b80d7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/02b80d77d19014eaf99cb14fec779ae79f638065))
- **(mermaid)** minimize sidebar button visibility and add webview explanation - ([41893a3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/41893a3020907b9b32ce453a4ce7f6561ea616aa))
- **(parser)** implement task list enhancements with GFM compliance - ([3e5b76b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3e5b76b5f65f30e015b542917f37ee89fd10a7d9))
- **(parser)** add YAML frontmatter support - ([a398497](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a3984970d4caac0616d8e4b1bcfb3511ac35fb38))
- **(parser)** add inline code border styling with transparent backticks - ([034f52c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/034f52c548e85846ac5c88e5db34a1a2d3f45a72))
- **(parser)** implement autolinks and bare links - ([40f17d0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/40f17d0c180711ceba794f34d39a44afc1d155f1))
- **(parser)** show only checkbox for task list items, not bullet - ([a08b714](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a08b714a6c977fd8e775c168d44de382ab42bebb))
- Add emoji shortcode rendering - ([dfcb036](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/dfcb0367a949c12689b613d5962aaf0022f7895f))
- add GFM table rendering with visual grid decorations ([#55](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/55)) - ([822191e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/822191e78988902afb3d563b01e3b83d090c3470))
- 新增字体自定义功能，内置党政公文排版风格，重命名为“Markdown 公文视图” - ([9a4fdbe](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9a4fdbe67f77271dc6b8bb27bf3054b7009067bb))

### Changed

- **(agents)** add release checklist with validation steps - ([8e80de6](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8e80de6b029b954fefe9d42b6f3897da7a3c1470))
- **(agents)** add Makefile quick reference to release section - ([590b0cd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/590b0cdff787bc0c4c77833b3a14da40bd29079b))
- **(architecture)** update documentation to reflect refactored structure - ([1c6acf3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1c6acf348cb499a4064558afd5224bc8934640b9))
- **(assets)** update extension icon - ([35ed512](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/35ed512426b093562fdb4d4965c539ec2382ca88))
- **(build)** remove Makefile and streamline build/release with npm scripts - ([48fafba](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/48fafba43618071f9a63fb8d0f6b19a448b9302c))
- **(bundle)** exclude TypeScript declaration files from package - ([ca92858](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ca928583a63988c42818d9423aa2ccc392efa1bd))
- **(ci)** split CD jobs into separate vsce and ovsx jobs - ([20da28a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/20da28af749f0628e3506248cbabeb33ad36939a))
- **(ci)** trigger CI build - ([086a62a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/086a62ad7b4677681fd67be2b1dab439be788b91))
- **(ci)** update CI workflow and add release job - ([5c87d00](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5c87d00a1da8ab4d6bf4f70acb261a26273fb714))
- **(ci)** add explicit GITHUB_TOKEN permissions to CI jobs - ([601bcfd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/601bcfd67fd4bbe2db200bd7a35f307c6eeb50f2))
- **(codeql)** exclude test files from CodeQL analysis - ([9ff37d9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9ff37d9848adf80f9e78a3bda32d22925fcfbcab))
- **(config)** [**breaking**] remove redundant editor.applyDecorations setting - ([19e61cd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/19e61cd26f433633da3bb3df888952d7c8c0c06c))
- **(decorations)** use ThemeColor for horizontal rule border - ([bb0c42c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/bb0c42c6f42d2236437cf5370601a9f60117cfa8))
- **(decorations)** reduce horizontal rule border width to 1px - ([cec7af0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/cec7af05bff732972bbd05c4b2b1eb03680aa90d))
- **(decorations)** add bold font weight to checkbox decorations - ([ed733b1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ed733b1c85ca02aca27a3b1a942585f6a2716ef4))
- **(decorator)** eliminate O(n²) scope extraction via parser-emitted scopes - ([6dd41d6](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6dd41d61ca924a1b37e2e093640e030b28ad77b8))
- **(decorator)** use Range mock in mermaid diagram decoration tests - ([750f6c8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/750f6c84edc1f9add98bb143b6b9c8c0d09e1ce1))
- **(deps)** adjust dependency strategy and add Dependabot - ([c5579b1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c5579b13c8addcdd5e4477fb2a2229f8ebb0edd6))
- **(deps)** fix npm audit vulnerabilities - ([32c5a27](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/32c5a27b71015280164e2e54facfb359722fd908))
- **(deps)** downgrade mermaid to v10.9.5 - ([7e68cd8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7e68cd887c97de4668e0caf429fcf51fcbd591df))
- **(deps)** update mermaid to 11.12.2 - ([7f3f7a2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7f3f7a2ae05547c3f704bc72de303d180ae20523))
- **(deps)** use fixed mermaid version 10.9.5 - ([0fbecbe](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0fbecbee8ed9eec809038a9d621bb4f4fe3cd417))
- **(deps)** npm audit fix - resolve high/moderate vulnerabilities - ([401b6c2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/401b6c293536831e0af6f94fe0c9dde4578a2ae4))
- **(deps)** audit fix lockfile (flatted, undici) - ([dbdcbd9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/dbdcbd9b783171f5832175bbc004b5f11ce57e91))
- **(deps)** bump picomatch - ([664515d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/664515d988d25c7b34e2f5d621b176576393503d))
- **(deps-dev)** bump handlebars from 4.7.8 to 4.7.9 - ([ea1114b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ea1114b76071bbc25f56c231dd63a9a221c2b31e))
- **(docs)** organize feature files into todo/done folders - ([f916d67](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f916d67f322c03dab2e6ed5517681443174580ed))
- **(docs)** exclude todo.md from feature outline validation - ([cf0be5c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/cf0be5c1c2cf902a55f3ba01c61c6c5f0f7b9c76))
- **(example)** expand Markdown example document with comprehensive formatting and syntax examples - ([aa2a9fb](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/aa2a9fb5248bb24649ce8d28fd806a3499646cbb))
- **(features)** add feature request tracking and disable-for-diffs spec - ([b1cd8a7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b1cd8a7f2de9d649f2f9be54879f6b9d21f51958))
- **(features)** add table column alignment feature specification - ([abf89c3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/abf89c388064efe9217d632164d69e345e2c7984))
- **(features)** rename disable-for-diffs to show-raw-markdown-in-diffs - ([21192bb](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/21192bb0afaba10fa6820ad4fccbc25d059166fa))
- **(features)** update status of multiple features to TODO and DONE - ([06c0172](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/06c01722f0897e7a7db28d396d07d2b62089b40a))
- **(features)** split syntax-shadowing into milestone-based files - ([d917020](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d917020165f74bb32d375a293bca55dbddeb7747))
- **(features)** consolidate todo into single list, move latex-math to done - ([058719c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/058719cb43704163fbf0dd3d600e1bcc9bfdc6f3))
- **(hover)** add comprehensive tests for hover providers and click handler - ([5c4040a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5c4040a6916c475ec30495774a089bafde7e98d6))
- **(lint)** fix linting errors and warnings - ([f9fcf6a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f9fcf6abac3cc7e121fecc839d4352b3d7299281))
- **(markdown)** add global toggle for default decorator rendering behavior - ([21ceb7f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/21ceb7f26459c37d7eb4b314810d17902adf710b))
- **(mentions)** README, FAQ, and feature docs for mentions/refs - ([4c84ad6](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4c84ad628ae3baf734ef4567574231e27bde656c))
- **(mermaid)** implement Phase 1 performance improvements - ([df25b4a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/df25b4af5252c47db7d414fce84c5e42e72d4c3c))
- **(parser)** implement lazy loading for emoji map and improve test coverage - ([559d177](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/559d177cd55dacb28b71e37026eb1742031002b9))
- **(position-mapping)** extract shared position mapping utility - ([5fd162d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5fd162dd99bd6f7692f51c869e95a040ae581b61))
- **(readme)** add video demos section and update demo gif - ([2d4cdb5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2d4cdb511e81defd1af6e70ec03df39f160dcbae))
- **(readme)** adjust demo layout sizing - ([1222f34](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1222f346eaf08854151b278d8af8b4b2bb291924))
- **(readme)** add loading attribute to demo GIF for improved performance - ([30fb8cb](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/30fb8cbf31d0954cefda6aba6ec59e685792ea1b))
- **(readme)** update demo GIF layout for better visibility - ([8456b24](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8456b24d43d100d5ae0823b1181b27b29c277c00))
- **(readme)** improve marketing and user experience - ([cae7941](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/cae79411d32cca903dc16c788362390a2798ea8d))
- **(readme)** add contributors to acknowledgments - ([9d770f1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9d770f1f1559ffed823abce9b5ba8c56ca49bee7))
- **(readme)** GFM tables, roadmap, and contributors - ([9145f39](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9145f39f969f5e3d49315669cfbd01bf16193b86))
- **(readme)** friendlier badge names; rename workflows for marketing clarity - ([4d8ee88](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4d8ee8816bb429c49a840106b3eb23e4da28cb99))
- **(security)** add SC1 Security Requirements document - ([aaa571f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/aaa571f8c6156354350fb4f9f28c47f2581a4241))
- **(security)** add CodeQL workflow and exclude vendored mermaid - ([6b3462f](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6b3462fbed79d5f33fe4b40251c2312e3e8aa965))
- **(spec)** mark US5 theme-appropriate math font color as broken - ([9edcf1b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9edcf1b8505a62e3b1f812469ef18e18600402d9))
- **(speckit)** add constitution, product spec, implementation plan, and tasks - ([ba2429e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ba2429e77f5eabbed1b0d7e33b9352a3e3c3f057))
- **(specs)** add 004-code-block-math-environments spec and design artifacts - ([9808207](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9808207ec4ae4a6de4426ab819c7a8a80abdcdfb))
- **(test)** update test report paths to use dist directory - ([fb07dec](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fb07dec44a23570daa3b3ae7c407343b8c904278))
- add comprehensive CONTRIBUTING.md guide - ([723b5a7](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/723b5a78d93c9dfcc174d069ecebbfe1f1339270))
- bump version to 1.3.2 - ([43f55f5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/43f55f534e844e03435a891c55b68af52b424c6a))
- bump version to 1.3.5 - ([4c1042b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4c1042b87934fa5c82f541df9827653854ab601f))
- bump version to 1.3.6 and rename images folder to assets - ([5201a45](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5201a451fcead7fcbde42e03267d040a2b381182))
- update README links and assets - ([3ec0ea0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3ec0ea0d023853451aacd011363bf23871514aad))
- update README - ([5d35df8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5d35df868fe7aed38c598a9d15e4afc4d916bdf9))
- fix image layout in README - ([57228b8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/57228b8e2cac072ecacfefcb01f4ef015e984b86))
- reduce extension size from 8MB to 328KB by excluding demo assets - ([3547761](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3547761a435ab56cf6bb62f1e49973b82a68d1ae))
- reorganize documentation into project and product directories - ([0f3ae28](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0f3ae28c8c39cb842304071987d939aa3c34ec95))
- add workflow chart design guidelines and update stages.csv format - ([ba76500](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ba76500fc11bc62fcd4a8c7b9db275da7a0ec44d))
- enhance example.md with GFM edge cases and formatting examples - ([d4ea8db](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d4ea8db662f25d78e6c576ab83f08f581c50c56a))
- remove obsolete project documentation files - ([a268a3d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a268a3dd5a9b39db789d6158ffacc2c72150f85a))
- update PO1-Problem-Definition.md for improved clarity and organization - ([0c445b8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0c445b8f5819e6397d06cb27e02cb5b060048807))
- remove outdated AI documentation files - ([e754583](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e7545839c10dd9a191e58335fa503008f5c8f0d0))
- refine documentation structure and update content organization - ([289ac89](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/289ac89ba03762da26dcf7c003389c6f04d80bf2))
- add new use cases for Markdown extension features - ([13f6655](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/13f665505c97f2c6f4962c84d8548a28a67e5569))
- remove obsolete AI-related documentation files - ([75a5e09](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/75a5e093c520699695391ac6c4a1d6357ad80a5d))
- remove obsolete documentation files and templates - ([16a61aa](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/16a61aae3b770efcc991242fbc4c02a503624a25))
- streamline documentation by removing outdated files and templates - ([dbd3c37](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/dbd3c37cfca8ab8f78fdddb681f79ce92f55110d))
- update artifact paths and validation scripts in workflow documentation - ([1e13051](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1e1305185ffedb109b98bed82386b03e6e6af6d8))
- enhance AGENTS.md with clearer human input protocols and execution steps - ([1a35725](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1a35725f7b3898f29c711e0a63ce6aeb5de01e9b))
- update .gitignore to include new directories - ([5ff2514](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5ff2514999a67be3c68494c280253e0006f012ee))
- update .gitignore to reflect new context directory - ([283e172](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/283e172a87eb78bed5b55f5364bbff13667478eb))
- update README.md to enhance Markdown features section and outline upcoming enhancements - ([1a2a247](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1a2a2474da46aee92a9805926d2aaf14ee5ed2a8))
- add feature implementation table and split features into separate files - ([4fe63dc](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4fe63dc0642e773d1f6c7376f04de2fed24be1dc))
- add implemented features documentation - ([94f6cc0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/94f6cc037cfcfc2a3b534444a343a1d0c3afb096))
- add acknowledgements and license attribution - ([a4cf4ed](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a4cf4ed56e673acb909790e51a3f976e98addbe9))
- update .gitignore to include context-example-repositories and examples directories - ([ef0dad2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ef0dad2d8b4ea10ab8d9963014be946d8d79d9d3))
- remove old vsix package file - ([8761178](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8761178caa5ff1af1206397698d681d843df44a5))
- add E2E testing strategy for visual decoration verification - ([7cebe9a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7cebe9accd5450a596f25c54e379e65ed45dd6e7))
- update documentation guidelines and feature workflow - ([b0a04ed](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b0a04edafee2b6609638994280a19b06509e58fe))
- add v1.6.0 implementation entry to AGENTS.md - ([88f793e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/88f793e4df6bd839faec908aad2c5fafdf357355))
- add changelog update reminder to release process - ([f0af2bd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f0af2bd8d16aa52f3f3b4c14ea3251c11c671c27))
- add issue links to upcoming features in README - ([9f0cf2e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9f0cf2e1d1fdf4a36262cc9510846c7506086750))
- add verification step for issue list in AGENTS.md - ([39e709c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/39e709c38a5d543e0e4a452e2088f0aae6ee9baa))
- update section header for Configuration in README - ([55a410b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/55a410ba8806144682a83974ba2a51352d7d0096))
- reorganize upcoming features section in README for clarity - ([3641ef0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3641ef05a12fa6b3dd0bd1bdcfac211efe2cf824))
- move YAML Frontmatter to implemented features section - ([f89244e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f89244eb846fc9c2b7fde52e8c522681d410b38c))
- add OpenVSX and GitHub Releases links to README - ([98449e5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/98449e5dc7919914adcfa1d471776cb42ea6c297))
- change list markers from dashes to asterisks in README - ([f8b8c0a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f8b8c0ab515aa9d8b56189e8593f66882f593279))
- update architecture documentation for position-mapping utility - ([faf805d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/faf805d032e4f1824f8b45fc3540553f51716d8a))
- improve code quality, type safety, and DRY compliance - ([f2d3b2e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f2d3b2eba1c8aa1786fd0627930b08e60b9958ea))
- remove agent roster and fix documentation inconsistencies - ([c694a9a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c694a9af7b65e203dd400452bb3ae6651ef08e70))
- remove unused markdown preview settings and custom CSS - ([9f2c23c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9f2c23cdb33ff74ea7e7a4f43173bb15dec5dcaa))
- uat 1 done - ([8d086cd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8d086cdd70c81f1efcc257902cbfd17a1ba65545))
- organize UAT files into separate folder - ([8835c92](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8835c9234f23e836d2ec3c9e6eeb737c1a68cada))
- remove M3 milestone and clean up feature documentation - ([ac4cd74](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ac4cd743dec51b13c2d1d8aafa6f30c3850764b6))
- update documentation for implemented features from syntax-shadowing-m2 branch - ([88cffcf](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/88cffcffa75c2f02a27cd6a42d7326486950ebcd))
- showcase syntax shadowing 3-state model in README - ([1ed5533](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1ed55333767367bedb1c2dba9ba58d417c8b100c))
- add code blocks and frontmatter screenshot to README - ([3d13cd1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3d13cd1510837e8713d8f8d5eafe7fb11c675c21))
- add syntax shadowing screenshot to README - ([ed54dba](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ed54dba5241e69d22bd3dde51c8b8430c2850776))
- reorganize README layout and improve demo section - ([51b16ca](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/51b16ca1c58d443be86acf47327db17aabd9631f))
- update README and docs to reflect new test coverage - ([31feb63](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/31feb6363fda58fe8933df8ff8e02f12fcbee241))
- fix hover provider and click handler tests for refactored architecture - ([ebb5cf3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ebb5cf38459692ec1089f934a489be39a7a0c0ef))
- optimize VSIX package size by excluding dev files - ([2663612](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/26636124c22c1f516123bae07d8b5deaf2eb3654))
- update feature documentation and README for emoji support - ([e0bbf09](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e0bbf09941a17bf3ad0fe3127cf697cb1a59fb27))
- add git-cliff to devDependencies - ([32df303](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/32df303613af50323ebfedbb1f886f6a1d3645be))
- remove duplicate media directory to reduce extension size - ([95ea3da](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/95ea3da23f698924384ab9508b45ace40fbfe29a))
- update feature documentation and test coverage references - ([d51e520](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d51e5208d33887c4d9acbd8d166bb95de4729c17))
- emphasize pushing tags in release process - ([0ffa3d1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0ffa3d10ff925080e00a7e406ca8a24057787f40))
- clean up assets and update feature docs - ([194407d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/194407d826320342f44d18f2235fe4a9437a3dda))
- update autoplay demo gif - ([58d0f81](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/58d0f81b56910d5d17a18e8ed004a847dfbf2195))
- update icon assets and table column alignment docs - ([92893f2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/92893f2fcdcf3b55fb098ddd592fc8c03fe486ca))
- document customizable syntax colors in README; react to colors config and theme in extension - ([00497b5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/00497b5265c9ac455462d41ba0741e03b4479bdc))
- add .eslintignore - ([fbd955a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fbd955abf43ec9368db53c4c7fb4e4e7b51a2402))
- update README and references for consolidated todo list and LaTeX done - ([2e1e486](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2e1e48693d37d4bcf5bc5a5727e82744e3e32492))
- improve README - showcase best features early - ([1858571](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1858571f2d7325e4d656d2d26ea7d3a1a895f7a4))
- sync syntax color docs, hex JSDoc, and contributors - ([b3d8458](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b3d84585f6f593d129fd36a48b333f1b4d9362b8))
- enhance unit test coverage with 80% gate - ([0339a50](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0339a5023461c55bd8b5e3c4ec6b930e3332fb2a))
- add Cursor e2e test support with configuration and noise suppression - ([17a8105](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/17a810501df9c98b1cc7bd87e09d187cb8638e65))
- Update SECURITY.md to clarify support for versions and reporting vulnerabilities - ([fefdcb3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fefdcb36787812334c472b5f0dc08be6fec7a157))
- Update dependencies - ([f599b02](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f599b025e5719fa83bb2b725a991d09761e36db4))
- Update .vscodeignore - ([8e736f9](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8e736f901f344ebcedb2e105fc8700884f7b7510))
- Update ESLint configuration to use defineConfig and add additional ignores - ([4eaddc2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4eaddc2f96730d425162541b90a193a08293ec37))

### Fixed

- **(build)** exclude sourcemaps and dev config from extension package - ([9199798](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9199798a8501e42481ba7526da3d0d16463b6f2d))
- **(ci)** use npx vsce instead of global vsce command - ([280baed](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/280baed95c812611fce97f0ae3dd05c471a7a34d))
- **(ci)** downgrade VS Code engines and fix Jest test script - ([317bd24](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/317bd240471651eb8359751cf5f3aead9bf08b34))
- **(ci)** remove ci dependency from release jobs - ([ac663dd](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ac663dd2ee1f37d8e8a852c69261875f8838603c))
- **(ci)** add workflow_dispatch to manually trigger releases - ([5f82d33](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/5f82d336bb313f9fb4b7392bb866d63a1d1f1ea0))
- **(ci)** restore ci dependency for releases with improvements - ([02c7c75](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/02c7c75e99038490023d80291fd70d897d2b5b39))
- **(config)** exclude examples folder from TypeScript checking - ([654eb9c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/654eb9c73ea71bff10022ea0dc37695d89109728))
- **(decorations)** prevent horizontal rule from expanding editor width - ([a0156a3](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a0156a3150fc7e3c52974f79cc11163732077719))
- **(decorations)** remove explicit color override for H4-H6 headings to respect editor theme - ([f8f4b01](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f8f4b0115a21b715f2b161591dc31e9da0dd3707))
- **(decorations)** use ☑ for checked checkbox to fix blank rectangle ([#47](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/47)) - ([6bb19c5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/6bb19c558c32bcfdd833e38079ab846f0b020f6f))
- **(decorator)** handle CRLF line endings correctly - ([372072b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/372072b0bfcd749a2d16ba726173ebd14f669de2))
- **(decorator)** reveal horizontal rules in raw state when cursor/selection intersects - ([a521ede](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a521ede9e7cd93a665f87c14ba945820ae1912b7))
- **(decorator)** improve inline code scope detection and increase ghost visibility - ([eb0da2d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/eb0da2d3d8c3989acd0881e3533fa0336f0fac22))
- **(decorator)** keep leading markers rendered on active line, show raw only on overlap - ([ab6b047](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ab6b0475307aec0b0b372d3744487ad78e51f5b7))
- **(decorator)** suppress code block background in raw state to restore selection visibility - ([be7ffb2](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/be7ffb222558df6587979aba9508418277726136))
- **(decorator)** add selection overlay to restore visibility in code blocks - ([a33db25](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a33db2512d7c4dbd298edcfccf19efaf2d6f3aa2))
- **(docs)** restructure image-ux-improvements to match feature file format - ([aea7d3c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/aea7d3cf47ee97ec45974dd1b41244ed7d6951fb))
- **(docs)** correct markdown table formatting in UAT template - ([2887ad5](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2887ad59e03d2c5c4c82a52d55a0136d497795f2))
- **(hover)** convert Mermaid SVG to data URI for hover popup - ([42bdc2a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/42bdc2a8e3a35a82b07221eea3b2f5758f597eb1))
- **(link-provider)** handle CRLF line endings in table of contents links - ([aa300db](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/aa300db4d8b5f7a20179541f1645948e6693f078))
- **(lint)** resolve all ESLint warnings and improve config - ([b6b1de4](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b6b1de4ab0963719e8dbf075233abaad6b60032f))
- **(math)** correct block math SVG height and body line count - ([b34b00b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b34b00b47c61febc491ebad07473826cf2b7ce52))
- **(mermaid)** correct SVG extraction from cheerio processing - ([b95bc77](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b95bc777066cde00ef8cfefa0a39bb639fff070a))
- **(mermaid)** render gantt charts in explicit-width container to fix zero-width layout issue - ([3714f7b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3714f7baf5133614c371ecfa7df9671f23a0b579))
- **(mermaid)** resolve race condition in concurrent render requests - ([69196dc](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/69196dce9de74bc71b728ac3d92086a94d362193))
- **(mermaid)** resolve memory leaks and improve hover rendering - ([e1755d1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e1755d1d796a5794ba170d8aceef46d03e740148))
- **(mermaid)** handle large SVG rendering in hover dialogs - ([f0c5b27](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/f0c5b2726a8daf8e1a86b464bffabd8a93c6ffc1))
- **(mermaid)** ensure webview is created in VS Code and set view container title - ([976a493](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/976a4934a7dd04d9dd12d47c671c3503ad76d437))
- **(mermaid)** constrain diagram width to editor viewport ([#50](https://github.com/sinnohzeng/markdown-gongwen-vscode/issues/50)) - ([527f36a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/527f36a8a02aa07ebd6f36a8c664596f67fc8e22))
- **(mermaid)** correct width constraint, cross-platform build, e2e tests - ([8bc218e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8bc218e97bddcbd526c82af4d21dcbdcf229b0a6))
- **(parser)** prevent ordered lists from being replaced with bullet points - ([a688662](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a6886622b890738088f930b519baa9b550da8d9e))
- **(parser)** prevent markdown formatting decorations inside code blocks - ([288b83b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/288b83b83cb3ffe7039670a7baad3be65fada6e2))
- **(parser)** prevent markdown formatting decorations inside code blocks - ([3fa4a0b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/3fa4a0b619617ba43e521330efeb7dc0b111bbe9))
- **(parser)** render bracket-style mailto/URL links as regular links - ([11d6fa8](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/11d6fa89cb5e0428e39c5e338795cafb38814d2c))
- **(parser)** address GFM table findings (boundary, docs, tests) - ([b890f40](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/b890f40f62b1131a583cc87c6149211c02e7ebc6))
- **(release)** address PR review feedback - ([c6c3877](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/c6c3877bac04a601eb4ae38e6f9c012698d65345))
- **(release)** address PR review feedback - ([149272c](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/149272c530d86ea4d73f3dcdd9a691d78adc74e6))
- **(release)** improve git-cliff availability check - ([67ec565](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/67ec56542c7f2ebee04c4772eb4ba3a86261dcd2))
- **(scripts)** exclude AGENTS.md from feature validation - ([8f87792](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8f87792a42a0452c6c6b56fb4a9c4c1510821b3a))
- update workflow node identifiers and enhance validation script paths - ([2edb344](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/2edb3443468359cd824c6422e3bc890b543570e9))
- restore accidentally deleted icon.png - ([fd97181](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fd97181bbb46d8c405adb28fb88aa185f6c8a125))
- update icon.png - ([9394c42](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9394c4237bdeb1dff7a9190a33ba8bbd5e61899f))
- state audit - ([65e8047](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/65e8047c13032621bbcc5753ca02f2b457076232))
- support skill, markdoc, and mdc language IDs (#58, #61) - ([d11a91e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d11a91e3cddc65ac6d868969f59d97bb0850907d))

### Build

- **(versioning)** add release generation instructions - ([e14b687](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/e14b687432fd871158420b0770412de66bca890a))
- **(versioning)** add release generation instructions - ([accf3dc](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/accf3dc2d2cd3833ed2b62f2f406e64852d294a5))

### Ci

- **(audit-fix)** use PAT for checkout and create-pull-request - ([d8d1aba](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/d8d1abaf96efbd19c0f2878d4a5fd18ee3b85284))
- **(codeql)** upgrade to codeql-action v4 and document default-setup conflict - ([eec88f0](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/eec88f0565a007ce85fc6eaad18586f5353e6d2c))
- update GitHub Actions to use latest checkout and setup-node versions - ([8ed97ad](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/8ed97ad12acd737e6804a286017faf9058d38fa6))
- add npm-audit workflow for dependency vulnerability badge - ([01c8b4a](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/01c8b4a4b2bac6e827289d1f7a24f5b19619ea45))

## [1.3.1](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v1.3.0..v1.3.1) - 2025-12-19

### Fixed

- **(build)** bundle runtime deps for packaged extension - ([9365306](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9365306eff07e061818a20867e959cfd948b2aa5))

## [1.3.0](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v1.2.0..v1.3.0) - 2025-12-19

### Changed

- **(parser)** implement phase 1 optimizations - ([4278842](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/4278842c8357013dfd7e7693c299ce9765624124))

## [1.2.0](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v1.1.5..v1.2.0) - 2025-12-19

### Changed

- implement high-impact performance optimizations - ([9396d9e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/9396d9e6a9a25ba8ccd449982994de68681612d7))

## [1.1.5](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v1.1.4..v1.1.5) - 2025-12-19

### Changed

- replace video files with optimized GIF - ([ff94da1](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/ff94da177b5c4a9f4028f59602ee9278b738b354))
- bump version to 1.1.5 - ([1c08c2b](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/1c08c2b443ad4f879c0e73c082dfa5a482a19645))

## [1.1.4](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v1.1.3..v1.1.4) - 2025-12-19

### Changed

- add MP4 video format and bump version to 1.1.4 - ([709ab2d](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/709ab2dee25eb1ff63df601ca37a9c547ed08d7b))

## [1.1.3](https://github.com/sinnohzeng/markdown-gongwen-vscode/compare/v1.1.1..v1.1.3) - 2025-12-19

### Changed

- bump version to 1.1.3 - ([03d35ac](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/03d35acbfe550c38d954816079c0d5f988b4da40))

### Fixed

- **(ci)** remove Open VSX publishing from deploy workflow - ([7c6d04e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7c6d04e8cef41b7f4953ddcf739c2676a704e4ae))

## [1.1.1] - 2025-12-19

### Changed

- **(ci)** add clarifying comments for cd job conditions - ([fe8733e](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/fe8733e427c8e18c8e3ae4af784171a21ed44850))
- improve README structure and add @docs agent - ([a905b59](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/a905b597345ad1e1edba9e1b13d6cb7aee404987))
- remove Open VSX publishing from deploy script - ([0992e55](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/0992e55c1a88bb0575a2e1ca1778276f8ec15554))
- update version and readme.md with example videos/images - ([7bc34be](https://github.com/sinnohzeng/markdown-gongwen-vscode/commit/7bc34be463b732e099980d15a0f3de4cce1413e6))
