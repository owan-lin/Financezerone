# 工作台视觉参考与素材

## OC 配图更新 · 2026-10-11

依据用户提供的两张 OC 参考图，使用内置 imagegen 生图。输入 1 为白发少女，输入 2 为白发男生；两者同时用于角色身份与画风参考。学习页采用男生形态，财务页采用女生形态，统一清透淡蓝、细线条、柔和赛璐璐画风，保留灰蓝外套、青蓝眼睛和深色悬浮装置。

当前使用文件：`public/uw-oc-v1.png`、`public/finance-oc-v1.png`。上一版素材保留，未覆盖。

### 学习页最终提示词

Use case: identity-preserve. Create a new transparent website character key visual based on the attached user's original character references. Both inputs are character identity AND drawing-style references. Match the references' delicate thin grey-blue anime linework, soft simple cel shading, subtle pastel watercolor light, very pale cool blue and white palette, natural clean cloth folds, airy youthful everyday slice-of-life illustration. NOT the previous ornate fantasy RPG rendering: absolutely no baroque gold filigree, armor, violet costumes, strong rim lights, intricate brush-rendered semi-realistic face, invented replacement character, robot mascot. Preserve original facial structure, pale skin, silver-white hair, light cyan/grey-blue eyes, grey-blue lightweight zip hoodie with hood lining, white inner top, charcoal bottoms and blue-white sneakers. Keep the distinctive floating charcoal sci-fi rectangular devices with cyan light strips; they are the OC's signature, passively hovering, not firing. Modest fully clothed depiction with relaxed expression. Exact same rendering style and softness across a coordinated two-artwork website asset set. Landscape 3:2 isolated composition, one character occupies about 75% of image height, face readable, whole body and shoes visible, hair and devices fan out into a broad diagonal silhouette. Transparent background; no full scene, no corridor rectangle, no gradients behind character, no checkerboard, no opaque rectangle, no text, no brand, no watermark. Supporting props minimal, in the same thin-line style, with generous clear transparent gaps. This is an actual web illustration asset, not a website mockup. Primary character identity: the MALE character in reference image 2, preserve long silver-white hair tied back with loose long bangs, youthful male face, white T-shirt with a subtle diagonal cyan stripe, grey-blue open hooded jacket, dark knee-length drawstring shorts with cyan accents, white ankle socks and grey-blue sneakers. Reference image 1 supplies matching soft drawing style only; do not feminize or add the girl's floral ornaments. Learning theme: relaxed walking or gently floating three-quarter full-body pose, one hand holding a slim dark-blue notebook and the other in jacket pocket, passive fan of dark sci-fi devices hovering behind shoulder as in reference 2, three small translucent cyan calendar/notebook panes with no readable writing. Keep all character features visually faithful to reference 2, no outfit redesign. Put character center-left with devices spreading right, soft light from upper right.

### 财务页最终提示词

Use case: identity-preserve. Create a new transparent website character key visual based on the attached user's original character references. Both inputs are character identity AND drawing-style references. Match the references' delicate thin grey-blue anime linework, soft simple cel shading, subtle pastel watercolor light, very pale cool blue and white palette, natural clean cloth folds, airy youthful everyday slice-of-life illustration. NOT the previous ornate fantasy RPG rendering: absolutely no baroque gold filigree, armor, violet costumes, strong rim lights, intricate brush-rendered semi-realistic face, invented replacement character, robot mascot. Preserve original facial structure, pale skin, silver-white hair, light cyan/grey-blue eyes, grey-blue lightweight zip hoodie with hood lining, white inner top, charcoal bottoms and blue-white sneakers. Keep the distinctive floating charcoal sci-fi rectangular devices with cyan light strips; they are the OC's signature, passively hovering, not firing. Modest fully clothed depiction with relaxed expression. Exact same rendering style and softness across a coordinated two-artwork website asset set. Landscape 3:2 isolated composition, one character occupies about 75% of image height, face readable, whole body and shoes visible, hair and devices fan out into a broad diagonal silhouette. Transparent background; no full scene, no corridor rectangle, no gradients behind character, no checkerboard, no opaque rectangle, no text, no brand, no watermark. Supporting props minimal, in the same thin-line style, with generous clear transparent gaps. This is an actual web illustration asset, not a website mockup. Primary character identity: the FEMALE character in reference image 1. Preserve very long flowing silver-white hair, twin looped side ponytail shapes and the delicate white flower/star hair accessories with turquoise centers, long loose bangs, cyan-grey eyes and soft round youthful face. Grey-blue open light hooded zip jacket over a neat white button-up collared shirt, dark pleated mid-thigh skirt, simple blue-white sneakers. Reference image 2 supplies consistency of devices and outfit palette only; do not masculinize her or replace her hair with male hairstyle. Everyday finance theme: relaxed seated-on-invisible-edge three-quarter full-body pose with legs naturally together and feet visible, holding a small open notebook planner and a pen as she checks a daily expense, calm gentle small smile, dark shoulder satchel beside her with a plain wallet peeking out. Two or three small translucent cyan calendar panes and a few understated flat coins support the scene. A small fan of the original passive charcoal cyan-lit sci-fi devices floats behind her shoulder, not firing. Match reference 1's hair, modest clothing and soft clean hand-drawn aesthetic exactly. No ornate fantasy accessories.


