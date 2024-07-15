const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;


const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);
const N1 = 1000;
const N2 = 30;
const cars= generateCars(N1)
const traffic = createTraffic(N2)

let z = 0;
let k = 0;
let carNotMove = false;
let lastCar = true;
let q = 0;
let l = 0;
let bestCar=cars[0];
let lastY =0;
let mutateValue = 0.1
if(localStorage.getItem("mutateValue")){
    mutateValue = localStorage.getItem("mutateValue");
}
console.log(localStorage.getItem("mutateValue"));
console.log(localStorage.getItem("lastY"))

let lastBestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,mutateValue);
        }
    }
}


function createTraffic(N){
    const traffic = [];
    for(let i=1;i<=N;i++){
        let random_boolean = Math.random() < 0.2;
        let randomNumber1 = Math.floor(Math.random() * 3);
        let randomNumber2 = Math.floor(Math.random() * 3);

        while (randomNumber2 === randomNumber1) {
            randomNumber2 = Math.floor(Math.random() * 3);
        }
        if(random_boolean){
            traffic.push(new Car(
                road.getLaneCenter(1),
                -i*250,
                30,
                50,
                "DUMMY",
                2
            ));
        }else{
            traffic.push(new Car(
                road.getLaneCenter(randomNumber1),
                -i*250,
                30,
                50,
                "DUMMY",
                2
            ));
            traffic.push(new Car(
                road.getLaneCenter(randomNumber2),
                -i*250,
                30,
                50,
                "DUMMY",
                2
            ));
        }
    }
    traffic.push(new Car(
        road.getLaneCenter(2),
        200,
        30,
        50,
        "DUMMY",
        2.5
    ));
    traffic.push(new Car(
        road.getLaneCenter(1),
        200,
        30,
        50,
        "DUMMY",
        2.5
    ));
    traffic.push(new Car(
        road.getLaneCenter(0),
        200,
        30,
        50,
        "DUMMY",
        2.5
    ));
    return traffic;
}



animate();

function save(){
    console.log("saved")
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
    if(localStorage.getItem("lastY") > bestCar.y){
        localStorage.setItem("lastY",bestCar.y);
    }   
    localStorage.setItem("mutateValue",mutateValue);
}

function discard(){
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("lastY");
    localStorage.removeItem("mutateValue");
    location.reload();
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return cars;
}

function animate(time){
   
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    if(Math.floor(bestCar.y) == k){
        l++
        if(l > 300&&lastCar){
            carNotMove = true;
            l=0;
            lastCar=false
        }
    }


    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y) //fitness function
        ));
    if(bestCar.damaged||carNotMove){
        q++
        if(q>100&&lastCar){
            if(localStorage.getItem("lastY") > bestCar.y){
                console.log("a")
                if(mutateValue > 0.05){
                    mutateValue = mutateValue - 0.03
                }
            }else{
               //do nothing
            }
            save()
            lastCar=false
            location.reload();
        }
    }else{
        q=0;
    }
    
    k = Math.floor(bestCar.y);
    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx,"red");
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx,"blue");
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,"blue",true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}