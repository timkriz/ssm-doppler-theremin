//const { text } = require("express");

let smoothed_sensor_freq_lower = new Array(96).fill(0);
let smoothed_sensor_freq_higher = new Array(67).fill(0);


let freq_lower_hist= [];
let freq_higher_hist= [];

let gradient_colors = ["#43100F", "#E58C8B", "#531413","#531413","#B28B84","#B28B84","#B28B84","#B28B84"]
let neueHaasFontRoman, neueHaasFontBold;

let historyLowerBool = false;

function preload() {
  neueHaasFontBold = loadFont('assets/NeueHaasDisplay-Bold.ttf');
  neueHaasFontRoman = loadFont('assets/NeueHaasDisplay-Roman.ttf');
}
let button1, button2, button3, button4, button5, button6;
function setup() {
    createCanvas(window.innerWidth -3, window.innerHeight -5);
    for(var i= 0; i< 96; i++){
      freq_lower_hist.push([]);
    }
    for(var i= 0; i< 67; i++){
      freq_higher_hist.push([]);
    }

    button1 = createButton('');
    button1.position(width/3+250-6, 3*height/10-6);
    button1.id("turnPilotOn")

    button2 = createButton('');
    button2.position(width/3+250-6 + 50, 3*height/10-6);
    button2.id("turnPilotOff")

    button3 = createButton('');
    button3.position(width/3+250-6, 3*height/10-6 + 30);
    button3.id("thereminOn")

    button4 = createButton('');
    button4.position(width/3+250-6 + 50, 3*height/10-6 + 30);
    button4.id("thereminOff");

    button5 = createButton('');
    button5.position(width/3+250-6, 3*height/10-6 + 60);
    button5.id("gainOn");

    button6 = createButton('');
    button6.position(width/3+250-6 + 50, 3*height/10-6 + 60);
    button6.id("gainOff");
  }
  
  function draw() {
    background(color("#FFFFFF"));
    //ellipse(mouseX, mouseY, 5, 5);
    if(global_freqs_upper && global_freqs_lower) {
        /** HIGHER BAND */

        freqs = global_freqs_upper

      /* 2. History curves */
        strokeWeight(1);
        for(var i= 0; i< freq_higher_hist[0].length; i++){    // Five curves
          beginShape();  noFill(); //stroke(10, 150, 200, i*10);
          var lineColor = color(gradient_colors[i]);
          lineColor.setAlpha(40+i*25);
          stroke(lineColor);
          //let curveOffsetX = 25;

          for(var j = 0; j<freq_higher_hist.length; j=j+1){
              var pos = freq_higher_hist[j][i];
              let x = pos.x;
              let y = pos.y;
              curveVertex(x, y);
          }
          endShape();
        }

        /* 1. Main curve */
        var lineColor = color("#320C0B");lineColor.setAlpha(255);  
        stroke(lineColor);
        strokeWeight(1);
        noFill();

        beginShape(); 
        curveVertex(width-20-freqs[0], map(0, 0, freqs.length, 2, height-2));
        for(let i=0; i<freqs.length; i++){
            smoothed_sensor_freq_higher[i] = lerp(smoothed_sensor_freq_higher[i], freqs[i], 0.1)
            let x = width-20-smoothed_sensor_freq_higher[i];
            let y = map(i, 0, freqs.length, 2, height-2);
            curveVertex(x, y);
            var v = createVector(x, y);
            freq_higher_hist[i].push(v);
            if(freq_higher_hist[i].length>6){
              freq_higher_hist[i].splice(0,1);
            }
        }
        curveVertex(width-20-freqs[freqs.length-1], map(0, 0, freqs.length, 2, height-2));
        endShape();

        /** LOWER BAND */

        /* Lower freq band */
        freqs = global_freqs_lower

        /* 2. History curves */
        strokeWeight(1);
        if(historyLowerBool){
        for(var i= 0; i< freq_lower_hist[0].length; i++){    // Five curves
          //console.log(i)
          beginShape();  noFill(); //stroke(10, 150, 200, i*10);
          var lineColor = color(gradient_colors[i]);
          lineColor.setAlpha(40+i*25);
          stroke(lineColor);
          //let curveOffsetX = 25;

          for(var j = 0; j<freq_lower_hist.length; j=j+1){
              if(typeof freq_lower_hist[j][i] != 'undefined'){
              var pos = freq_lower_hist[j][i];
              //console.log(pos);
                let x = pos.x;
                let y = pos.y;
                curveVertex(x, y);
              }
          }
          endShape();
        }
    }
      historyLowerBool = true
      /* 1. Main curve */
      var lineColor = color("#320C0B");lineColor.setAlpha(255);  //color('#5F0A87')
      stroke(lineColor);
      strokeWeight(1);
      noFill();
      beginShape();
      curveVertex(20+freqs[0], map(0, 0, freqs.length, 2, height-2));
      for(let i=0; i<freqs.length; i++){
          //let x = 20+freqs[i]; // !!
          smoothed_sensor_freq_lower[i] = lerp(smoothed_sensor_freq_lower[i], freqs[i], 0.1);
          let x = 20 + smoothed_sensor_freq_lower[i];
          let y = map(i, 0, freqs.length, 2, height-2);
          curveVertex(x, y);
          var v = createVector(x, y);
          freq_lower_hist[i].push(v);
          if(freq_lower_hist[i].length>6){
            freq_lower_hist[i].splice(0,1);
          }
      }
      curveVertex(20+freqs[freqs.length-1], map(0, 0, freqs.length, 2, height-2));
      endShape();

        /* Text */
        textFont(neueHaasFontRoman); fill(color("#110404")); noStroke();
        textSize(30); textAlign(CENTER, CENTER);
        text('DOPPLER THEREMIN', width/2, height/10)

        textSize(15); textAlign(LEFT, CENTER);
        text('Pilot doppler tone', width/3+50, 3*height/10)
        text('Theremin oscillator', width/3+50, 3*height/10 + 30)
        text('Set gain with mouse', width/3+50, 3*height/10 + 60)
        //text('Oscillator type', width/3+50, 3*height/10 + 120)
        
        textAlign(CENTER, CENTER);
        text('On', width/3+250, 3*height/10-25)
        text('Off', width/3+250 +50, 3*height/10-25)

        fill(color("#110404"));
        text("Frequency", width/2, height/2 + 70);
        textSize(30);
        if(displayingPlayedFreq)text(freq_new.toString() + " Hz", width/2, height/2 + 100)
        else text("0 Hz", width/2, height/2 + 100)

        textSize(10);fill(150); noStroke();
        //text("19 kHZ", width/2+400, map(34, 0, 67, 2, height-2))

        push();
        translate(width/2+400, map(32, 0, 67, 2, height-2));
        rotate( -PI / 2.0 );
        text("19 kHZ", 0, 0)
        pop();
  
        /* Buttons */
        /* Sine wave*/
        let xButSin = width/3+100-6;
        let yButSin = 3*height/10-6 + 126;

        //circle(xButSin + 10, yButSin , 25);

        let a = 0.0; fill(0); stroke(0);
        let inc = TWO_PI / 10.0;
        for (let i = 0; i < 10; i++) {
          line(xButSin + i * 2, yButSin, xButSin + i * 2, yButSin - sin(a) * 10.0);
          a = a + inc;
        }

        /* Square wave*/
        let xButSqu = width/3+100-6 + 50;
        let yButSqu = 3*height/10-6 + 126;

        //circle(xButSqu + 10, yButSin , 25);

        a = 0.0; fill(0); stroke(0);
        inc = TWO_PI / 10.0;
        for (let i = 0; i < 10; i++) {
          if (i<5) line(xButSqu + i * 2, yButSqu, xButSqu + i * 2, yButSqu - 8.0);
          else line(xButSqu + i * 2, yButSqu, xButSqu + i * 2, yButSqu +8.0);
          a = a + inc;
        }
        
        /* Saw wave*/
        let xButSaw = width/3+100-6 + 100;
        let yButSaw = 3*height/10-6 + 126;

        //circle(xButSaw + 10, yButSaw , 25);

        a = 0.0; fill(0); stroke(0);
        inc = TWO_PI / 10.0;
        let kk= 0
        for (let i = 0; i < 10; i++) {
          if (i==5) {kk=1;}
          else {line(xButSaw + i * 2, yButSaw, xButSaw + i * 2, yButSaw - kk*2.0); kk++;}
          a = a + inc;
        }

        /* Trianle wave*/
        let xButTri = width/3+100-6 + 150;
        let yButTri = 3*height/10-6 + 126;

        //circle(xButTri + 10, yButTri , 25);

        a = 0.0; fill(0); stroke(0);
        inc = TWO_PI / 12.0;
        for (let i = 0; i < 12; i++) {
          line(xButTri + i * 2, yButTri, xButTri + i * 2, yButTri - asin(sin(a)) * 6.0); 
          a = a + inc;
        }
    }
  }
  
