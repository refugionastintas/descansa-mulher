// pages/api/hotmart-webhook.js
// URL para colocar na Hotmart:
// https://descansa-mulher.vercel.app/api/hotmart-webhook

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function gerarSenha() {
  const nums = Math.floor(1000 + Math.random() * 9000)
  const simbolos = ['!', '@', '#', '*', '&']
  const s = simbolos[Math.floor(Math.random() * simbolos.length)]
  return `Descansa${nums}${s}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const body = req.body

    const evento = body?.event || body?.data?.event || ''
    const eventosOk = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'PURCHASE_CONFIRMED']
    if (!eventosOk.includes(evento)) {
      return res.status(200).json({ ok: true, msg: `Evento ignorado: ${evento}` })
    }

    const buyer = body?.data?.buyer || {}
    const email = buyer.email
    const nome  = buyer.name || ''

    if (!email) {
      return res.status(400).json({ error: 'Email não encontrado' })
    }

    // Verificar se já existe
    const { data: lista } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const jaExiste = lista?.users?.find(u => u.email === email)
    if (jaExiste) {
      return res.status(200).json({ ok: true, msg: 'Usuária já cadastrada' })
    }

    // Gerar senha
    const senha = gerarSenha()

    // Criar usuária já confirmada
    const { data: novaUser, error: errUser } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome }
    })
    if (errUser) throw new Error(errUser.message)

    // Salvar log com senha para você ver no painel
    await supabase.from('purchase_log').insert({
      user_id:    novaUser.user.id,
      email,
      nome,
      senha_temp: senha,
      evento,
      created_at: new Date().toISOString()
    })

    // Enviar email via Resend usando domínio do Supabase como remetente
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://descansa-mulher.vercel.app'
    const primeiro = nome ? nome.split(' ')[0] : 'Mulher'

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Descansa, Mulher! <onboarding@resend.dev>',
        to: email,
        subject: '💛 Seu acesso ao Descansa, Mulher! chegou',
        html: `
        <div style="font-family:'Georgia',serif;max-width:520px;margin:0 auto;background:#FDFBF8;border-radius:20px;overflow:hidden;border:1px solid #EDE5D8;">
          <div style="height:5px;background:linear-gradient(90deg,#E8D5CE,#C9A99A,#D4B8AE);"></div>
          <div style="padding:40px 36px;">
            <p style="font-size:22px;color:#5C4F4A;font-weight:300;margin:0 0 8px;">Olá, ${primeiro}! 🌸</p>
            <p style="font-size:13px;color:#9B8D87;margin:0 0 28px;letter-spacing:0.05em;text-transform:uppercase;">descansa, mulher · organize. respire. viva.</p>
            <p style="font-size:15px;color:#5C4F4A;line-height:1.7;margin:0 0 24px;">
              Sua compra foi confirmada e seu acesso está pronto. 
              A partir de agora você tem um espaço só seu para organizar 
              a mente e a rotina — sem pressão, sem cobranças.
            </p>
            <div style="background:#F5F0E8;border-radius:14px;padding:24px;margin:0 0 28px;border-left:4px solid #C9A99A;">
              <p style="font-size:11px;color:#A89E97;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 14px;">seus dados de acesso</p>
              <p style="margin:0 0 8px;font-size:15px;color:#5C4F4A;"><strong>Email:</strong> ${email}</p>
              <p style="margin:0 0 8px;font-size:15px;color:#5C4F4A;"><strong>Senha:</strong> ${senha}</p>
              <p style="margin:0;font-size:11px;color:#9B8D87;font-style:italic;">Você pode alterar sua senha depois de entrar.</p>
            </div>
            <div style="text-align:center;margin:0 0 28px;">
              <a href="${appUrl}" style="display:inline-block;background:#C9A99A;color:white;text-decoration:none;padding:14px 40px;border-radius:100px;font-size:14px;font-weight:500;">
                entrar no app →
              </a>
            </div>
            <div style="background:#E8D5CE;border-radius:10px;padding:16px;text-align:center;margin:0 0 24px;">
              <p style="margin:0;font-size:13px;color:#5C4F4A;line-height:1.6;">
                Não recebeu ou teve algum problema?<br>
                Fale comigo pelo WhatsApp:<br>
                <strong>(12) 99668-0446 — Gislaine</strong>
              </p>
            </div>
            <p style="font-size:12px;color:#A89E97;text-align:center;margin:0;">com carinho 💛<br><em>Descansa, Mulher!</em></p>
          </div>
          <div style="height:3px;background:linear-gradient(90deg,#E8D5CE,#C9A99A,#D4B8AE);"></div>
        </div>`
      })
    })

    return res.status(200).json({ ok: true, email, msg: 'Usuária criada e email enviado!' })

  } catch (err) {
    console.error('Erro webhook:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
