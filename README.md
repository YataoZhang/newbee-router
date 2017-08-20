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
newBeeRouter === NewBeeRouter.app; // => true
```

可以通过判断是否含有app属性来判断router的初始化情况。
```js
var rootInstance = NewBeeRouter.app;
if (rootInstance) {
    console.log('NewBeeRouter已初始化完成').
} else {
    console.log('NewBeeRouter还未初始化').
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
NewBeeRouter.app.query.add({
    name: 'age',
    value: 18,
    locked: true,
    watch: function(from, to){
        console.log('年纪从', from, '变成了', to);
    }
});
// hash => #?age=18
// 可以简单看似`NewBeeRouter.app.query.set({name: 'age', value: 18})`。具体区别请见`set`方法。
```

#### NewBeeRouter.app.query.remove(name: String)
删除query。
```js
// 假设hash为 => #?type=man&size=small
NewBeeRouter.app.query.remove('type');
// hash => #?size=small
```
#### NewBeeRouter.app.query.get(name: String);
获取query。
```js
NewBeeRouter.app.query.get('age');
// => 18
```
**如果传入的name不存在，则返回空字符串。**
#### NewBeeRouter.app.query.set
##### 1、NewBeeRouter.app.query.set(key: String, value: String | Null | Undefined);
##### 2、NewBeeRouter.app.query.set({name: String, value: String | Null | Undefined});
##### 3、NewBeeRouter.app.query.set([{key: String, value: String | Null | Undefined ... }]);
设置query，也可执行添加操作。
```js
// 方式1
NewBeeRouter.app.query.set('city', 'beijing');
// hash => #?age=18&city=beijing

// 方式2
NewBeeRouter.app.query.set({name: 'company', value:'baidu'});
// hash => #?age=18&company=baidu

// 方式3
NewBeeRouter.app.query.set({firstname: 'zhang', lastname: 'yatao', age: 20});
// hash => #?firstname=zhang&lastname=yatao&age=20
```

> 此方法与`NewBeeRouter.app.query.add`都可以往hash中添加query信息。但是`add`方法可以额外添加附属信息或函数，如`locked`属性和`watch`函数。

#### NewBeeRouter.app.query.watch(key: String, cb: (from: String,to: String) => void);
监听指定query的变化情况。

> 该函数负责监听query值的变化，但是并不能监听`从无到有`或`从有到无`的状态。

```js
NewBeeRouter.app.query.watch('age', function(from, to){
    console.log('年纪从', from, '变成了', to);
});
```

## 实例方法

### getRouterConfig(routeName: String) => Object | null
根据传入的路由名称获取配置

```js
NewBeeRouter.app.addRoute({
    path: '/test',
    name: 'test'
});
var config = NewBeeRouter.app.getRouterConfig('test');
console.log(config); // => {path: '/test', name: 'test'}
```

### getCurrentRouter() => {Router: String | null, Params: Object}
根据当前hash在已注册的路由信息中获取符合的路由信息。

```js
// 假如当前hash为`#/test`

var currentRouter = newBeeRouter.getCurrentRouter();

// 获取当前路由信息配置为 => {path: '/test', name: 'test'}
console.log('currentRouter is ', currentRouter.route);

// 如果当前路由是携带参数的，那么params就有值，否则为空对象. => null
console.log('currentRouter params is ', currentRouter.params);
```


### addRoute(route: Router) => void
添加路由。路由信息见

```js
// 方式1
NewBeeRouter.app.addRoute(route);
// 方式2
NewBeeRouter.app.addRoute([route1, route2, route3]);
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

### eachLeave(cb: (newPath: String) => void) => void
* 钩子函数
* 系统路由信息改变时触发此函数。

```js
NewBeeRouter.app.eachLeave(function(newPath){
    console.log('下一个路由为：', newPath);
});
```

### eachEnter(cb: (oldPath: String) => void) => void
* 钩子函数
* 系统路由信息改变时触发此函数。

```js
NewBeeRouter.app.eachEnter(function(oldPath){
    console.log('上一个路由为：', oldPath)
});
```

### onEnter(routeName: String, cb: (path: String) => void) => void
* 钩子函数
* 当进入指定路由时触发

```js
NewBeeRouter.app.onEnter('test', function(oldPath){
    console.log('上一个路由路径为：', oldPath);
});
```

### onLeave(routeName: String, cb: (path: String) => void) => void
* 钩子函数
* 当离开指定路由时触发

```js
NewBeeRouter.app.onLeave('test', function(newPath){
    console.log('下一个路由路径为：', newPath);
});
```

### onRender(routeName: String, cb: (name: String) => void) => void
* 钩子函数
* 当开始渲染指定路由时触发

```js
NewBeeRouter.app.onRender('test', function(routeName){
    console.log('当前路由的名称为：', routeName);
});
```