function mouseClicked(){
  /* Sine wave pressed */
  if(dist(mouseX, mouseY, width/3+100-6 + 10, 3*height/10-6 + 126) < 25) {
    console.log("sine")
  oscillator.stop(context.currentTime);
  oscillator.disconnect();
  gainNode.disconnect(context.destination);

  oscillator = context.createOscillator();
  //oscillator.frequency.value = 261;
  oscillator.type = "sine";
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(context.currentTime);
  }
/* Square wave pressed */
if(dist(mouseX, mouseY, width/3+100-6 + 50+10, 3*height/10-6 + 126) < 25) {
  console.log("square")
  oscillator.stop(context.currentTime);
  oscillator.disconnect();
  gainNode.disconnect(context.destination);

  oscillator = context.createOscillator();
  //oscillator.frequency.value = 261;
  oscillator.type = "square";
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(context.currentTime);
}

/* Saw wave pressed */
if(dist(mouseX, mouseY, width/3+100-6 + 100 +10, 3*height/10-6 + 126) < 25) {
  console.log("saw")
  oscillator.stop(context.currentTime);
  oscillator.disconnect();
  gainNode.disconnect(context.destination);

  oscillator = context.createOscillator();
  //oscillator.frequency.value = 261;
  oscillator.type = "sawtooth";
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(context.currentTime);
}

/* Triangle wave pressed */
if(dist(mouseX, mouseY, width/3+100-6 + 150 +10, 3*height/10-6 + 126) < 25) {
  console.log("triangle")
  oscillator.stop(context.currentTime);
  oscillator.disconnect();
  gainNode.disconnect(context.destination);

  oscillator = context.createOscillator();
  //oscillator.frequency.value = 261;
  oscillator.type = "triangle";
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(context.currentTime);
}
}