// @ts-ignore
function Singleton(target){
    let onlyOne = true
    
    return new Proxy(target,{
        construct: function(target, args) {
            if(onlyOne){
                onlyOne = false
                return Reflect.construct(target, args)
            } else {
                console.error("only init once!")
                return {}
            }
        }
    })
}

export default Singleton