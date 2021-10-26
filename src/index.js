import CFonts from 'cfonts';
import puppeteer from 'puppeteer';
import cron from 'node-cron';
import { Client } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'

async function getDraco() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto('https://mir4draco.com/');
	const amount = await page.evaluate(() => Array.from(document.querySelectorAll('[class="amount"]'), element => element.textContent));
	await browser.close();
	return `Draco está a: *${amount[1]}*`;
}

const client = new Client();

client.on('qr', qr => {
	qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message_create', message => {
	console.log(message)
	if(message.body === '$draco') getDraco().then( r => client.sendMessage(message.from, r));
});

client.initialize();

cron.schedule('* * * * *', () => {
	// getDraco().then(r => client.sendMessage('553184374282-1622821696@g.us', r))
});

CFonts.say('Draco|Alert!', {
	font: 'block',              // define the font face
	align: 'left',              // define text alignment
	colors: ['system', 'red'],  // define all colors
	background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
	letterSpacing: 1,           // define letter spacing
	lineHeight: 1,              // define the line height
	space: true,                // define if the output text should have empty lines on top and on the bottom
	maxLength: '0',             // define how many character can be on one line
});