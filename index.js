// Advmart WhatsApp Bot - Railway 版
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// 記得喺 Railway Variables 入面填呢 3 個
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'advmart123';

// 1. Meta 驗證 Webhook (一定要做)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook 驗證成功!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. 收 WhatsApp 訊息 + AI 回覆
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // 即刻回 Meta，唔好等 AI
  try {
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return;
    const from = msg.from; // 客人電話
    const text = msg.text?.body || '';
    console.log('客人:', text);

    // 呢度之後會接 AI + 計價
    // 而家先做簡單測試回覆
    let reply = `收到！Advmart 噴畫客服，\n你問：${text}\n請問尺寸係幾多？數量幾多？室內定戶外用？`;

    // 噴畫計價範例：如果客人打咗尺寸
    if (text.includes('背景板')) {
      reply = `背景板我哋有做！\n想報價要 4 樣資料：\n1. 尺寸 (闊 x 高)\n2. 數量\n3. 室內定戶外\n4. 幾時要\n\n你提供後我即刻幫你計價，仲可以俾埋計價連結你！`;
    }

    // 發返去 WhatsApp
    await axios.post(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      messaging_product: 'whatsapp',
      to: from,
      text: { body: reply }
    }, { headers: { Authorization: `Bearer ${TOKEN}` } });

  } catch (e) { console.log(e.message); }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Advmart Bot 運行中 Port ' + PORT));
