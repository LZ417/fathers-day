# 父亲节 H5 动态网页使用说明

这是一个适合手机端、微信内置浏览器打开的父亲节 H5 页面。页面使用纯 HTML + CSS + JavaScript 实现，不需要登录、数据库或后台服务。

## 目录结构

```text
父亲节网页/
  index.html        页面入口
  styles.css        页面样式和动画
  script.js         照片配置、播放逻辑、预览交互
  images/           照片素材目录
    photo-01.png
    photo-02.png
    ...
  README.md         使用说明
```

## 1. 电脑本地预览

最简单的方式是直接双击打开：

```text
index.html
```

打开后点击“开启回忆”，即可查看照片视频化播放效果。

如果浏览器因为本地文件限制导致部分效果异常，可以使用下面的本地服务器方式预览。

## 2. 使用本地服务器预览

在 PowerShell 中进入项目目录：

```powershell
cd "D:\博士阶段工作\3-code\父亲节网页"
python -m http.server 8080
```

然后在电脑浏览器中打开：

```text
http://127.0.0.1:8080/
```

如果端口 `8080` 被占用，可以换成其他端口，例如：

```powershell
python -m http.server 9000
```

对应访问：

```text
http://127.0.0.1:9000/
```

## 3. 手机预览

手机和电脑需要连接同一个 Wi-Fi。

先在电脑上启动本地服务器：

```powershell
cd "D:\博士阶段工作\3-code\父亲节网页"
python -m http.server 8080
```

然后查看电脑的局域网 IP：

```powershell
ipconfig
```

找到类似下面这样的 IPv4 地址：

```text
192.168.1.23
```

假设你的电脑 IP 是 `192.168.1.23`，那么手机浏览器或微信中打开：

```text
http://192.168.1.23:8080/
```

如果手机打不开，常见原因是 Windows 防火墙拦截了 Python。本地测试时允许 Python 访问局域网即可。

## 4. 替换真实家庭照片

照片统一放在：

```text
images/
```

当前示例照片命名为：

```text
photo-01.png
photo-02.png
photo-03.png
photo-04.png
photo-05.png
photo-06.png
photo-07.png
photo-08.png
```

最简单的替换方式：

1. 准备真实家庭照片。
2. 把照片重命名为 `photo-01.png`、`photo-02.png` 等。
3. 覆盖 `images` 文件夹里的同名文件。
4. 刷新页面查看效果。

建议照片尽量使用竖图、方图或接近 `4:5` 比例的照片，播放区显示效果会更好。

## 5. 修改照片字幕和播放效果

打开：

```text
script.js
```

在文件顶部可以看到 `memories` 数组：

```js
const memories = [
  {
    src: "./images/photo-01.png",
    caption: "父亲节快乐，爸爸",
    motion: "zoom-in"
  }
];
```

每一项代表一张照片：

- `src`：照片路径
- `caption`：照片播放时显示的字幕
- `motion`：照片的镜头运动效果

可用的 `motion` 效果有：

```text
zoom-in      缓慢放大
zoom-out     缓慢缩小
pan-left     向左轻微平移
pan-right    向右轻微平移
pan-up       向上轻微移动
pan-down     向下轻微移动
sharpen      轻微虚化后清晰
```

如果想增加照片，就继续往 `memories` 数组里添加对象：

```js
{
  src: "./images/photo-09.png",
  caption: "新的照片字幕",
  motion: "pan-left"
}
```

同时把对应照片放入：

```text
images/photo-09.png
```

如果想减少照片，就删除 `memories` 数组中不需要的项。

## 6. 修改首页文案

打开：

```text
index.html
```

可以修改这些文字：

```html
父亲节快乐，爸爸
谢谢您一直以来的陪伴与支持
这些年，我慢慢长大，也越来越懂得您的不容易。
开启回忆
照片回忆
返回首页
家庭照片
点击查看大图，长按保存。
时光很慢，爱很深。
```

修改后刷新页面即可看到效果。

## 7. 发布成微信可打开的链接

微信里不能直接发送电脑本地的 `D:\...index.html` 路径。要让父亲通过微信链接打开，需要把整个项目上传到一个可以公网访问的静态网站空间。

可以选择任意一种方式：

- 自己的服务器，例如 Nginx、宝塔面板等
- 阿里云 OSS 静态网站托管
- 腾讯云 COS 静态网站托管
- 七牛云对象存储
- GitHub Pages
- Netlify
- Vercel
- 公司或学校已有的网站空间

上传时保持目录结构不变：

```text
index.html
styles.css
script.js
README.md
images/
  photo-01.png
  photo-02.png
  photo-03.png
  ...
```

上传完成后会得到一个网页地址，例如：

```text
https://你的域名/fathers-day/
```

把这个链接发送到微信即可。

## 8. 微信缓存处理

微信内置浏览器可能会缓存旧的 HTML、CSS 或 JavaScript。修改页面后，如果手机上仍然看到旧效果，可以在链接后面加版本参数：

```text
https://你的域名/fathers-day/index.html?v=2
```

下次再修改可以改成：

```text
https://你的域名/fathers-day/index.html?v=3
```

版本号只用于让微信重新加载页面，不需要改代码。

## 9. 发布前检查清单

发布给父亲前，建议用手机微信检查：

1. 首页标题是否完整显示。
2. 点击“开启回忆”后是否顺利进入照片播放区。
3. 照片是否有动态镜头运动效果。
4. 字幕是否正确、是否有错别字。
5. “返回首页”按钮是否能正常返回首页。
6. 家庭照片区是否能点击打开大图。
7. 大图预览是否能左右切换。
8. 长按图片是否能保存到手机相册。
9. 页面加载速度是否能接受。

## 10. 照片大小建议

如果真实照片很多或文件很大，微信里打开可能会比较慢。建议：

- 单张照片控制在 `500KB` 到 `1.5MB` 左右。
- 不建议直接使用几十 MB 的手机原图。
- 可以先用图片压缩工具压缩后再放入 `images` 文件夹。
- 常用格式可以使用 `.jpg`、`.jpeg`、`.png`、`.webp`。

如果改成 `.jpg` 或 `.webp`，记得同步修改 `script.js` 中的 `src` 路径。

## 11. 常见问题

### 手机打不开电脑本地地址

确认手机和电脑在同一个 Wi-Fi 下，并检查 Windows 防火墙是否允许 Python 访问局域网。

### 微信里看到的不是最新版

在链接后添加版本参数，例如：

```text
index.html?v=6
```

### 替换照片后页面显示空白

检查 `script.js` 中的 `src` 是否和 `images` 文件夹里的文件名完全一致，包括后缀名。

### 照片显示方向不对

建议先在电脑图片软件中打开照片，旋转到正确方向后重新保存，再放入 `images` 文件夹。

### 想修改播放速度

打开 `script.js`，找到：

```js
const slideDuration = 3800;
```

这个数值表示每张照片播放时长，单位是毫秒。`3800` 约等于 `3.8` 秒。

如果想每张照片播放 5 秒，可以改成：

```js
const slideDuration = 5000;
```
