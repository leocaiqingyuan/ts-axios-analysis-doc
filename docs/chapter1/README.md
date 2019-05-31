## 选题原因
基于学习typescript的目的，在网上找了一个用typescript重构axios库的项目。

## 什么是 TypeScript 

TypeScript 是一种由微软开发的自由和开源的编程语言，它是 JavaScript 的一个超集，扩展了 JavaScript 的语法，通过类型注解提供编译时的静态类型检查。

## 什么是 axios 
Axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中。不过该项目没有包含 axios 在node中的实现，此次分享的重点是axios请求别名和拦截器是如何实现的。

## 目录结构
<img :src="$withBase('/catalog.png')" alt="interceptor">
