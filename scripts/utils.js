function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
function tanh(value) {
    return Math.tanh(value);
}
function tanhPrime(value) {
    return 1 - tanh(value)**2
}
function cos(value) {
    return Math.cos(value)
}
function cosPrime(value) {
    return -sin(value)
}
function sin(value) {
    return Math.sin(value);
}
function sinPrime(value) {
    return Math.cos(value);
}
function sigmoid(value) {
    return 1 / (1 + Math.exp(-value));
}
function sigmoidPrime(value) {
    return sigmoid(value) * (1 - sigmoid(value))
}
function reLU(value) {
    return Math.max(0, value)
}
function linear(x) {
    return x;
}
function linearPrime(x) {
    return 1;
}
function reLUPrime(value) {
    if(value > 0) {
        return 1;
    } else {
        return 0;
    }
}
function leakyReLU(value) {
    return Math.max(0.1 * value, value)
}
function leakyReLUPrime(value) {
    if(value > 0) {
        return 1;
    } else {
        return 0.1;
    }
}
class Struct {
    constructor(childClass, paramValues) {
        var params = childClass.toString().split("constructor(")[1].split(")")[0].split(", ");
        for(var i = 0; i < params.length; i++) {
            this[params[i]] = paramValues[i];
        }
    }
}
function clrTriangular(epoch, stepSize, minLR = 0.001, maxLR = 0.006) {
    const cycle = Math.floor(1 + epoch / (2 * stepSize));
    const x = Math.abs(epoch / stepSize - 2 * cycle + 1);
    const lr = minLR + (maxLR - minLR) * Math.max(0, (1 - x));
    return lr;
}