import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
} from "@chakra-ui/react";
import React from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const nullFunction = () => {
  return;
};

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose || nullFunction} isCentered size="2xl">
      <ModalOverlay backdropFilter='blur(20px)' />
      <ModalContent bg='transparent' boxShadow='none'>
        {/* <ModalHeader>Modal Title</ModalHeader> */}
        {/* <ModalCloseButton /> */}
        <ModalBody bg='transparent'>
            <video
              id="full-video"
              // className="video-js vjs-theme-city"
              controls
              autoPlay
              preload="auto"
              width="640"
              height="264"
              // poster="MY_VIDEO_POSTER.jpg"
              data-setup="{}"
            >
              <source src="/video/teaser.mp4" type="video/mp4" />
              {/* <source src="MY_VIDEO.webm" type="video/webm" /> */}
              <p className="vjs-no-js">
                To view this video please enable JavaScript, and consider
                upgrading to a web browser that supports HTML5 video
              </p>
            </video>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VideoModal;
