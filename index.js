window.onerror = (event) => {logs += event + "<br>"; logger.innerHTML = logs}

var logs = ""



var graph = document.getElementById('graph');
var costDisplay = document.getElementById("cost");
var trainingDataDisplay = document.getElementById("trainingData")
var logger = document.getElementById("errors")
var showGoalFunctionCheckbox = document.getElementById("showGoalFunction")
var showNetworkOutputCheckbox = document.getElementById("showNetworkOutput")


var maxLearningRate = 0.015;
var minLearningRate = 0.01;
var halfCycleEpochs = 50;
var maxEpochs = 1000
var plotFrequency = 20;
var dimension = [1, 5 ,5, 5, 1]
var activations = ["reLU", "reLU", "reLU", "reLU"]
var goalFunction = (x)=>{return sin(x)}

var epoch = 0;

var options = new NetworkOptions(dimension, activations, -1, 1, -1, 1)
var network = new Network(options);


var goalFunction = (x)=>{return sin(x)}
var goalOutput = [];
var xAxis = [];

var step = 0.1;
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
    if(showNetworkOutputCheckbox.checked) {
        for(var i = xMin; i < xMax; i += step) {
            networkOutput.push(network.forwardPass([[i]]).getMatrixAsArray()[0][0]);
        }
    }
    var cost = Matrix.calculateMeanSquareError(new Matrix([networkOutput]), new Matrix([goalOutput]));
    costDisplay.innerHTML = "Cost: " + cost;
    var graphs = []
    if(showNetworkOutputCheckbox.checked) {
        graphs.push(
            {
                x: xAxis,
                y: networkOutput 
            })
    }
    if(showGoalFunctionCheckbox.checked) {
        graphs.push(
            {
                x: xAxis,
                y: goalOutput 
            })
    }
    Plotly.newPlot( 
            graph, 
            graphs, 
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
        var learningRateAdjusted = clrTriangular(epoch, halfCycleEpochs, minLearningRate, maxLearningRate)
        network.trainOnPasses(gradientData, learningRateAdjusted)
        if((epoch / plotFrequency) - Math.floor((epoch / plotFrequency)) == 0) {
            refreshGraphics()
        }
        trainingDataDisplay.innerHTML = `Epoch: ${epoch} <br> Learning rate: ${learningRateAdjusted}`
        if(epoch >= maxEpochs) {
            clearInterval(interval)
        }
        epoch++;
    }, 0)
}
function stopTraining() {
    epoch = maxEpochs;
}
regen()

// HyperParamater GUI
var activationFunctionList = ["reLU", "leakyReLU", "sigmoid", "tanh", "sin", "cos", "linear"]
var layerUIContainer = document.getElementById('layerUIContainer');
var layerCount = document.getElementById('layerCount');
var layerHTML = `<span style="color: white;" class="layerDescriptor">Hidden Layer, <input style="width:50px;" id="layerCount" type="number" value="5"> neuron(s), activation: <span class="activationFunctionDropdown"></span></span><br>`
var activationFunctionDropdownHTML; 
updateActivationDropdown()
setLayers()



