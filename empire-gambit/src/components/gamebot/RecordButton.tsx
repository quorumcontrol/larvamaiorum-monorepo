// RecordButton.tsx
import React, { useState } from "react";
import { IconButtonProps, IconButton, keyframes, useColorModeValue } from "@chakra-ui/react";
import { FaStop, FaMicrophone } from "react-icons/fa"

interface RecordProps {
  onRecord: (audioBuffer: Blob) => any;
}


const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 182, 193, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 182, 193, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 182, 193, 0);
  }
`;


const RecordButton: React.FC<RecordProps & Partial<IconButtonProps>> = (props) => {
  const { onRecord, ...buttonProps } = props;

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startRecording = async () => {
    setIsRecording(true);

    let mimeType = "audio/webm"

    let recorder = MediaRecorder

    if (!MediaRecorder.isTypeSupported("audio/webm")) {
      // then we are in safari or edge and need this polyfill to produce something openai can use (wav)
      const AudioRecorderImport = await import('audio-recorder-polyfill')
      recorder = AudioRecorderImport.default
      console.log("recorder", recorder)
      mimeType = "audio/wav" 
    }

    const options = { mimeType: mimeType, bitsPerSecond: 64000 }; // Set the bitrate to 32 kbps


    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setStream(stream)
    const newMediaRecorder = new recorder(stream, options);
    const audioChunks: Blob[] = [];

    newMediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    newMediaRecorder.addEventListener("stop", async () => {
      const audioBlob = new Blob(audioChunks, { type: options.mimeType });
      onRecord(audioBlob)
     
      // const audioUrl = URL.createObjectURL(audioBlob);
      // const audio = new Audio(audioUrl);
      // audio.play();

      setIsRecording(false);
    });

    newMediaRecorder.start();
    setMediaRecorder(newMediaRecorder);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    stream?.getTracks().forEach(function (track) {
      track.stop();
    });
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  const pulseEffect = isRecording
  ? { animation: `${pulseAnimation} 2s infinite` }
  : {};

  return (
    <IconButton
      aria-label="Record audio to transcribe"
      // backgroundColor="accent.500"
      colorScheme={isRecording ? "secondary" : "primary"}
      onMouseDown={toggleRecording}
      {...pulseEffect}
      {...buttonProps}
      icon={isRecording ? <FaStop /> : <FaMicrophone /> }
    />
  );
};

export default RecordButton;