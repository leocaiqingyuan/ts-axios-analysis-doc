# 扩展接口
## 接口别名
为了用户更加方便地使用 axios 发送请求，axios为所有支持请求方法扩展了以下接口：
- axios.request(config)
- axios.get(url[, config])
- axios.delete(url[, config])
- axios.head(url[, config])
- axios.options(url[, config])
- axios.post(url[, data[, config]])
- axios.put(url[, data[, config]])
- axios.patch(url[, data[, config]])

demo中使用的axios别名方法来自 .src/axios.ts 导出的axios方法
```js
// axios 的工厂函数
function createInstance(): AxiosInstance {
  // 实例化一个Axios混合对象  
  const context = new Axios()

  // 将instance 指向Axios原型上的request方法
  const instance = Axios.prototype.request.bind(context)

  // 将Axios的原型属性和实例属性，拷贝到instance中
  extend(instance, context)

  // 编译器无法推导出instance的类型是否为AxiosInstance，所以将instance的类型强制断言为AxiosInstance
  return instance as AxiosInstance
}

const axios = createInstance()

// 导出一个创建axios对象的实例
export default axios
```
这里声明了一个 createInstance的工厂函数来创建axios方法，返回值的类型是AxiosInstance。方法里面实例化一个Axios混合对象，接着给Axios的原型绑定了一个request的方法，然后通过extend方法，把Axios的原型属性和实例属性，拷贝到instance中。最后返回instance实例。
我们先来看 AxiosInstance 接口类型是如何定义的，src/types/index.ts

## 接口类型定义
types/index.ts

```typescript
export interface Axios {
  request(config: AxiosRequestConfig): AxiosPromise

  get(url: string, config?: AxiosRequestConfig): AxiosPromise

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise

  head(url: string, config?: AxiosRequestConfig): AxiosPromise

  options(url: string, config?: AxiosRequestConfig): AxiosPromise

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
}

export interface AxiosInstance extends Axios {
  (config: AxiosRequestConfig): AxiosPromise
}

export interface AxiosRequestConfig {
  url?: string
  // ...
}
```
可以看到AxiosInstance接口是继承Axios接口类型的，Axios接口描述了Axios类中的公共方法（即别名所需的参数类型，方法返回值类型）
另外 AxiosRequestConfig 类型接口中的 url 属性变成了可选属性。是因为Axios的别名方法中config参数的类型AxiosRequestConfig中可以不传url参数了

接下来看看Axios类是怎么实现的

## Axios 类的实现
core/Axios.ts
```typescript
import { AxiosRequestConfig, AxiosPromise, Method } from '../types'
// dispatchRequest 是发送请求的功能函数
import dispatchRequest from './dispatchRequest'

export default class Axios {
  // ...
  request(config: AxiosRequestConfig): AxiosPromise {
    return dispatchRequest(config)
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  // get、delete、head请求不需要传data参数，而post、put、patch请求是支持传data参数的，我们需要将url、data与config参数做一个合并
  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
```

可以看出 get、delete、head、options、post、patch、put 这些方法，都是对外提供的语法糖，内部都是通过调用 request 方法实现发送请求，只不过在调用之前对 config 做了一层合并处理。

## 混合对象的实现
helpers/util.ts

```typescript
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}
```
extend 的最终目的是把 from 里的属性都扩展到 to 中，包括原型上的属性。

## 总结
回到axios.ts中，在createInstance工厂函数内部，我们首先创建Axios的实例context，接着创建instance指向Axios原型上的request方法，并绑定了上下文context；这样我们直接调用axios方法就相当于调用axios.request 方法了。接着通过 extend 方法把 context 中的原型方法和实例方法全部拷贝到 instance 上，这样就实现了一个混合对象：instance 本身是一个函数，又拥有了 Axios 类的所有原型和实例属性，最终把这个 instance 返回


