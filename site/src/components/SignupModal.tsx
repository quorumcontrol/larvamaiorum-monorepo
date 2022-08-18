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
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin, UserData } from "../hooks/useUser";
import debug from "debug";
import { useQueryClient } from "react-query";
import { useAccount } from "wagmi";

const log = debug("SignupModal");

const border = `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23D14509' stroke-width='1' stroke-dasharray='8%2c 15' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");`;

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p="6" bg="brand.background" maxW="600px">
        <ModalBody backgroundImage={border} p="6">
          <Heading>Create your username</Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing="10">
                <FormControl isRequired isInvalid={!!errors.username} isDisabled={loading}>
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
                  {loading &&  <FormHelperText>Confirm in your wallet.</FormHelperText>}
                </FormControl>
              </VStack>
            </form>
        </ModalBody>

        {/* <ModalFooter>
          <Text>Not now</Text>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export default SignupModal;
