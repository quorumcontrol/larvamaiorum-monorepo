
export const useEnvironmentSound = () => {
  const start = () => {
    const audioContext = new AudioContext();

    async function loadAudio(url:string) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    }

    function createSourceNode(audioBuffer:AudioBuffer) {
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.loop = true;
      return sourceNode;
    }

    async function setupAudio() {
      const audioBuffer1 = await loadAudio('/audio/voices-of-ghosts.mp3');
      const audioBuffer2 = await loadAudio('/audio/campfire.mp3');

      const sourceNode1 = createSourceNode(audioBuffer1);
      const sourceNode2 = createSourceNode(audioBuffer2);

      const gainNode1 = audioContext.createGain();
      const gainNode2 = audioContext.createGain();

      sourceNode1.connect(gainNode1);
      gainNode1.connect(audioContext.destination);

      sourceNode2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      gainNode1.gain.value = 0.05
      gainNode2.gain.value = 1.35

      const startTime = audioContext.currentTime;
      sourceNode1.start(startTime);
      sourceNode2.start(startTime);
    }

    setupAudio()
  }
  
  return {
    start
  }
}