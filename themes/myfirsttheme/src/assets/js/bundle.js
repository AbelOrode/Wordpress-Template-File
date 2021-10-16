import './components/slider'

let x = 0;

console.log(x + 1);

var z = {
    baz_: 0,
    foo_: 1,
    calc: function() {
        return this.foo_ + this.baz_;
    }
};
z.bar_ = 2;
z["baz_"] = 3;
console.log(z.calc());