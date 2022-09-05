import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalBody,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  FormErrorMessage,
  Button,
  VStack,
  Spinner,
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
import { useUserBadges } from "../hooks/BadgeOfAssembly";
import TeamPicker from "./TeamPicker";
import { useUsername } from "../hooks/Player";
import { BigNumberish } from "ethers";

const log = debug("SignupModal");

type FormData = UserData;

const SignupModal: React.FC<{
  isOpen: boolean;
  onClose: () => any;
  ignoreSkip?: boolean;
}> = ({ isOpen, onClose, ignoreSkip = false }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const { login } = useLogin();
  const queryClient = useQueryClient();
  const { data: userBadges } = useUserBadges(address);
  const [newTeam, setTeam] = useState<BigNumberish | undefined>();
  const { data: username } = useUsername(address);

  const [isSkipped, setIsSkipped] = useState(!!!ignoreSkip);

  const onSubmit = async ({ username }: FormData) => {
    const queryKey = ["/player/username/", address];
    try {
      setLoading(true);
      log("creating new user");
      await login(username, newTeam);
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
    <Modal isOpen={(!isSkipped || ignoreSkip) && isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p="6" bg="brand.background" maxW="600px">
        <ModalBody backgroundImage={border} p="6">
          <Heading>Your Profile</Heading>
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
                  defaultValue={username || ""}
                />
                <FormHelperText>You can change this later.</FormHelperText>
                <FormErrorMessage>Username is required.</FormErrorMessage>
              </FormControl>
              {(userBadges || []).length > 0 && (
                <TeamPicker address={address} onSelect={setTeam} />
              )}

              <FormControl>
                <Button variant="primary" disabled={loading} type="submit">
                  {!loading && "Save"}
                  {loading && <Spinner />}
                </Button>
                {loading && (
                  <FormHelperText>Confirm in your wallet.</FormHelperText>
                )}
                <Button variant="link" ml="4" onClick={onClose}>Cancel</Button>
              </FormControl>
            </VStack>
          </form>
        </ModalBody>

        {!ignoreSkip && (
          <ModalFooter>
            <Link fontSize="md" onClick={() => setIsSkipped(true)}>
              Skip
            </Link>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SignupModal;
