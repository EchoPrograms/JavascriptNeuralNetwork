var test;
class Network {
    
    constructor(networkOptions) {
        this.networkData = new NetworkData();
        this.networkOptions = Object.assign(new NetworkOptions(), networkOptions);
        this.networkOptions.activationFunctions = []
        for(var i = 0; i < networkOptions.dimensions.length - 1; i++) {
            this.networkOptions.activationFunctions.push(window[networkOptions.activationFunctions[i] ?? networkOptions.activationFunctions[0]])
        }
        this.initializeNetwork();
    }
    forwardPass(inputs) {
        this.networkData.outputs = [];
        this.networkData.activations = [] 
        this.networkData.inputs = new Matrix(inputs);
        this.networkData.outputs.push(Matrix.add(Matrix.multiply(this.networkData.weights[0], this.networkData.inputs), this.networkData.biases[0]));
        this.networkData.activations.push(Matrix.applyFunction(this.networkData.outputs[0], this.networkOptions.activationFunctions[0]))
        for(var i = 1; i < this.networkOptions.dimensions.length - 1; i++) {
            this.networkData.outputs.push(Matrix.add(Matrix.multiply(this.networkData.weights[i], this.networkData.activations[i - 1]), this.networkData.biases[i]));
            this.networkData.activations.push(Matrix.applyFunction(this.networkData.outputs[this.networkData.outputs.length - 1], this.networkOptions.activationFunctions[i]));
        }
        return this.networkData.activations[this.networkData.activations.length - 1];
    }
    backwardPass(desiredMatrix) {
        var layer = this.networkData.activations.length - 1
        var gradient = Matrix.calculateMeanSquareErrorPrime(this.networkData.activations[layer], desiredMatrix);

        var weightGradients = [];
        var biasGradients = [];

        for(var i = layer; i >= 0; i--) {
            var layerActivationDerivative = window[this.networkOptions.activationFunctions[i].name + "Prime"];
            var currentLayerOutput = this.networkData.outputs[i] ?? this.networkData.inputs;
            var previousLayerOutputs = this.networkData.activations[i - 1] ?? this.networkData.inputs;
            var currentWeights = this.networkData.weights[i];

            var activationGradient = Matrix.applyFunction(currentLayerOutput, layerActivationDerivative);
            var gradientProducts = Matrix.dotProduct(gradient, activationGradient);
    
            var weightGradient = Matrix.outer(gradientProducts,previousLayerOutputs);
            var biasGradient = gradientProducts;

            weightGradients[i] = weightGradient;
            biasGradients[i] = biasGradient;

            var gradient = Matrix.multiply(Matrix.transpose(currentWeights), gradientProducts);
        }
            
        return {weightGradients: weightGradients, biasGradients: biasGradients}
    }
    trainOnPasses(trainingExamples, learningRate) {
        var weightJacobians = trainingExamples.map(a => a.weightGradients);
        var biasJacobians = trainingExamples.map(a => a.biasGradients);

        var layerWeightJacobians = [];
        var layerBiasJacobians = [];
        var averagedWeightJacobians = [];
        var averagedBiasJacobians = [];
        for(var i = 0; i < weightJacobians[0].length; i++) {
            layerWeightJacobians.push(weightJacobians.map(a => a[i]));
            layerBiasJacobians.push(biasJacobians.map(a => a[i]));
            averagedWeightJacobians.push(Matrix.average(layerWeightJacobians[i]));
            averagedBiasJacobians.push(Matrix.average(layerBiasJacobians[i]));
        }
        for(var i = 0; i < averagedWeightJacobians.length; i++) {
            var weightNudge = Matrix.multiplyScalar(averagedWeightJacobians[i], -learningRate);
            var biasNudge = Matrix.multiplyScalar(averagedBiasJacobians[i], -learningRate);
            this.networkData.weights[i] = Matrix.add(this.networkData.weights[i], weightNudge);
            this.networkData.biases[i] = Matrix.add(this.networkData.biases[i], biasNudge);
        }
    }
    calculateCostMatrix(desiredMatrix) {
        return Matrix.calculateMeanSquareError(this.networkData.activations[this.networkData.activations.length - 1], desiredMatrix);
    }
    initializeNetwork(minWeight, maxWeight, minBias, maxBias) {
        this.networkData.weights = [];
        this.networkData.biases = [];
        var dimensions = this.networkOptions.dimensions;
        for(var i = 1; i < dimensions.length; i++) {
            var layerWeights = [];
            var layerBiases = [];
            for(var k = 0; k < dimensions[i]; k++) {
                layerWeights.push([]);
                layerBiases.push([randomFloat(this.networkOptions.minBias, this.networkOptions.maxBias)]);
                for(var j = 0; j < dimensions[i - 1]; j++) {
                    layerWeights[k].push(randomFloat(this.networkOptions.minWeight, this.networkOptions.maxWeight));
                }
            }
            this.networkData.weights.push(new Matrix(layerWeights));
            this.networkData.biases.push(new Matrix(layerBiases));
        }
    }
    export(encode) {
        var networkSave = {
            weights: null,
            biases: null,
            dimensions: null,
            activation: null
        }
        networkSave.weights = Object.assign(new Array, this.networkData.weights);
        for(var i = 0; i < this.networkData.weights.length; i++) {
            networkSave.weights[i] = this.networkData.weights[i].getMatrixAsArray();
        }
        networkSave.biases = Object.assign(new Array, this.networkData.biases);
        for(var i = 0; i < this.networkData.biases.length; i++) {
            networkSave.biases[i] = this.networkData.biases[i].getMatrixAsArray();
        }
        networkSave.dimensions = this.networkOptions.dimensions;
        networkSave.activation = this.networkOptions.activationFunction.name;
        return encode ? btoa(JSON.stringify(networkSave)) : JSON.stringify(networkSave);
    }
    import(importCode, encoded) {
        var importedJSON = JSON.parse(encoded ? atob(importCode) : importCode);
        this.networkData.weights = importedJSON.weights;
        for(var i = 0; i < this.networkData.weights.length; i++) {
            this.networkData.weights[i] = new Matrix(this.networkData.weights[i]);
        }
        this.networkData.biases = importedJSON.biases;
        for(var i = 0; i < this.networkData.biases.length; i++) {
            this.networkData.biases[i] = new Matrix(this.networkData.biases[i]);
        }
        this.networkData.dimensions = importedJSON.dimensions;
        this.networkData.activation = importedJSON.activation;
    }
}
class NetworkOptions extends Struct {
    // dimensions: [int: input count, int: hidden layer count, ... , int: output count]
    // activationFunctions: [str: first hidden layer activation funct, ..., str: output layer activation funct]
    constructor(dimensions, activationFunctions, minWeight, maxWeight, minBias, maxBias) {
        super(NetworkOptions, arguments);
    }
}
class NetworkData extends Struct {
    constructor(inputs, outputs, activations, weights, biases) {
        super(NetworkData, arguments);
    }
}


/*



var options = new NetworkOptions([1, 5, 3, 4, 2], ["reLU", "reLU", "reLU", "reLU"], -1, 1, -1, 1)
var testNetwork = new Network(options)
var gradientData = [];
var goal = new Matrix([[3], [-0.5]])
var goal2 = new Matrix([[1],[2]])
var learningRate = 0.03;

testNetwork.forwardPass([[-3]])
console.log(testNetwork.calculateCostMatrix(goal))
gradientData[0] = testNetwork.backwardPass(goal)


testNetwork.forwardPass([[7]])
console.log(testNetwork.calculateCostMatrix(goal2))
gradientData[1] = testNetwork.backwardPass(goal2)

testNetwork.trainOnPasses(gradientData, learningRate)

testNetwork.forwardPass([[-3]])
console.log(testNetwork.calculateCostMatrix(goal))
testNetwork.forwardPass([[7]])
console.log(testNetwork.calculateCostMatrix(goal2))



*/