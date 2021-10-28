import moment from 'moment-timezone';
import { connection, sendMessage} from './whatsapp.js';
import CONFIG from '../config.json'
import puppeteer from 'puppeteer';
import cron from 'node-cron';
import CFonts from 'cfonts';
import fs from 'fs';

connection();

async function getDraco() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto('https://mir4draco.com/');
	const amount = await page.evaluate(() => Array.from(document.querySelectorAll('[class="amount"]'), element => element.textContent));
	await browser.close();
	return parseFloat(amount[1].replace('$', '').replace(',', '.').trim()); // refatorar esse pecado
}

// Salva relatórios de 1 em 1 minuto
cron.schedule('*/5 * * * *', () => {
	getDraco().then(r => {
		let now = moment().format("HH:mm");
		let lastDay = Object.keys(CONFIG.draco)[Object.keys(CONFIG.draco).length-1];
		if (lastDay === moment().format("DD/MM/YYYY")) {
			CONFIG.draco[lastDay].push({value: r, moment: now})
			fs.writeFile('./config.json', JSON.stringify(CONFIG), function writeJSON(err) {
				if (err) return console.log(err);
			});
		} else {
			CONFIG.draco = { ...CONFIG.draco, [moment().format("DD/MM/YYYY")]:[ {value: r, moment: moment().format("HH:mm")} ] }
			fs.writeFile('./config.json', JSON.stringify(CONFIG), function writeJSON(err) {
				if (err) return console.log(err);
			});
		}
		console.log(`${now}: Draco salvo à $${r} 💾`)
	});
});

// Envia relatórios de 30 em 30 minutos
cron.schedule('*/30 * * * *', () => {
	let report = `*Relatório ~Cherno~ Draco 🐉🪙*\n\n`
	let configObject = CONFIG.draco[moment().format("DD/MM/YYYY")].slice(-6)
	configObject.forEach((draco, index) => {
		let DIFF = 0
		if(index == 0) {
			report += '|--------------------------------|\n'
			report += `\xa0\xa0\xa0\xa0*$${draco.value.toFixed(4)} às ${draco.moment} | ANTIGO*\n`
			report += '|--------------------------------|\n'
		} else if(index != 0 && index != 5) {
			DIFF = parseFloat(draco.value - configObject[index - 1].value).toFixed(4);
			report += `\xa0\xa0_$${draco.value.toFixed(4)} às ${draco.moment} | ${DIFF == 0 ? `+${DIFF} 💤` : DIFF > 0 ? `+${DIFF} 👆` : `${DIFF} 👇`}_\n`
		} else {
			DIFF = parseFloat(draco.value - configObject[0].value).toFixed(4);
			report += '|--------------------------------|\n'
			report += `\xa0\xa0\xa0\xa0*$${draco.value.toFixed(4)} às ${draco.moment} | ATUAL*\n`
			report += '|--------------------------------|\n\n'
			report += DIFF == 0 ? `\`\`\`Nada mudou 💤\`\`\`` : DIFF > 0 ? `\`\`\`Aumento de +${DIFF} 👆\`\`\`` : `\`\`\`Queda de ${DIFF} 👇\`\`\``
		}
	});
	const DIFF_PERCENTAGE = (configObject[5].value / configObject[0].value * 100 - 100).toFixed(3);
	report += `\n\n\`\`\`Flutuação de ${DIFF_PERCENTAGE}% em 30 minutos 📈\`\`\``
	sendMessage(report)
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