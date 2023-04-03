import { Client } from 'node-appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('642adf7622458e6f1519')
    .setKey(process.env.APPWRITE_SECRET)

export default client
