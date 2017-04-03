# MyReptiles

用于信息聚合的个人爬虫，此项目目的在于挽回作者被各种网站所浪费掉的时间。作者为经常浏览的网站编写爬虫，定时爬取资讯，将不同来源的资讯统一发送至一个客户端上，以节省每天阅读资讯花费的时间

> 使用 Typescript 作为开发语言

> 使用 Telegram 做客户端。Telegram 是一个 Chat App，内置 Bot 功能，能够使用自己的服务器向指定的 Bot 发送信息，而 Bot 的使用者在各个终端上都能够看到，Telegram 跨平台。UI 十分简洁美观，Bot 配置也很容易。

## 定时任务
> 关于如何让爬虫定时执行

1. 使用 crontab 
2. 使用 nodejs 的 setInterval
3. 使用 supervisor 的 autorestart

> crontab 配置方法很难受，不方便调整。每次配置都需要手动计算不同时区的误差。

> setInterval 产生了一个 Bug, 用于接受消息队列的 worker 会在开始工作大概半天左右的时间停止工作，原因不明。

> supervisor 定时的使用方式不太直接。supervisor 能够自动重新启动进入终止状态的进程。于是当脚本完成工作后，额外的闲置一段时间，自动重启的效果就变成了定时执行。（这样 worker 每次都会重启，就不会有意外死亡的问题）

