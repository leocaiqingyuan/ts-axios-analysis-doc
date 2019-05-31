# 基础请求代码实现

## 入口文件
```javascript
import axios from './axios'

export * from './types'

export default axios
```
## 利用 XMLHttpRequest 发送请求
src/core/xhr.ts
```typescript
export default function xhr(config: AxiosRequestConfig): void {
  const { data = null, url, method = 'get' } = config

  const request = new XMLHttpRequest()

  request.open(method.toUpperCase(), url, true)

  // 错误处理 ...

  request.send(data)
}
```
这里封装了一个最基础的http请求方法，参数的类型是 AxiosRequestConfig，返回值是void（代表返回空值）。

## config 参数接口类型定义
types/index.ts
```typescript 
export interface AxiosRequestConfig {
  url: string
  method?: Method
  data?: any
  params?: any
}
```
这里实现了一个 AxiosRequestConfig 的接口类型，包含必选参数url，可选参数method、data、params

## 引入xhr模块
./axios
```typescript
import { AxiosRequestConfig } from './types'
import xhr from './xhr'

function axios(config: AxiosRequestConfig): void {
  xhr(config)
}

export default axios
```