- 布局参考：用户指定的 https://www.mihoyo.com/ ，于 2026-10-11 查看。采用浅色网格、青蓝强调、切角展示区、产品切换和切角按钮的设计方向。
- 本地校园照片 `public/campus.jpg`：复用 UWMaster 已保存的 UW 校园素材，原始来源 https://cdn.uw.edu/wp-content/uploads/sites/264/2026/09/08165234/HomepageHero_FallStatic_v2.jpg 。
- 财务日历与双币种图形：本工作台的内嵌 SVG 插画。
- 字体：复用记账应用内附的 Albert Sans 和 Noto Sans SC，许可证保留在 `dist/fonts/`。

个人工作台，并非米哈游或华盛顿大学的官方产品。

## 第三版：字体与主视觉

实际检查了参考页的计算样式和字体资源：导航与中文正文声明使用 Microsoft YaHei；英文副标题使用 HarmonyOS Sans Bold。官网游戏大标题使用图片字标，不能将其等同于某个普通网页字体。

工作台：中文主标题使用本地完整 HarmonyOS Sans SC Black（900），英文副标题使用官网同款 HarmonyOS Sans SC Bold（700），中文正文与导航使用 Windows 内置微软雅黑（400／700）。已通过浏览器实际渲染字体检查，确认中文标题与英文副标题使用自定义 HarmonyOS 字体，正文使用 Microsoft YaHei。

字体来源：
- 英文 Bold：https://www.mihoyo.com/_nuxt/fonts/HarmonyOS_Sans_SC_Bold.74ff623.otf
- 完整中文 Black：https://github.com/openharmony/resources/blob/master/fonts/HarmonyOS_Sans_SC_Black.ttf
- 许可：`public/fonts/HarmonyOS-LICENSE.txt`。参考网站的 Black 字体文件只覆盖部分字符，最终中文标题使用官方资源库完整版本，避免字形回退。

两张原创透明主视觉使用内置 imagegen 工具生成，保存在 `public/uw-keyvisual.png` 与 `public/finance-keyvisual.png`，未使用米哈游的角色图或标识。旧校园照片仅用于淡化的背景板纹理。

### 学习主视觉最终提示词

Use case: stylized-concept. Asset type: transparent anime game product-page key visual, not a webpage screenshot. Create an ORIGINAL premium anime sci-fi university explorer splash illustration. Two young adult university explorers, one short dark-haired male wearing layered white charcoal and UW-purple techwear carrying a laptop, one silver-haired woman with a violet ribbon wearing a modest white and violet futuristic academic jacket, both fully clothed. Dynamic diagonal composition, crisp fine ink outlines, high-quality cel shaded painted rendering with detailed fabric and hair, collectible anime RPG promotional art quality. They stand on a floating fragment of a gothic Seattle university campus with a stone arch, green foliage, books and holographic cyan calendar tiles orbiting. Character faces large and beautiful; center and left packed with visual interest, entire silhouette fits in frame. Broad landscape 3:2 composition. Rich indigo violet, muted gold, white and tiny cyan highlights; sophisticated saturated colors. Transparent background around isolated characters, architectural fragments and props, no sky rectangle, no ground rectangle, no text, no letters, no logo, no UI, no watermark. Sharp irregular silhouette and sweeping diagonal props, never a rectangular illustration. Intended to layer over a nearly white grid webpage in a full-screen product carousel.

