import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalBody,
  Text,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  FormErrorMessage,
  Button,
  VStack,
  Spinner,
  Box,
  HStack,
  ModalFooter,
  Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import debug from "debug";
import { useQueryClient } from "react-query";
import { useAccount } from "wagmi";
import { useLogin, UserData } from "../hooks/useUser";
import border from "../utils/dashedBorder";

const log = debug("SignupModal");

type FormData = UserData;

const SignupModal: React.FC<{ isOpen: boolean; onClose: () => any }> = ({
  isOpen,
  onClose,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const { login } = useLogin();
  const queryClient = useQueryClient();

  const [isSkipped, setIsSkipped] = useState(false);

  const onSubmit = async ({ username }: FormData) => {
    const queryKey = ["/player/username/", address];
    try {
      setLoading(true);
      log("creating new user");
      await login(username);
      queryClient.cancelQueries(queryKey);
      queryClient.setQueryData(["/player/username/", address], () => {
        return username;
      });
      onClose();
      //TODO: anything here?
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={!isSkipped && isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p="6" bg="brand.background" maxW="600px">
        <ModalBody backgroundImage={border} p="6">
          <Heading>Your Name</Heading>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing="10">
              <FormControl
                isRequired
                isInvalid={!!errors.username}
                isDisabled={loading}
              >
                <FormLabel htmlFor="username">
                  What do you want to be called?
                </FormLabel>
                <Input
                  id="username"
                  type="text"
                  {...register("username", { required: true })}
                />
                <FormHelperText>You can change this later.</FormHelperText>
                <FormErrorMessage>Username is required.</FormErrorMessage>
              </FormControl>
              <FormControl>
                <Button variant="primary" disabled={loading} type="submit">
                  {!loading && "Save"}
                  {loading && <Spinner />}
                </Button>
                {loading && (
                  <FormHelperText>Confirm in your wallet.</FormHelperText>
                )}
              </FormControl>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Link fontSize="md" onClick={() => setIsSkipped(true)}>
            Skip
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SignupModal;
