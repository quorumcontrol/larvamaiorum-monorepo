import { Box, Flex, Center } from "@chakra-ui/react";

const OnBoardContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    // <Flex alignItems="center" justifyContent="center">
    // <Box
    //   p={[1, 8]}
    //   borderRadius="lg"
    //   borderColor={["transparent", "brand.orange"]}
    //   backgroundColor="black"
    //   borderWidth="2px"
    // >
    <>
      {children}
    </>
    //   </Box>
    // </Flex>
  );
};

export default OnBoardContainer