import { Client } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import CONFIG from '../config.json'
import moment from 'moment-timezone';

const client = new Client();

const connection = () => {
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    client.initialize();
}

const sendMessage = (message) => {
    CONFIG.phones.forEach(phone => client.sendMessage(phone, message).then(() => console.log(`Relatório enviado às ${moment().format("HH:mm")} para ${phone} ✉️\n${message}\n\n`)).catch(console.log))
}

export { connection, sendMessage }