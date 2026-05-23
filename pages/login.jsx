import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // login | cadastro | recuperar
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'ok'|'erro', text }

  const handleLogin = async () => {
    if (!email || !senha) { setMsg({ type: 'erro', text: 'Preencha email e senha.' }); return }
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setMsg({ type: 'erro', text: 'Email ou senha incorretos.' })
    else router.push('/')
    setLoading(false)
  }

  const handleCadastro = async () => {
    if (!email || !senha) { setMsg({ type: 'erro', text: 'Preencha email e senha.' }); return }
    if (senha.length < 6) { setMsg({ type: 'erro', text: 'A senha precisa ter pelo menos 6 caracteres.' }); return }
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signUp({ email, password: senha })
    if (error) setMsg({ type: 'erro', text: 'Erro ao criar conta. Tente outro email.' })
    else setMsg({ type: 'ok', text: 'Conta criada! Verifique seu email para confirmar.' })
    setLoading(false)
  }

  const handleRecuperar = async () => {
    if (!email) { setMsg({ type: 'erro', text: 'Digite seu email.' }); return }
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`
    })
    if (error) setMsg({ type: 'erro', text: 'Erro ao enviar email. Tente novamente.' })
    else setMsg({ type: 'ok', text: 'Email enviado! Verifique sua caixa de entrada.' })
    setLoading(false)
  }

  const handleSubmit = () => {
    if (mode === 'login') handleLogin()
    else if (mode === 'cadastro') handleCadastro()
    else handleRecuperar()
  }

  return (
    <>
      <Head><title>Descansa, Mulher!</title></Head>
      <div style={{
        minHeight: '100vh', background: 'var(--bege)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem'
      }}>
        <div style={{
          background: 'var(--branco)', borderRadius: '24px',
          padding: '2.5rem 2rem', width: '100%', maxWidth: '380px',
          boxShadow: '0 4px 30px rgba(180,140,130,0.12)', position: 'relative'
        }}>
          {/* Barra topo */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, var(--rose-claro), var(--rose), var(--nude))',
            borderRadius: '24px 24px 0 0'
          }} />

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.8rem', fontWeight: 300, color: 'var(--texto)', marginBottom: '.3rem'
            }}>Descansa, Mulher!</div>
            <div style={{ fontSize: '.75rem', color: 'var(--cinza)', letterSpacing: '.15em', textTransform: 'uppercase' }}>
              {mode === 'login' && 'bem-vinda de volta'}
              {mode === 'cadastro' && 'crie sua conta'}
              {mode === 'recuperar' && 'recuperar senha'}
            </div>
          </div>

          {/* Campos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
            <div>
              <label style={{ fontSize: '.7rem', color: 'var(--cinza)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.3rem' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="seu@email.com"
                style={{
                  width: '100%', background: 'var(--bege)',
                  border: '1.5px solid var(--bege-escuro)', borderRadius: '12px',
                  padding: '.75rem 1rem', fontFamily: "'DM Sans', sans-serif",
                  fontSize: '.88rem', color: 'var(--texto)', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {mode !== 'recuperar' && (
              <div>
                <label style={{ fontSize: '.7rem', color: 'var(--cinza)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.3rem' }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="••••••••"
                    style={{
                      width: '100%', background: 'var(--bege)',
                      border: '1.5px solid var(--bege-escuro)', borderRadius: '12px',
                      padding: '.75rem 3rem .75rem 1rem',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '.88rem', color: 'var(--texto)', outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {/* Olhinho */}
                  <button
                    onClick={() => setShowSenha(v => !v)}
                    style={{
                      position: 'absolute', right: '.9rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                      color: 'var(--cinza)', padding: '.2rem'
                    }}
                    title={showSenha ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showSenha ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            {/* Mensagem de erro/ok */}
            {msg && (
              <div style={{
                padding: '.75rem 1rem', borderRadius: '10px', fontSize: '.8rem',
                background: msg.type === 'ok' ? '#F0FAF4' : '#FDF0F0',
                color: msg.type === 'ok' ? '#4A7C59' : '#B87A7A',
                border: `1px solid ${msg.type === 'ok' ? '#C0E0CC' : '#E8C0C0'}`
              }}>
                {msg.text}
              </div>
            )}

            {/* Botão principal */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '.9rem',
                background: loading ? 'var(--nude)' : 'var(--rose)',
                color: 'white', border: 'none', borderRadius: '100px',
                fontFamily: "'DM Sans', sans-serif", fontSize: '.88rem',
                fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background .3s', marginTop: '.3rem'
              }}
            >
              {loading ? 'aguarda...' : (
                mode === 'login' ? 'entrar' :
                mode === 'cadastro' ? 'criar conta' : 'enviar email'
              )}
            </button>
          </div>

          {/* Links */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.6rem' }}>
            {mode === 'login' && (<>
              <button onClick={() => { setMode('recuperar'); setMsg(null) }} style={{ background: 'none', border: 'none', fontSize: '.78rem', color: 'var(--cinza)', cursor: 'pointer', textDecoration: 'underline' }}>
                esqueci minha senha
              </button>
              <button onClick={() => { setMode('cadastro'); setMsg(null) }} style={{ background: 'none', border: 'none', fontSize: '.78rem', color: 'var(--rose)', cursor: 'pointer' }}>
                não tenho conta — criar agora
              </button>
            </>)}
            {mode === 'cadastro' && (
              <button onClick={() => { setMode('login'); setMsg(null) }} style={{ background: 'none', border: 'none', fontSize: '.78rem', color: 'var(--cinza)', cursor: 'pointer' }}>
                já tenho conta — entrar
              </button>
            )}
            {mode === 'recuperar' && (
              <button onClick={() => { setMode('login'); setMsg(null) }} style={{ background: 'none', border: 'none', fontSize: '.78rem', color: 'var(--cinza)', cursor: 'pointer' }}>
                ← voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
