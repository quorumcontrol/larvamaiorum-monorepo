import AppLayout from '@/components/minerva/AppLayout'
import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button, Container, FormControl, HStack, Heading, Input, Text, Textarea, VStack } from '@chakra-ui/react'

const Clippings = () => {
  const client = useSupabaseClient<Function>()
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [tag, setTag] = useState("")

  const updateClipping = () => {
    const asyncFunc = async () => {
      try {
        setLoading(true)
        const scrape = await fetch("/api/scrape", {
          body: JSON.stringify({
            url,
          }),
          method: "POST",
        })
        const { text } = await scrape.json()
        console.log("text: ", text)
        const resp = await client.functions.invoke("content", {
          body: {
            url,
            tag,
            scrape: {
              text,
            },
          }
        })
        console.log("resp: ", resp)
      } catch (err) {
        console.error("error: '", err)
      } finally {
        setLoading(false)
      }
    }
    asyncFunc()
  }

  return (
    <AppLayout>
      <Container maxW={"xl"}>
        <Heading>Save a memory</Heading>
        <Text>A prescraped manual url (advanced feature, probably want to leave)</Text>
        <VStack spacing="5" alignItems="left" mt="10">
          <FormControl>
            <Input name="url" type="text" placeholder='url to parse' onChange={(evt) => setUrl(evt.target.value)} value={url} />
          </FormControl>
          <FormControl>
            <Input name="tag" type="text" placeholder='tag for url' onChange={(evt) => setTag(evt.target.value)} value={tag} />
          </FormControl>
          <HStack spacing="10">
            <Button
              variant="solid"
              onClick={() => updateClipping()}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </HStack>
        </VStack>
      </Container>
    </AppLayout>
  )
}

export default Clippings