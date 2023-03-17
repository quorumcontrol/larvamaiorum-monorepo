import { Box, Button, FormControl, FormErrorMessage, FormHelperText, Input, Spinner, Stack, Text } from "@chakra-ui/react"
import { useState } from "react";
import { useForm } from "react-hook-form";

interface EmailFormData {
  email: string
}

const EmailSubscriptionForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)

  const { register, handleSubmit, formState: { errors }, setError } = useForm<EmailFormData>()

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true)
    try {
      const resp = await fetch("/api/mail", {
        method: "POST",
        body: JSON.stringify(data)
      })
      const json = await resp.json()
      console.log("json: ", json)
      if (resp.status !== 201) {
        setError("email", {message: "Something went wrong. Please try again later."})
        return false
      }
      setComplete(true)
      return true
    } catch (err) {
      setError("email", {message: "Something went wrong. Please try again later."})
    } finally {
      setLoading(false)
    }
  })

  if (loading) {
    return (
      <Box pt="10">
        <Spinner />
      </Box>
    )
  }

  if (complete) {
    return (
      <Box pt="10">
        <Text>Thanks! We will be in touch.</Text>
      </Box>
    )
  }

  return (
    <Box as="form" onSubmit={onSubmit} pt="10">
      <Stack direction={["column", "row"]} spacing={[5,10]} align="flex-start">

        <FormControl
          isRequired
          isInvalid={!!errors.email}
          isDisabled={loading}
        >
          <Input
            id="email"
            type="text"
            placeholder="Enter email address here"
            _placeholder={{ opacity: 1, color: 'gray.500' }}
            variant="filled"
            bgColor={"black"}
            {...register("email", { required: true })}
            h="40px"
          />
          <FormHelperText>You agree to receive emails with the understanding you can opt-out at any time.</FormHelperText>
          <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
        </FormControl>
        <Box>
          <Button variant="primary" type="submit">Sign up for early access</Button>
        </Box>
      </Stack>
    </Box>
  )
}

export default EmailSubscriptionForm