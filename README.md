# newbee-router

A very easy-to-use router library and based on browser hash.

## 初始化
通过routes传入路由信息
```js
// Router 见下方的路由信息类型定义。
var newBeeRouter = new NewBeeRouter({
    routes:[
        {Router},
        {Router}
    ]
})
```

## 路由信息
路由信息类型定义：
```
Object Router = {
    path: String;
    name?: String;
    isDefault?: Boolean; // 是否为默认路由，初始化会检查路由队列中是否存在默认路由，如不存在则会抛出错误。
    leave?: (to: String | Undefined) => void;
    enter?: (from: String | Undefined) => void;
    render?: (params: Object | Undefined) => void;
}
```


## 属性
### app
* 类型：`NewBeeRouter Instance`。
* NewBeeRouter 根实例。

```js
var newBeeRouter = new new NewBeeRouter();
newBeeRouter === NewBeeRouter.app; // => true
```

可以通过判断是否含有app属性来判断router的初始化情况。
```js
var rootInstance = NewBeeRouter.app;
if (rootInstance) {
    console.log('NewBeeRouter已初始化完成')。
} else {
    console.log('NewBeeRouter还未初始化')。
}
```

### query

* 类型：`Query Instance`。
* 路由中的query。

> NOTE: 只有在NewBeeRouter实例化之后才可进行以下操作。

#### query类型定义
```
Object Query = {
    name: String;
    value: String;
    locked?: Boolean; // 是否锁定该值，如为true则在执行push操作时改query不会发生改变。默认为false
    watch?: (from: String | Undefined, to: String | Undefined) => void; // 监听此query的变化
}
```

#### NewBeeRouter.app.query.add(query: Query)
往hash中添加query信息。
```js
NewBeeRouter.app.query.add(query);
```

#### NewBeeRouter.app.query.remove(name: String)
删除query。
```js
NewBeeRouter.app.query.remove('keyName');
```
#### NewBeeRouter.app.query.get(name: String);
获取query。
```js
var keyValue = NewBeeRouter.app.query.get('keyName');
```
**如果传入的name不存在，则返回空字符串。**
#### NewBeeRouter.app.query.set(key: String, value: String | Null | Undefined);
设置query，也可执行添加操作，相当于`NewBeeRouter.app.query.add({name: key,value: value})`。
```js
NewBeeRouter.app.query.set('keyName', 'modifiedValue');
```
#### NewBeeRouter.app.query.watch(key: String, cb: (from: String,to: String) => void);
监听指定query的变化情况。

> 该函数负责监听query值的变化，但是并不能监听`从无到有`或`从有到无`的状态。

```js
NewBeeRouter.app.query.watch('keyName', function(from, to){
    console.log(from, to);
});
```

## 实例方法

### getCurrentRouter() => \[Router, Params\]
获取当前路由信息。

```js
var currentRouter = NewBeeRouter.getCurrentRouter();

// get router info
console.log('currentRouter is ', currentRouter[0]);

// get params
console.log('currentRouter params is ', currentRouter[1]);
```


### addRoute(route: Router) => void
添加路由。路由信息见

```js
NewBeeRouter.app.addRoute(route);
```

### push(info: String | Object) => void
更改当前的路由信息。

```js
NewBeeRouter.app.addRoute({
   path: '/foo',
   render: function() {
       console.log('this is foo');
   }
});
NewBeeRouter.app.push('foo');
// => hash will change to "#/foo"



NewBeeRouter.app.addRoute({
   path: '/bar',
   name: 'bar',
   render: function() {
       console.log('this is bar');
   }
});
NewBeeRouter.app.push({name: 'bar'}); 
// => hash will change to "#/bar"



NewBeeRouter.app.addRoute({
   path: '/userinfo/:userid',
   name: 'userinfo',
   render: function(params) {
       console.log('userid is ', params.userid);
   }
});
NewBeeRouter.app.push({name: 'userinfo', params: {userid: '123'}});
// => hash will change to "#/userinfo/123"


NewBeeRouter.app.addRoute({
   path: '/query',
   isDefault: true, // default router and this option must be set.
   leave: function() {
       console.log('hash will leave hash #/query');
   },
   enter: function() {
       console.log('hash will enter hash #/query');
   },
   render: function() {
       console.log('this is foo');
   }
});
NewBeeRouter.app.push({path: '/query', query:{'mode': 'list'}});
// => hash will change to "#/query?mode=list"
```

### eachLeave(cb: (to: String) => void) => void
* 钩子函数
* 系统路由信息改变时触发此函数。

```js
NewBeeRouter.app.eachLeave(function(to){
    console.log('下一个路由为：', to);
});
```

### eachEnter(cb: (from: String) => void) => void
* 钩子函数
* 系统路由信息改变时触发此函数。

```js
NewBeeRouter.app.eachEnter(function(from){
    console.log('上一个路由为：', from)
});
```