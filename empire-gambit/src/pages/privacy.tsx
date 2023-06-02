import { Heading } from "@chakra-ui/react";
import Layout from "@/components/Layout"
import { NextPage } from "next";


const PrivacyPage: NextPage = () => {
  return (
    <Layout>
      <Heading>Privacy Policy</Heading>
      Quorum Control GmbH (&quot;We&quot;, &quot;Us&quot;, &quot;Our&quot;) is committed to protecting and respecting your privacy. This policy sets out the basis on which any personal data we collect from you, or that you provide to us, will be processed by us. Please read the following carefully to understand our views and practices regarding your personal data and how we will treat it.

      <Heading>Data Handling</Heading>
      We pledge not to sell your data under any circumstances. We strongly believe in the rights of individuals to control the use and dissemination of their personal data.

      <Heading>Data Transfers to Third Parties</Heading>
      In order to provide you with our service, we send prompts and user input to OpenAI and TextSynth. These services assist us in enhancing your user experience and improving the quality of our offerings. We will also add other third-party services in the future as necessary to continue to provide and improve our services.

      We want to ensure you that any third-party service provider involved in handling your data is selected with due care and is obliged to adhere to our standards for the privacy and security of your data.

      <Heading>Interaction with Supabase</Heading>
      Our backend is powered by Supabase. Supabase helps us in maintaining the performance and security of our website. Any interaction with our backend involves an interaction with Supabase. For more information about how Supabase handles your data, please review their privacy policy.

      <Heading>Communication Opt-out</Heading>
      You have the right to opt-out of any communication from us at any time. If you no longer wish to receive communications from us, you can do so by clicking on the unsubscribe link provided in our emails, or by contacting us directly.

      <Heading>Contact Us</Heading>
      Should you have any questions or concerns about this privacy policy or our data handling practices, please don&apos;t hesitate to contact us. You can email us at info@quorumcontrol.com.

      <Heading>Changes to Our Privacy Policy/Heading</Heading>
      We reserve the right to amend this privacy policy at any time. Any changes we may make to our privacy policy in the future will be posted on this page and, where appropriate, notified to you by email.

      <Heading>Data Protection Rights Under General Data Protection Regulation (GDPR)</Heading>
      For the purpose of the GDPR, the data controller is Quorum Control GmbH. If you are a resident of the European Economic Area (EEA), you have certain data protection rights. Quorum Control GmbH aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.

      If you wish to be informed of what Personal Data we hold about you and if you want it to be removed from our systems, please contact us at the email address above.

      This policy was last updated on June 2, 2023.
    </Layout>
  )
}

export default PrivacyPage