// RecordButton.tsx
import React, { useState } from "react";
import { keyframes, Icon, Button, ButtonProps, Spinner } from "@chakra-ui/react";
import { BiMicrophone, BiStop } from "react-icons/bi"

interface RecordProps {
  onRecord: (audioBuffer: Blob) => any;
  loading?:boolean
  onFirstClick?: () => any
}


const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 182, 193, 0.4);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 182, 193, 0);
    transform: scale(1.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 182, 193, 0);
    transform: scale(1);
  }
`

const RecordButton: React.FC<RecordProps & Partial<ButtonProps>> = (props) => {
  const { onRecord, onFirstClick, loading, ...buttonProps } = props;

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [firstClick, setFirstClick] = useState(false)

  if (loading) {
    return <Spinner />
  }

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

    const options = { mimeType: mimeType, bitsPerSecond: 64000 }; // Set the bitrate to 64 kbps


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

  const handleClick = () => {
    if (!firstClick) {
      setFirstClick(true)
      onFirstClick?.()
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  const pulseEffect = isRecording
    ? {}
    : { animation: `${pulseAnimation} 2s infinite` };


  return (
    <Button
      variant="solid"
      size="lg"
      onMouseDown={handleClick}
      rightIcon={<Icon as={isRecording ? BiStop : BiMicrophone} w={8} h={8} />}
      p={4}
      mt={8}
      {...pulseEffect}
      {...buttonProps}
    >
      { isRecording ? "Stop" : "Push to Talk" }
    </Button>

  );
};

export default RecordButton;