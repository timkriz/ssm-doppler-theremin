let global_freqs;
let global_freqs_upper;
let global_freqs_lower;
let global_primary;

window.doppler = (function() {
    // Base frequency
    var freq = 19000;
    // Number of bins on sides of peak
    var relevantFreqWindow = 33;


    var AuContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);
    var ctx = new AuContext();
    var osc = ctx.createOscillator();
    
  
    var getBandwidth = function(analyser, freqs) {
      var primaryTone = freqToIndex(analyser, freq);
      var primaryVolume = freqs[primaryTone];

      // This ratio is totally empirical (aka trial-and-error).
      var maxVolumeRatio = 0.001;
  
      //copy to global
      let highest_freq_visualized_lower_band = 2048;
      global_freqs = Array.from(freqs);
      global_freqs_upper = global_freqs.slice(primaryTone-relevantFreqWindow, primaryTone+relevantFreqWindow +1);
      global_freqs_lower = global_freqs.slice(0, freqToIndex(analyser, highest_freq_visualized_lower_band) +1);
      global_primary = primaryTone;

      var leftBandwidth = 0;
      do {
        leftBandwidth++;
        var volume = freqs[primaryTone-leftBandwidth];
        var normalizedVolume = volume / primaryVolume;
      } while (normalizedVolume > maxVolumeRatio && leftBandwidth < relevantFreqWindow);
  
      var rightBandwidth = 0;
      do {
        rightBandwidth++;
        var volume = freqs[primaryTone+rightBandwidth];
        var normalizedVolume = volume / primaryVolume;
      } while (normalizedVolume > maxVolumeRatio && rightBandwidth < relevantFreqWindow);
  
      return { left: leftBandwidth, right: rightBandwidth };
    };
  
    var freqToIndex = function(analyser, freq) {
      var nyquist = ctx.sampleRate / 2;
      return Math.round( freq/nyquist * analyser.fftSize/2 );
    };
  
    var indexToFreq = function(analyser, index) {
      var nyquist = ctx.sampleRate / 2;
      return nyquist/(analyser.fftSize/2) * index;
    };
  
    var optimizeFrequency = function(osc, analyser, freqSweepStart, freqSweepEnd) {
      var oldFreq = osc.frequency.value;
  
      var audioData = new Uint8Array(analyser.frequencyBinCount);
      var maxAmp = 0;
      var maxAmpIndex = 0;
  
      var from = freqToIndex(analyser, freqSweepStart);
      var to   = freqToIndex(analyser, freqSweepEnd);
      for (var i = from; i < to; i++) {
        osc.frequency.value = indexToFreq(analyser, i);
        analyser.getByteFrequencyData(audioData);
  
        if (audioData[i] > maxAmp) {
          maxAmp = audioData[i];
          maxAmpIndex = i;
        }
      }
      // Sometimes the above procedure seems to fail, not sure why.
      // If that happends, just use the old value.
      if (maxAmpIndex == 0) {
        return oldFreq;
      }
      else {
        return indexToFreq(analyser, maxAmpIndex);
      }
    };
  
    var readMicInterval = 0;
    var readMic = function(analyser, userCallback) {
      var audioData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(audioData);       // fill the Uint8Array with data returned from getByteFrequencyData()
      
      var band = getBandwidth(analyser, audioData);
      userCallback(band);
  
      readMicInterval = setTimeout(readMic, 1, analyser, userCallback);
    };
  

    /* 1. */
    var handleMic = function(stream, callback, userCallback) {
      // Mic
      var mic = ctx.createMediaStreamSource(stream);
      var analyser = ctx.createAnalyser();
  
      analyser.smoothingTimeConstant = 0.5;
      analyser.fftSize = 2048;
  
      mic.connect(analyser);
  
      // Doppler tone oscilator
      osc.frequency.value = freq;
      osc.type = osc.SINE;
      osc.start(0);
      //osc.connect(ctx.destination);
      $("#turnPilotOn").click(function(el) {
            pilotIsOn = true;
            osc.connect(ctx.destination);
            $(this).css('background-color', '#320C0B');
            $("#turnPilotOff").css('background-color', '#A57473');
      });
      $("#turnPilotOff").click(function() {
            pilotIsOn = false;
            osc.disconnect(ctx.destination);
            $(this).css('background-color', '#320C0B');
            $("#turnPilotOn").css('background-color', '#A57473');
      });

      // There seems to be some initial "warm-up" period
      // where all frequencies are significantly louder.
      // A quick timeout will hopefully decrease that bias effect.
      setTimeout(function() {
        // Optimize doppler tone
        freq = optimizeFrequency(osc, analyser, 17000, 21000);
        osc.frequency.value = freq;
  
        clearInterval(readMicInterval);
        callback(analyser, userCallback);
      });
    };
  
    return {
      init: function(callback) {
        navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        
        navigator.getUserMedia_({ audio: { optional: [{ echoCancellation: false }] } }, function(stream) {
            handleMic(stream, readMic, callback);
        }, function() { console.log('Error.') });
      },
      stop: function () {
        //console.log("Stop.");
        //osc.stop(ctx.currentTime);
        clearInterval(readMicInterval);
      }
    }
  })(window, document);