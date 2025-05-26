const gpu = new GPU();

var multiplyMatrixKernel = gpu.createKernel(function (a, b, sharedDim)  {
  let sum = 0;
  for (let i = 0; i < sharedDim; i++) {
    sum += a[this.thread.y][i] * b[i][this.thread.x];
  }
  return a[this.thread.y][this.thread.x]
  return sum;
}).setOutput([2, 2])
//.setDynamicOutput(true)

function runMultiplication(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
//  multiplyMatrixKernel.setOutput([colsB, rowsA]);

  return multiplyMatrixKernel(A, B, colsA);
}

class Matrix {
    #array;
    constructor(array) {
        this.#array = array;
    }
    setMatrixFromArray() {
        this.#array = array;
    }
    getMatrixAsArray() {
        return this.#array;
    }
    static multiply(a, b) {
        var arrayOne = a.getMatrixAsArray();
        var arrayTwo = b.getMatrixAsArray();
        console.log("Input:");
        console.log(Matrix.arrayToString(arrayOne), "-----\n" , Matrix.arrayToString(arrayTwo));
        var multipliedArray = runMultiplication(arrayOne, arrayTwo);
        
        console.log("Output:");
        console.log(Matrix.arrayToString(multipliedArray));
        //return new Matrix(multipliedArray);
        multipliedArray = []; 
        

        if(arrayOne[0].length != arrayTwo.length) {
            console.error("Invalid Dimensions");
            return;
        }

        for(var i = 0; i < arrayOne.length; i++) {
            multipliedArray.push([]) ;
            for(var j = 0; j < arrayTwo[0].length; j++) {
                var cellValue = 0;
                for(var k = 0; k < arrayOne[0].length; k++) {
                    cellValue += arrayOne[i][k] * arrayTwo[k][j];
                }
                multipliedArray[i][j] = cellValue
            }   
        }
        
        console.log("Output:");
        console.log(Matrix.arrayToString(multipliedArray));
        return new Matrix(multipliedArray);
    }
    static add(a, b) {
        
        var arrayOne = a.getMatrixAsArray();
        var arrayTwo = b.getMatrixAsArray();

        if(arrayOne.length != arrayTwo.length || arrayOne[0].length != arrayTwo[0].length) {
            console.error("Unequal Dimensions");
            return;
        }

        var summedArray = [];
        for(var i = 0; i < arrayOne.length; i++) {
            summedArray.push([]);
            for(var j = 0; j < arrayOne[i].length; j++) {
                summedArray[i][j] = arrayOne[i][j] + arrayTwo[i][j];
            }
        }
        return new Matrix(summedArray);
    }
    static applyFunction(matrix, funct) {
                
        var array = matrix.getMatrixAsArray();

        var resultArray = [];
        for(var i = 0; i < array.length; i++) {
            resultArray.push([]);
            for(var j = 0; j < array[i].length; j++) {
                resultArray[i][j] = funct(array[i][j]);
            }
        }
        return new Matrix(resultArray);
    }
    static multiplyScalar(matrix, scalar) {
        var array = matrix.getMatrixAsArray();

        var resultArray = [];
        for(var i = 0; i < array.length; i++) {
            resultArray.push([]);
            for(var j = 0; j < array[i].length; j++) {
                resultArray[i][j] = scalar * array[i][j];
            }
        }
        return new Matrix(resultArray);
    }
    static transpose(matrix) {
        var array = matrix.getMatrixAsArray();
        var matrixT = [];
        for(var i = 0; i < array[0].length; i++) {
            matrixT.push([]);
            for(var j = 0; j < array.length; j++) {
                matrixT[i][j] = array[j][i];
            }
        }
        return new Matrix(matrixT);
    }
    static calculateMeanSquareError(matrix, intendedMatrix) {

        var matrixArray = matrix.getMatrixAsArray();
        var intendedMatrixArray = intendedMatrix.getMatrixAsArray();
        var error = [];
        for(var i = 0; i < matrixArray.length; i++) {
            error.push([])
            for(var k = 0; k < matrixArray[i].length; k++) {
                error[i].push((matrixArray[i][k] - intendedMatrixArray[i][k]) ** 2)
            }
        }
   
        return new Matrix(error);
    }
    static calculateMeanSquareErrorPrime(matrix, intendedMatrix) {
       
        var errorGradient = []; 
        var matrixArray = matrix.getMatrixAsArray();
        var intendedMatrixArray = intendedMatrix.getMatrixAsArray();

        for(var i = 0; i < matrixArray.length; i++) {
            for(var k = 0; k < matrixArray[i].length; k++) {
                errorGradient.push([(2*(matrixArray[i][k] - intendedMatrixArray[i][k])) / matrixArray.length]);
            }
        }
        return new Matrix(errorGradient);
    }
    static grandSum(matrix) {
        var matrixArray = matrix.getMatrixAsArray();
        var sum = 0;
        for(var i = 0; i < matrixArray.length; i++) {
            for(var k = 0; k < matrixArray[i].length; k++) {
                sum += matrixArray[i][k];
            }
        }
        return sum;
    }
    static dotProduct(a, b) {
        var arrayOne = a.getMatrixAsArray();
        var arrayTwo = b.getMatrixAsArray();

        if(arrayOne.length != arrayTwo.length || arrayOne[0].length != arrayTwo[0].length) {
            console.error("Unequal Dimensions");
            return;
        }

        var dotArray = [];
        for(var i = 0; i < arrayOne.length; i++) {
            dotArray.push([]);
            for(var j = 0; j < arrayOne[i].length; j++) {
                dotArray[i][j] = arrayOne[i][j] * arrayTwo[i][j];
            }
        }
        return new Matrix(dotArray);
    }
    static outer(a, b) {
        return Matrix.multiply(a, Matrix.transpose(b));
    }
    static average(matrixes) {
        var resultantMatrix = matrixes[0];
        for(var i = 1; i < matrixes.length; i++) {
            resultantMatrix = Matrix.add(resultantMatrix, matrixes[i])
        }
        return Matrix.multiplyScalar(resultantMatrix, 1/matrixes.length);
    }
    static toString(matrix) {
        var outputStr = "";
        var matrixArray = matrix.getMatrixAsArray();
        for(var i = 0; i < matrixArray.length; i++) {
            outputStr += "[ ";
            for(var j = 0; j < matrixArray[i].length; j++) {
                outputStr += matrixArray[i][j] + " ";
            }
            outputStr += "]\n";
        }
        return outputStr;
    }
    static arrayToString(array) {
        var outputStr = "";
        var matrixArray = array;
        for(var i = 0; i < matrixArray.length; i++) {
            outputStr += "[ ";
            for(var j = 0; j < matrixArray[i].length; j++) {
                outputStr += matrixArray[i][j] + " ";
            }
            outputStr += "]\n";
        }
        return outputStr;
    }
}
