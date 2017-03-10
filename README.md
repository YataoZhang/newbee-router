# newbee-router

A very easy-to-use router library based on hash.

## 初始化
```
var newBeeRouter = new NewBeeRouter({
    routes:[
        {...},
        {...}
    ]
})
```

## attributes
### app
* 类型：`NewBeeRouter Instance`。
* NewBeeRouter 根实例。

```
newBeeRouter === NewBeeRouter.app; // => true
```

可以通过判断是否含有app属性来判断router的初始化情况。
```
var rootInstance = NewBeeRouter.app;
if (rootInstance) {
    console.log('router已初始化完成')。
} else {
    console.log('router还未初始化')。
}
```

### query

* 类型：`Query Instance`。
* 路由中的query。

> NOTE: 只有在NewBeeRouter实例化之后才可进行以下操作。

#### NewBeeRouter.app.query.add(config)
添加query。
```
NewBeeRouter.app.query.add({name:'KeyName', value:'keyValue', locked:true, watch:function(from, to){
    console.log('from:', from, ' to:', to);
}});
```

#### NewBeeRouter.app.query.remove(name)
删除query。
```
NewBeeRouter.app.query.remove('keyName');
```
#### NewBeeRouter.app.query.get(name);
获取query。
```
var keyValue = NewBeeRouter.app.query.get('keyName');
```
**如果传入的name不存在，则返回空字符串。**
#### NewBeeRouter.app.query.set(key, value);
设置query。
```
NewBeeRouter.app.query.set('keyName', 'modifiedValue');
```
#### NewBeeRouter.app.query.watch(key, cb);
监听指定query的变化情况。
```
NewBeeRouter.app.query.watch('keyName', function(from, to){
    console.log(from, to);
});
```

## 实例方法

### getCurrentRouter()
获取当前路由信息。

```js
var currentRouter = NewBeeRouter.getCurrentRouter();
```

### addRoute(router)
添加路由。

```js
NewBeeRouter.app.addRouter({

});
```

### push(info)
更改当前的路由信息。

```js
NewBeeRouter.app.push();
```

### eachLeave(cb)
钩子函数

```js
NewBeeRouter.app.addRouter(function(){});
```

### eachEnter(cb)
钩子函数

```js
NewBeeRouter.app.eachEnter(function(){});
```