### 财务主视觉最终提示词

Use case: stylized-concept. Asset type: transparent anime game product-page key visual, not a webpage screenshot. Create an ORIGINAL premium anime sci-fi daily-finance navigator splash illustration. A young adult woman with long teal hair in a dynamic three-quarter pose, fully clothed in a modest ivory navy and teal futuristic coat with gold fittings and black leggings. Holding a glowing tablet planner in one hand, other hand gestures toward floating calendar sheets, shiny gold and teal coins and translucent glass ledger cards. Crisp fine ink outlines and premium hand-painted cel shading like a collectible anime RPG promotional character splash. Detailed layered clothing, expressive face, flowing hair and coattails making a sweeping diagonal shape. Add a small friendly white robotic assistant hovering near her; no weapons. Broad landscape 3:2 layout with large character in center, supporting objects on both sides. Rich teal navy ivory gold and cyan. Completely transparent background surrounding the isolated character and objects, no sky or background rectangle, no pedestal rectangle. No text, no letters, no brand logo, no readable numbers, no UI, no watermark. Entire silhouette fits inside frame, no cropped head. Designed to layer over a white grid webpage in a full-screen product carousel.


## P1 第二版：动态横向构图

使用内置 imagegen 工具，输出 `public/uw-oc-v2.png`（1536 × 1024，保留透明通道）。P2 `finance-oc-v1.png` 保持不变。

参考角色：用户的男生 OC 原图；修改目标：uw-oc-v1.png；画风参考：用户认可的 finance-oc-v1.png。网页仅更新 P1 主视觉和头像裁切。

最终生成提示词：

Create ONE revised transparent-background landscape key visual for a personal learning portal. Image 1 is the MALE OC identity and outfit reference. Image 2 is the unsatisfactory previous learning illustration: completely replace its stiff upright pose, narrow silhouette and elongated proportions. Image 3 is the APPROVED FEMALE finance illustration: match precisely its delicate thin anime linework, soft pale blue-grey palette, restrained cyan accents, luminous pastel cel shading and polished illustration finish, but do NOT include the female character. Draw only the male OC from image 1, recognizable long silver-white hair tied back, loose bangs, cyan-grey eyes, open blue-grey hoodie, white T-shirt with subtle cyan diagonal stripe, charcoal knee-length shorts with cyan details, white ankle socks and blue-white sneakers. Natural youthful male anatomy, balanced torso and limbs, around 7 heads tall, no stretched legs or tiny head. Strong dynamic diagonal composition rather than standing: a lively airborne vault / running leap, body leaning forward with convincing torso twist and counterbalancing arms; one knee raised toward viewer, other leg bent trailing diagonally toward lower left, clear foreshortening, one hand holding an open study notebook close to chest and free arm extended sideways for balance. Express focused bright confidence. Hair and hoodie sweep sideways in a broad arc; a small controlled fan of dark rectangular cyan-lit sci-fi floating devices follows behind the shoulder, and a few translucent paper/calendar panels support the motion. No firing or combat. Landscape canvas 3:2, entire character and props visible with comfortable edge margins. Make the artwork itself a broad compact diagonal silhouette filling about 85% canvas width and 90% height, from lower left sneaker to upper right hair/device arc; head large enough to read, near upper middle. This will sit in the LEFT two thirds of a webpage, with separate text to its right, so do not waste half the image on empty space. Avoid the skinny centered standing figure of image2. Match image3's artistic finish and visual weight as a cohesive pair. Transparent background, no ground, no scenery, no text, no logo, no border, no gradients or opaque backdrop. This is a production website illustration, not a screenshot or mockup.

## 第四版：人物越界与斜向排版

保留已认可的 OC 配图与 HarmonyOS / 微软雅黑字体。扩大主视觉并允许人物跨出底板，底板采用上扬斜切结构；标题增大，说明与启动入口集中在右侧中下方，应用切换位于右下方。桌面与窄屏分别安排人物及文字位置，保留键盘焦点和减少动态效果的设置。

## Zerone 精修

品牌改为 Zerone，删除品牌口号、英文分区标签、LOCAL / OWAN、竖排装饰字、页码、页脚时钟及重复功能文案。保留真实应用名称、单行用途、启动入口与运行状态。移除对应的无用脚本和样式，统一箭头、头像选中边框及导航间距。桌面和手机宽度均已通过实际页面检查。
