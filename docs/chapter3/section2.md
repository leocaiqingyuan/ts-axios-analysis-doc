# axios 重载
> 函数重载是一个同名函数完成不同的功能，编译系统在编译阶段通过函数参数个数、参数类型不同，函数的返回值来区分该调用哪一个函数，即实现的是静态的多态性。


我们看 `axios` 文档知道 `axios` 方法还可以支持传入两个参数，来一起看一下在源码中他是如何实现的
```js
axios('/extend/post', {
  method: 'post',
  data: {
    msg: 'hello'
  }
})
```
第一个参数是 `url`，第二个参数是 `config`

`core/Axios.ts`：
```typescript
request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }
    return dispatchRequest(config)
  }
```
这里可以看到 `request` 函数的参数有两个，`url` 和 `config` 都是 `any` 类型，`config` 还是可选参数。

函数体中判断 `url` 是否为字符串类型，如果是字符串类型，则继续对 `config` 判断，因为它可能不传，如果为空则构造一个空对象，然后把 `url` 添加到 `config.url` 中。如果 `url` 不是字符串类型，则说明我们传入的就是单个参数，且 url 就是 `config`，因此把 url 赋值给 config。
