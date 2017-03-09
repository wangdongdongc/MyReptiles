# MyReptiles

用于信息聚合的个人爬虫，此项目目的在于挽回作者被各种网站所浪费掉的时间。作者为经常浏览的网站编写爬虫，定时爬取资讯，将不同来源的资讯统一发送至一个客户端上，以节省每天阅读资讯花费的时间

> 使用 Typescript 作为开发语言

> 使用 Telegram 做客户端。Telegram 是一个 Chat App，内置 Bot 功能，能够使用自己的服务器向指定的 Bot 发送信息，而 Bot 的使用者在各个终端上都能够看到，Telegram 跨平台。UI 十分简洁美观，Bot 配置也很容易。

经作者个人实践表明，此举大大缩减了每日阅读资讯所占用的时间...

## 爬虫简介
和功能相关的源文件分为了两部分

1. `src/reptile` 爬虫
2. `src/scripts/crontabs` 用于定时执行的脚本（这些脚本调用 `src/reptile` 中的函数获取相应的数据，然后统一处理）

### 知乎关注用户

> 作者在知乎上关注了一票大V，对于知乎的使用一般在于查看这些大V的动态。常常因为深入各种问答不能自拔，以至于浪费大量时间。

爬虫：`src/reptiles/zhihu.ts`

脚本：`src/scripts/crontabs/zhihu-to-telegram.ts`

> 在脚本文件中 `followingUsers` 是脚本执行时，将会爬取的用户，脚本将逐一爬去这些知乎用户的动态，全部发送到指定的 Telegram Bot 中。

### 运行
1. 安装依赖 `npm install`
2. 加密传输 `src/assets/`
3. 运行测试 `npm run test`
4. 启动脚本 `node build/crontab.js`