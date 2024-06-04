class Network {
    
    constructor(networkOptions) {
        this.networkData = new NetworkData();
        this.networkOptions = networkOptions;
        this.networkOptions.activationFunction = window[networkOptions.activationFunction]
        this.initializeNetwork();
    }
    forwardPass(inputs) {
        this.networkData.outputs = [];
        this.networkData.activations = []
        this.networkData.inputs = new Matrix(inputs);
        this.networkData.outputs.push(Matrix.add(Matrix.multiply(this.networkData.weights[0], this.networkData.inputs), this.networkData.biases[0]));
        this.networkData.activations.push(Matrix.applyFunction(this.networkData.outputs[0], this.networkOptions.activationFunction))
        for(var i = 1; i < this.networkOptions.dimensions.length - 1; i++) {
            this.networkData.outputs.push(Matrix.add(Matrix.multiply(this.networkData.weights[i], this.networkData.activations[i - 1]), this.networkData.biases[i]));
            this.networkData.activations.push(Matrix.applyFunction(this.networkData.outputs[this.networkData.outputs.length - 1], this.networkOptions.activationFunction));
        }
        return this.networkData.activations[this.networkData.activations.length - 1];
    }
    backwardPass(desiredMatrix) {
        /* testing:
            var testNetwork = new Network(new NetworkOptions([2, 4, 2, 4], "leakyReLU", -1, 1, -1, 1))
            testNetwork.forwardPass([[1],[2]])
            testNetwork.backwardPass(new Matrix([[-5],[12],[3],[3]]))
        */
        var layer = this.networkData.activations.length - 1;
        console.log(
            Matrix.multiplyScalar(
                Matrix.transpose(
                    Matrix.multiply(
                        this.networkData.activations[layer - 1],
                        Matrix.transpose(
                        Matrix.multiplyScalar(
                            Matrix.applyFunction(
                                this.networkData.activations[layer],
                                window[this.networkOptions.activationFunction.name + "Prime"]
                            ),
                            Matrix.calculateMeanSquareErrorPrime(
                                this.networkData.activations[layer], 
                                desiredMatrix
                            )
                        )), 
                    )
                ),
                -1
            )
        )
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
    constructor(dimensions, activationFunction, minWeight, maxWeight, minBias, maxBias) {
        super(NetworkOptions, arguments);
    }
}
class NetworkData extends Struct {
    constructor(inputs, outputs, activations, weights, biases) {
        super(NetworkData, arguments);
    }
}
