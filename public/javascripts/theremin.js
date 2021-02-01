
let context = new AudioContext(), mousedown = false, changingGain=false, oscillator = null; 
let gainNode = context.createGain();
let pilotIsOn= false;


const mapRange = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

let freq_new = 261;
let displayingPlayedFreq = false;

var calculateFrequency = function (bandwidth) {
    var minFrequency = 20, maxFrequency = 1500;
    
    if(bandwidth){
        let diff = (bandwidth.left - bandwidth.right);
        //console.log(diff);
        if(diff && diff < 0) {
            let new_freq_calc = freq_new + diff *2;  
            if(new_freq_calc< maxFrequency && new_freq_calc>minFrequency) freq_new = new_freq_calc;  
        }
        if(diff && diff > 0) {
            let new_freq_calc = freq_new + diff *1;
            if(new_freq_calc< maxFrequency && new_freq_calc>minFrequency) freq_new = new_freq_calc;
        }
    }
    
    return freq_new;
};
var calculateGain = function (mouseYPosition) {
    var minGain = 0,
        maxGain = 1;
  
    return 1 - ((mouseYPosition / window.innerHeight) * maxGain) + minGain;
  };

  
$(document).on('click', '#thereminOn', function() {
    mousedown = true;
    oscillator = context.createOscillator();
    oscillator.frequency.value = 261;
    freq_new = 261;
    //oscillator.type = "sawtooth";
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    gainNode.gain.value = 0.6;
    oscillator.start(context.currentTime);

    displayingPlayedFreq = true;

    $(this).css('background-color', '#320C0B');
    $("#thereminOff").css('background-color', '#A57473');

});
$(document).on('click', '#thereminOff', function() {
    mousedown = false;
        if (oscillator) {
            oscillator.stop(context.currentTime);
            oscillator.disconnect();
            displayingPlayedFreq = false;
        }
        $(this).css('background-color', '#320C0B');
        $("#thereminOn").css('background-color', '#A57473');    
});
$(document).on('click', '#gainOn', function() {
    changingGain = true;

    $(this).css('background-color', '#320C0B');
    $("#gainOff").css('background-color', '#A57473');    
});
$(document).on('click', '#gainOff', function() {
    changingGain = false;

    $(this).css('background-color', '#320C0B');
    $("#gainOn").css('background-color', '#A57473');    
});

document.body.addEventListener('mousemove', function (e) {
    if (mousedown) {
        oscillator.frequency.setTargetAtTime(calculateFrequency(e.clientX), context.currentTime, 0.01);
        if(changingGain) gainNode.gain.setTargetAtTime(calculateGain(e.clientY), context.currentTime, 0.01);
    }
});
