// pages/api/hotmart-webhook.js
// ============================================================
// Webhook da Hotmart — cria usuária e envia email de acesso
// URL para colocar na Hotmart:
// https://SEU-APP.vercel.app/api/hotmart-webhook
// ============================================================

import { createClient } from '@supabase/supabase-js'

// Cliente admin (usa service_role — só roda no servidor, nunca no browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Gera senha única: Descansa + 4 números + símbolo
function gerarSenha() {
  const nums = Math.floor(1000 + Math.random() * 9000)
  const simbolos = ['!', '@', '#', '*', '&']
  const s = simbolos[Math.floor(Math.random() * simbolos.length)]
  return `Descansa${nums}${s}`
}

// Template do email de boas-vindas
function emailTemplate(nome, email, senha, appUrl) {
  const primeiro = nome ? nome.split(' ')[0] : 'Mulher'
  return {
    subject: '💛 Seu acesso ao Descansa, Mulher! chegou',
    html: `
    <div style="font-family:'Georgia',serif;max-width:520px;margin:0 auto;background:#FDFBF8;border-radius:20px;overflow:hidden;border:1px solid #EDE5D8;">
      
      <!-- Faixa topo -->
      <div style="height:5px;background:linear-gradient(90deg,#E8D5CE,#C9A99A,#D4B8AE);"></div>
      
      <!-- Corpo -->
      <div style="padding:40px 36px;">
        
        <!-- Saudação -->
        <p style="font-size:22px;color:#5C4F4A;font-weight:300;margin:0 0 8px;">
          Olá, ${primeiro}! 🌸
        </p>
        <p style="font-size:14px;color:#9B8D87;margin:0 0 32px;letter-spacing:0.05em;text-transform:uppercase;">
          descansa, mulher · organize. respire. viva.
        </p>

        <!-- Mensagem -->
        <p style="font-size:15px;color:#5C4F4A;line-height:1.7;margin:0 0 24px;">
          Sua compra foi confirmada e seu acesso está pronto. 
          A partir de agora você tem um espaço só seu para organizar 
          a mente e a rotina — sem pressão, sem cobranças.
        </p>

        <!-- Box de acesso -->
        <div style="background:#F5F0E8;border-radius:14px;padding:24px;margin:0 0 28px;border-left:4px solid #C9A99A;">
          <p style="font-size:11px;color:#A89E97;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 14px;">
            seus dados de acesso
          </p>
          <p style="margin:0 0 8px;font-size:14px;color:#5C4F4A;">
            <strong>Email:</strong> ${email}
          </p>
          <p style="margin:0 0 8px;font-size:14px;color:#5C4F4A;">
            <strong>Senha:</strong> ${senha}
          </p>
          <p style="margin:0;font-size:11px;color:#9B8D87;font-style:italic;">
            Você pode alterar sua senha depois de entrar.
          </p>
        </div>

        <!-- Botão -->
        <div style="text-align:center;margin:0 0 32px;">
          <a href="${appUrl}" 
             style="display:inline-block;background:#C9A99A;color:white;text-decoration:none;
                    padding:14px 40px;border-radius:100px;font-size:14px;font-weight:500;
                    letter-spacing:0.05em;">
            entrar no app →
          </a>
        </div>

        <!-- Aviso spam -->
        <div style="background:#E8D5CE;border-radius:10px;padding:16px;text-align:center;margin:0 0 24px;">
          <p style="margin:0;font-size:13px;color:#5C4F4A;line-height:1.6;">
            Guarde este email com seus dados de acesso.<br>
            Se tiver qualquer dúvida, fale comigo pelo WhatsApp:<br>
            <strong>(12) 99668-0446 — Gislaine</strong>
          </p>
        </div>

        <!-- Rodapé -->
        <p style="font-size:12px;color:#A89E97;text-align:center;margin:0;line-height:1.6;">
          com carinho 💛<br>
          <em>Descansa, Mulher!</em>
        </p>

      </div>

      <!-- Faixa rodapé -->
      <div style="height:3px;background:linear-gradient(90deg,#E8D5CE,#C9A99A,#D4B8AE);"></div>
    </div>
    `
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const body = req.body

    // ── Checar se é compra aprovada ──
    const evento = body?.event || body?.data?.event || ''
    const status = body?.data?.purchase?.status || ''

    const eventosOk = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'PURCHASE_CONFIRMED']
    const statusOk  = ['APPROVED', 'COMPLETE', 'CONFIRMED', '']

    if (!eventosOk.includes(evento)) {
      return res.status(200).json({ ok: true, msg: `Evento ignorado: ${evento}` })
    }
    if (status && !statusOk.includes(status)) {
      return res.status(200).json({ ok: true, msg: `Status ignorado: ${status}` })
    }

    // ── Extrair dados da compradora ──
    const buyer = body?.data?.buyer || {}
    const email = buyer.email
    const nome  = buyer.name || ''

    if (!email) {
      return res.status(400).json({ error: 'Email não encontrado no payload' })
    }

    // ── Verificar se já existe ──
    const { data: lista } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const jaExiste = lista?.users?.find(u => u.email === email)
    if (jaExiste) {
      return res.status(200).json({ ok: true, msg: 'Usuária já cadastrada' })
    }

    // ── Criar usuária ──
    const senha = gerarSenha()
    const { data: novaUser, error: errUser } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome }
    })
    if (errUser) throw new Error('Erro ao criar usuária: ' + errUser.message)

    // ── Salvar log ──
    await supabase.from('purchase_log').insert({
      user_id:    novaUser.user.id,
      email,
      nome,
      senha_temp: senha,
      evento,
      created_at: new Date().toISOString()
    })

    // ── Enviar email via Resend ──
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://descansa-mulher.vercel.app'
    const { subject, html } = emailTemplate(nome, email, senha, appUrl)

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Descansa, Mulher! <noreply@descansa-mulher.vercel.app>',
        to: email,
        subject,
        html
      })
    })

    if (!resendRes.ok) {
      const err = await resendRes.text()
      console.error('Erro Resend:', err)
      // Não falha — usuária foi criada, só o email não foi
    }

    return res.status(200).json({ ok: true, email, msg: 'Usuária criada e email enviado!' })

  } catch (err) {
    console.error('Erro webhook:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
