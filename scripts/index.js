graph = document.getElementById('graph');

var step = 0.05;
var xMin = -10;
var xMax = 10;
var activationFunction = "leakyReLU";
var dimensions = [1, 10, 10, 1];


var network = new Network(new NetworkOptions(dimensions, activationFunction, -1, 1, -1, 1));

var goalFunction = (i)=>{return (Math.abs(Math.sin(i))+5*(Math.E)**(-(i**100))*Math.cos(i)) * (i > -3.15 && i < 3.15)}
var goalOutput = [];
var xAxis = [];
for(var i = xMin; i < xMax; i += step) {
    xAxis.push(i);
    goalOutput.push(goalFunction(i));
}
var goalOutputMatrix = new Matrix([goalOutput]);

function regen() {
    network = new Network(new NetworkOptions(dimensions, activationFunction, -1, 1, -1, 1));
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
var costDisplay = document.getElementById("cost");
var trainingIndex = document.getElementById("trainingIndex");
var bestCost = Infinity;
var bestExport = '';

var index = 0;
var interval = setInterval(()=>{
    index++;
    network = new Network(new NetworkOptions(dimensions, activationFunction, -1, 1, -1, 1));
    var networkOutput = [];
    for(var i = xMin; i < xMax; i += step) {
        networkOutput.push(network.forwardPass([[i]]).getMatrixAsArray()[0][0]);
    }
    
    var cost = Matrix.calculateMeanSquareError(new Matrix([networkOutput]), new Matrix([goalOutput]));
    if(cost < bestCost) {
        console.log(index + ": " + cost)
        bestCost = cost;
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
        bestExport = network.export(true);

    }
    trainingIndex.innerHTML = "Training Index: " + index;
    if(index >= 1) {
        network.import(bestExport, true)
        refreshGraphics()
        console.log(bestExport);
        clearInterval(interval)
    }
}, 0)
