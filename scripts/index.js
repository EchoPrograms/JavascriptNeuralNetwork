graph = document.getElementById('graph');

var step = 0.05;
var xMin = -10;
var xMax = 10;
var activationFunction = "reLU";
var dimensions = [1, 10, 10, 10, 1];


var network = new Network(new NetworkOptions(dimensions, activationFunction, -1, 1, -1, 1));

var goalFunction = sin; //(i)=>{return (Math.abs(Math.sin(i))+5*(Math.E)**(-(i**100))*Math.cos(i)) * (i > -3.15 && i < 3.15)}
var goalOutput = [];
for(var i = xMin; i < xMax; i += step) {
    goalOutput.push(goalFunction(i));
}
var goalOutputMatrix = new Matrix([goalOutput]);

function regen() {
    network = new Network(new NetworkOptions(dimensions, activationFunction, -1, 1, -1, 1));
    refreshGraphics();
}
function refreshGraphics() {
    var networkInput = [];
    var networkOutput = [];
    for(var i = xMin; i < xMax; i += step) {
        networkInput.push(i);
        networkOutput.push(network.forwardPass([[i]]).getMatrixAsArray()[0][0]);
    }
    console.log(network.calculateNetworkError(goalOutputMatrix).getMatrixAsArray()[0][0])

    Plotly.newPlot( 
            graph, 
            [
                {
                    x: networkInput,
                    y: networkOutput 
                },
                {
                    x: networkInput,
                    y: goalOutput 
                }
            ], 
            {
                margin: { t: 0 } 
            } 
        );
}