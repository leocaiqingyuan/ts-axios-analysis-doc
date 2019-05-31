# 拦截器实现

`axios` 支持请求响应被 `then` `或catch` 处理前拦截它们
```javascript
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
  }, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  });
```
可以看到，`axios` 上有个 `interceptor` 属性，`interceptor` 属性又包含了 `request` 和 `response` 属性，它们都有一个 `use` 方法，`use` 方法支持两个参数，第一个是 `Promise` 中的 `resolve`，第二个参数是 `Promise` 中的 `reject`


此外，还支持移除拦截器操作
```javascript
const myInterceptor = axios.interceptors.request.use(function () {/*...*/});
axios.interceptors.request.eject(myInterceptor);
```

`core/Axios.ts`
```typescript
import InterceptorManager from './interceptorManager'

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

export default class Axios {
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }
  // ...
}
```
可以看到 `Axios` 中添加了一个 `interceptors` 属性，类型是 `Interceptors`,
`Interceptors` 类型拥有 2 个属性，一个请求拦截器管理类实例，一个是响应拦截器管理类实例。我们在实例化 `Axios` 类的时候，在它的构造器去初始化这个 `interceptors` 实例属性。

## 拦截器管理类实现
`core/interceptorManager.ts`
```typescript
import { ResolvedFn, RejectedFn } from '../types'

interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

export default class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null>

  constructor() {
    this.interceptors = []
  }
  
  // 添加拦截器到 interceptor 中，返回 id 用于删除
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({
      resolved,
      rejected
    })
    return this.interceptors.length - 1
  }

  // 遍历 interceptor用的，支持传入一个函数，遍历过程中会调用该函数，并把每一个interceptor作为参数传入。在链式调用的时候使用
  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }

  // 删除拦截器，通过传入拦截器的id删除
  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
```
可以看到 `InterceptorManager` 类的内部维护了一个私有属性 `interceptors`，它是一个数组，用来存储拦截器。该类还对外提供了 3 个方法，其中 `use` 接口就是添加拦截器到 `interceptors` 中，并返回一个 `id` 用于删除；`forEach` 接口就是遍历 `interceptors` 用的，它支持传入一个函数，遍历过程中会调用该函数，并把每一个 `interceptor` 作为该函数的参数传入；`eject` 就是删除一个拦截器，通过传入拦截器的 id 删除。

## 初始化拦截器
`core/Axios.ts`
```typescript
interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

export default class Axios {
  interceptors: Interceptors

  constructor() {
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }
}
```
`Axios` 类在实例化的时候，会初始化它的构造器中的 `interceptors` 实例属性。

## 拦截器调用
拦截器的调用逻辑是在 `request` 方法中实现的
`Axios.ts`
```typescript
interface PromiseChain {
  resolved: ResolvedFn | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

request(url: any, config?: any): AxiosPromise {
  if (typeof url === 'string') {
    if (!config) {
      config = {}
    }
    config.url = url
  } else {
    config = url
  }

  const chain: PromiseChain[] = [{
    resolved: dispatchRequest,
    rejected: undefined
  }]

  this.interceptors.request.forEach(interceptor => {
    chain.unshift(interceptor)
  })

  this.interceptors.response.forEach(interceptor => {
    chain.push(interceptor)
  })

  let promise = Promise.resolve(config)

  while (chain.length) {
    const { resolved, rejected } = chain.shift()!
    promise = promise.then(resolved, rejected)
  }

  return promise
}
```
这里构造了一个 `PromiseChain` 类型的数组 `chain`，并把 `dispatchRequest` 函数赋值给 `resolved` 属性；接着先遍历请求拦截器插入到 `chain` 的前面；然后再遍历响应拦截器插入到 chain 后面。

接下来定义一个已经 `resolve` 的 `promise`，循环这个 `chain`，拿到每个拦截器对象，把它们的 `resolved` 函数和 `rejected` 函数添加到 `promise.then `的参数中，这样就相当于通过 `Promise` 的链式调用方式，实现了拦截器一层层的链式调用的效果。
