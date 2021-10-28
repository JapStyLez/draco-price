import { Client } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import CONFIG from '../config.json'

const client = new Client();

const connection = () => {
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    client.on('message_create', message => {
        if (message.body === '$draco') getDraco().then(r => client.sendMessage(message.from, r));
    });

    client.initialize();
}

const sendMessage = (message) => {
    CONFIG.phones.forEach(phone => client.sendMessage(phone, message).catch(console.log))
}

export { connection, sendMessage }