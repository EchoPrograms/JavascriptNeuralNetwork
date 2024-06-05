window.onerror = (event) => {logs += event + "<br>"; logger.innerHTML = logs}

var logs = ""



var graph = document.getElementById('graph');
var costDisplay = document.getElementById("cost");
var trainingDataDisplay = document.getElementById("trainingData")
var logger = document.getElementById("errors")


var options = new NetworkOptions([1, 10, 10, 10, 1], ["leakyReLU", "leakyReLU", "leakyReLU", "linear"], -1, 1, -1, 1)
var maxLearingRate = 0.05;
var minLearingRate = 0.01;
var halfCycleEpochs = 25;
var maxEpochs = 1000
var epoch = 0;
var network = new Network(options);


var goalFunction = (x)=>{return sin(x)}
var goalOutput = [];
var xAxis = [];

var step = 0.01;
var xMin = -10;
var xMax = 10;

for(var i = xMin; i < xMax; i += step) {
    xAxis.push(i);
    goalOutput.push(goalFunction(i));
}
var goalOutputMatrix = new Matrix([goalOutput]);


function regen() {
    network = new Network(options);
    refreshGraphics();
}
function refreshGraphics() {
    
    var networkOutput = [];
    for(var i = xMin; i < xMax; i += step) {
        networkOutput.push(network.forwardPass([[i]]).getMatrixAsArray()[0][0]);
    }
    var cost = Matrix.calculateMeanSquareError(new Matrix([networkOutput]), new Matrix([goalOutput]));
    costDisplay.innerHTML = "Cost: " + cost;
    Plotly.newPlot( 
            graph, 
            [
                {
                    x: xAxis,
                    y: networkOutput 
                },
                {
                    x: xAxis,
                    y: goalOutput 
                }
            ], 
            {
                margin: { t: 0 } 
            } 
        );
}
function train() {
    epoch = 0;
    var interval = setInterval(()=>{
        var gradientData = [];
        for(var i = 0; i < xAxis.length; i++) {
            network.forwardPass([[xAxis[i]]])
            gradientData.push(network.backwardPass(new Matrix([[goalOutput[i]]])))
        }
        var learningRateAdjusted = clrTriangular(epoch, halfCycleEpochs, minLearingRate, maxLearingRate)
        network.trainOnPasses(gradientData, learningRateAdjusted)
        refreshGraphics()
        trainingDataDisplay.innerHTML = `Epcoh: ${epoch} <br> Learning rate: ${learningRateAdjusted}`
        if(epoch >= maxEpochs) {
            clearInterval(interval)
        }
        epoch++;
    }, 0)
}
function stopTraining() {
    epoch = maxEpochs;
}
