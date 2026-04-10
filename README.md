# iirose-@all

IIROSE `@全体成员` 插件（I@A），用于在房间内快速提及当前可 `@` 的成员。

本项目面向普通用户的使用目标：

- 开箱即用，不需要本地构建
- 直接远程导入单文件脚本
- 在发送 `[@全体成员]` 时自动展开当前房间成员
- `v0.1.1` 起自动排除房间内的人工智能 / 机器人对象

---

## 一键导入链接

在 IIROSE 终端中执行下面任意一个链接即可。

### 方案 1：GitHub Raw（推荐）

```text
https://raw.githubusercontent.com/Nobeta-Work/iirose--all/main/dist/I@Av0.1.1.js
```

### 方案 2：jsDelivr CDN

```text
https://cdn.jsdelivr.net/gh/Nobeta-Work/iirose--all@main/dist/I@Av0.1.1.js
```

如果 CDN 没更新，可以先刷新缓存：

```text
https://purge.jsdelivr.net/gh/Nobeta-Work/iirose--all@main/dist/I@Av0.1.1.js
```

---

## 使用步骤（普通用户）

1. 打开 IIROSE 并登录账号。
2. 进入 工具 -> 终端。
3. 输入 `js` 并回车。
4. 粘贴上面的任意一个远程链接并回车执行。
5. 回到房间聊天框，发送 `[@全体成员]`。
6. 插件会自动展开当前房间内可提及成员并发送。

---

## 功能特性

- 自动读取当前房间成员
- 自动排除自己
- 自动去重用户名
- 自动拦截空用户名和异常用户名
- 自动排除已识别的 AI / Bot / 人工智能对象

---

## 版本

当前版本：`v0.1.1`

产物文件：

- `dist/I@Av0.1.1.js`

