/*
  ================================================================
  == SERVIDOR SEGURO PARA VALIDACIÓN DE CÓDIGOS PROMOCIONALES ==
  ================================================================
  Este archivo debe ejecutarse en tu entorno de hosting (Node.js).
  NO es para el navegador. Contiene la lógica y los secretos.
*/

// Importamos las librerías necesarias. 'express' para crear el servidor
// y 'cors' para permitir que tu página web se comunique con él.
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Creamos la aplicación del servidor
const app = express();
const port = process.env.PORT || 3000; // El servidor se ejecutará en el puerto 3000

// --- Base de datos SEGURA de códigos de descuento ---
// Esta información NUNCA será visible para el usuario.
const promoCodes = {
  'CREATIVOS10': { type: 'percent', value: 10 },
  '5OFF': { type: 'fixed', value: 5 },
  'CR2025GRATIS': { type: 'percent', value: 100, adminOnly: true }, // Marcado como solo para admin
  'CREATIVOS20RP': { type: 'percent', value: 5 },
};

// --- Clave de API de ImgBB ---
// 🛑 ¡MEJORA DE SEGURIDAD! Leemos la clave desde una Variable de Entorno.
// Esta variable la configurarás de forma segura en el panel de Render,
// nunca estará visible en tu código de GitHub.
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

// --- SECRETOS DE DISCORD ---
// También los leeremos desde las Variables de Entorno de Render.
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_LOG_CHANNEL_ID = process.env.DISCORD_LOG_CHANNEL_ID;

// --- IP del servidor de SA-MP ---
// La centralizamos aquí para que no esté expuesta en el frontend.
const SERVER_IP = '45.45.237.224:7779';

// Middlewares: permiten que el servidor entienda JSON y se comunique con tu web
app.use(cors()); // Permite peticiones desde tu dominio
app.use(express.json()); // Permite recibir datos en formato JSON

/*
  ================================================================
  == LÓGICA DEL BOT DE DISCORD ==
  ================================================================
*/
const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

let isDiscordReady = false;

if (DISCORD_BOT_TOKEN) {
  discordClient.once('ready', () => {
    console.log(`¡Bot de Discord conectado como ${discordClient.user.tag}!`);
    isDiscordReady = true;
  });

  discordClient.login(DISCORD_BOT_TOKEN);
} else {
  console.warn('No se proporcionó un token de bot de Discord. Las notificaciones de compra estarán desactivadas.');
}

async function sendDiscordNotification(details) {
  if (!isDiscordReady || !DISCORD_LOG_CHANNEL_ID) return;

  try {
    const channel = await discordClient.channels.fetch(DISCORD_LOG_CHANNEL_ID);
    if (!channel) return;

    const embedFields = [
      { name: 'Usuario SA-MP', value: details.username, inline: true },
      { name: 'Producto', value: details.itemName, inline: true },
      { name: 'Monto Pagado', value: `**${details.amount} ${details.currency}**`, inline: true },
      { name: 'ID de Transacción', value: `\`${details.orderID}\`` }
    ];

    // Lógica para añadir información del cupón
    if (details.promoCode) {
      const codeData = promoCodes[details.promoCode];
      if (codeData) {
        if (codeData.adminOnly) {
          embedFields.push({ name: 'Cupón Usado', value: 'Admin (Gratis)', inline: true });
        } else {
          const discountValue = codeData.type === 'percent' ? `${codeData.value}%` : `$${codeData.value} USD`;
          embedFields.push({ name: 'Cupón Usado', value: `${details.promoCode} (${discountValue})`, inline: true });
        }
      }
    }

    const embed = new EmbedBuilder()
      .setColor(details.amount === '0.00' ? '#FFA500' : '#00FF00')
      .setTitle('✅ Nueva Compra Realizada')
      .addFields(embedFields)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error al enviar la notificación de Discord:', error);
  }
}

/*
  == ENDPOINT PARA VALIDAR CÓDIGOS PROMOCIONALES ==
  La página web enviará una petición aquí para ver si un código es válido.
*/
app.post('/validate-promo', (req, res) => {
  console.log(`[${new Date().toISOString()}] INFO: Recibida petición para validar código.`);

  const { code, username } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No se proporcionó ningún código.' });
  }

  const codeData = promoCodes[code.toUpperCase()];

  if (!codeData) {
    return res.status(404).json({ error: 'Código no válido o expirado.' });
  }

  // Lógica especial para el código de administrador
  if (codeData.adminOnly && username !== 'admincr_admincr') {
    return res.status(403).json({ error: 'Este código es de uso exclusivo.' });
  }

  // Si todo está bien, devolvemos los detalles del descuento
  res.json({
    success: true,
    discount: codeData,
    // Si es el código de admin, enviamos el nombre de usuario que debe aparecer en el recibo
    receiptUsername: codeData.adminOnly ? 'none_none' : null
  });
});

/*
  == ENDPOINT PARA REGISTRAR UNA COMPRA Y ENVIAR NOTIFICACIÓN ==
  La página de pago exitoso llamará aquí para que el servidor envíe la alerta.
*/
app.post('/log-purchase', (req, res) => {
  console.log(`[${new Date().toISOString()}] INFO: Recibida petición para registrar compra.`);

  const purchaseDetails = req.body;

  // Llama a la función que envía la notificación a Discord
  sendDiscordNotification(purchaseDetails);

  res.status(200).json({ message: 'Notificación procesada.' });
});

/*
  == ENDPOINT PARA OBTENER LA CLAVE DE API DE IMGBB DE FORMA SEGURA ==
*/
app.get('/imgbb-key', (req, res) => {
  console.log(`[${new Date().toISOString()}] INFO: Recibida petición para obtener clave de ImgBB.`);

  if (!IMGBB_API_KEY) {
    console.error(`[${new Date().toISOString()}] ERROR: La variable de entorno IMGBB_API_KEY no está configurada.`);
    return res.status(500).json({ error: 'El servicio de subida de imágenes no está configurado en el servidor.' });
  }
  res.json({ apiKey: IMGBB_API_KEY });
});

/*
  == ENDPOINT PARA OBTENER LA IP DEL SERVIDOR DE JUEGO ==
*/
app.get('/server-info', (req, res) => {
  console.log(`[${new Date().toISOString()}] INFO: Recibida petición de información del servidor.`);

  res.json({ serverIp: SERVER_IP });
});

// Ponemos el servidor a la escucha de peticiones
app.listen(port, () => {
  console.log(`Servidor de Creativos RP escuchando en el puerto ${port}`);
});
