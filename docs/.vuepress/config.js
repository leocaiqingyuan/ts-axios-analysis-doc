module.exports = {
  base: '/ts-axios-analysis/',
  dest: 'dist',
  title: '分析 TypeScript 版的 axios 中的请求别名与拦截器的实现',
  description: '分析 TypeScript 版的 axios',
  themeConfig: {
    editLinks: false,
    docsDir: 'docs',
    nav: [],
    sidebar: [
      {
        title: '简介',
        collapsable: false,
        children: [
          ['chapter1/','introduction'],
        ]
      },
      {
        title: 'axios 基础请求',
        collapsable: false,
        children: [
          'chapter2/section',
        ]
      },
      {
        title: 'axios 接口扩展',
        collapsable: false,
        children: [
          'chapter3/section1',
          'chapter3/section2',
        ]
      },
      {
        title: 'axios 拦截器',
        collapsable: false,
        children: [
          'chapter4/section1',
        ]
      },
    ]
  }
}
