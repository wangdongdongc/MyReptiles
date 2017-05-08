# MyReptiles

用于缩减资讯阅读时间的个人爬虫

## 定时任务
> 关于如何让爬虫定时执行

1. 使用 crontab 
2. 使用 nodejs 的 setInterval
3. 使用 supervisor 的 autorestart

> crontab 配置方法很难受，不方便调整。每次配置都需要手动计算不同时区的误差。

> setInterval 产生了一个 Bug, 用于接受消息队列的 worker 会在开始工作大概半天左右的时间停止工作，原因不明。

> supervisor 没有直接的定时机制，但它能够自动重启终止的进程。让进程定时终止以起到定时执行的效果。