function setLayers() {
    var numOfLayers = Math.max(layerCount.value, 0);
    var tempString = "";
    for(var i = 0; i < numOfLayers; i++) {
        tempString += layerHTML
    }
    layerUIContainer.innerHTML = tempString
    var activationFunctionDropdows = document.querySelectorAll('.activationFunctionDropdown');
    for(var i = 0; i < activationFunctionDropdows.length; i++) {
        activationFunctionDropdows[i].innerHTML = activationFunctionDropdownHTML;
    }
}
function setLayerContent() {
    var dimensionsL = [1];
    var activationsL = [];
    var layerDescriptors = document.querySelectorAll('.layerDescriptor');
    for(var i = 0; i < layerDescriptors.length - 1; i++) {
        dimensionsL.push(parseInt(layerDescriptors[i].childNodes[1].value));
        activationsL.push(layerDescriptors[i].childNodes[3].childNodes[0].value)
    }
    activationsL.push(layerDescriptors[layerDescriptors.length - 1].childNodes[1].childNodes[0].value);
    dimensionsL.push(1);
    options = new NetworkOptions(dimensionsL, activationsL, -1, 1, -1, 1)
    network = new Network(options);
    refreshGraphics()
}
function updateActivationDropdown() {
    activationFunctionDropdownHTML = "<select>"
    for(var i = 0; i < activationFunctionList.length; i++) {
        activationFunctionDropdownHTML += `<option value="${activationFunctionList[i]}">${activationFunctionList[i]}</option>`
    }
    activationFunctionDropdownHTML += "</select>"
}
function applyParamaters() {
    maxEpochs = parseInt(document.getElementById("epochs").value);
    minLearningRate = parseFloat(document.getElementById("minimumLearningRate").value);
    maxLearningRate = parseFloat(document.getElementById("maximumLearningRate").value);
    halfCycleEpochs = parseInt(document.getElementById("halfCycleEpochs").value);
    step = parseFloat(document.getElementById("resolution").value);
    plotFrequency = parseInt(document.getElementById("plotFrequency").value);
    refreshGraphics()
}
function applyGoalFunction() {
    var goalFunctionInput = document.getElementById("goalFunction");
    console.log(goalFunctionInput.value)
    goalOutput = []
    xAxis = []
    for(var x = xMin; x < xMax; x += step) {
        xAxis.push(x)
        goalOutput.push(eval(goalFunctionInput.value));
    }
    goalOutputMatrix = new Matrix([goalOutput]);

    refreshGraphics()
}
showGoalFunctionCheckbox.addEventListener("click", refreshGraphics)
showNetworkOutputCheckbox.addEventListener("click", refreshGraphics)
function importNet() {
    var importedObject = JSON.parse(atob(document.getElementById("importString").value))
    network.import(importedObject.networkData)
    layerCount.value = network.networkData.dimensions.length - 2;
    setLayers()
    var layerDescriptors = document.querySelectorAll('.layerDescriptor');
    var activationFunctionDropdows = document.querySelectorAll('.activationFunctionDropdown');
    for(var i = 0; i < parseInt(layerCount.value); i++) {
        console.log(activationFunctionDropdows[i].childNodes[0])
        layerDescriptors[i].childNodes[1].value = network.networkData.dimensions[i + 1]
        activationFunctionDropdows[i].childNodes[0].value = network.networkOptions.activationFunctions[i].name
    }
    activationFunctionDropdows[activationFunctionDropdows.length - 1].childNodes[0].value = network.networkOptions.activationFunctions[network.networkOptions.activationFunctions.length - 1].name;
    

    document.getElementById("epochs").value = importedObject.uiData.epochs;
    document.getElementById("minimumLearningRate").value = importedObject.uiData.minLearningRate
    document.getElementById("maximumLearningRate").value = importedObject.uiData.maximumLearningRate
    document.getElementById("halfCycleEpochs").value = importedObject.uiData.epochPerHalfCycle
    document.getElementById("resolution").value = importedObject.uiData.resolution
    document.getElementById("plotFrequency").value = importedObject.uiData.plotFrequency
    document.getElementById("goalFunction").value = importedObject.uiData.targetFunction

    applyParamaters()
    applyGoalFunction()
    setLayerContent()
    network.import(importedObject.networkData)
    refreshGraphics()
}
function exportNet() {
    var exportObject = { 
        networkData: network.export(),
        uiData: {
            epochs: document.getElementById("epochs").value, 
            minLearningRate: document.getElementById("minimumLearningRate").value, 
            maximumLearningRate: document.getElementById("maximumLearningRate").value, 
            epochPerHalfCycle: document.getElementById("halfCycleEpochs").value, 
            resolution: document.getElementById("resolution").value, 
            plotFrequency: document.getElementById("plotFrequency").value,
            targetFunction: document.getElementById("goalFunction").value
        }
    }
    document.getElementById("exportLocation").innerHTML = btoa(JSON.stringify(exportObject))
}