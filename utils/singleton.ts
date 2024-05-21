function Singleton(target){
    let onlyOne = true
    
    return new Proxy(target,{
        construct: function(target, args) {
            console.log("onlyone"+ onlyOne)
            if(onlyOne){
                onlyOne = false
                console.log("onlyone changed"+ onlyOne)
                return Reflect.construct(target, args)
            } else {
                console.error("only init once!")
                return {}
            }
        }
    })
}

export default Singleton