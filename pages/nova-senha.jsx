import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function NovaSenha() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handleSalvar = async () => {
    if (!senha || senha.length < 6) {
      setMsg({ type: 'erro', text: 'A senha precisa ter pelo menos 6 caracteres.' })
      return
    }
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) setMsg({ type: 'erro', text: 'Erro ao salvar. Tente novamente.' })
    else {
      setMsg({ type: 'ok', text: 'Senha atualizada! Redirecionando...' })
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <>
      <Head><title>Nova Senha — Descansa, Mulher!</title></Head>
      <div style={{
        minHeight: '100vh', background: 'var(--bege)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
      }}>
        <div style={{
          background: 'var(--branco)', borderRadius: '24px', padding: '2.5rem 2rem',
          width: '100%', maxWidth: '380px',
          boxShadow: '0 4px 30px rgba(180,140,130,0.12)', position: 'relative'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, var(--rose-claro), var(--rose), var(--nude))',
            borderRadius: '24px 24px 0 0'
          }} />

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 300, color: 'var(--texto)', marginBottom: '.3rem' }}>
              Nova senha
            </div>
            <div style={{ fontSize: '.75rem', color: 'var(--cinza)', letterSpacing: '.15em', textTransform: 'uppercase' }}>
              escolha uma senha nova
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
            <div>
              <label style={{ fontSize: '.7rem', color: 'var(--cinza)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.3rem' }}>Nova senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSalvar()}
                  placeholder="mínimo 6 caracteres"
                  style={{
                    width: '100%', background: 'var(--bege)',
                    border: '1.5px solid var(--bege-escuro)', borderRadius: '12px',
                    padding: '.75rem 3rem .75rem 1rem',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '.88rem',
                    color: 'var(--texto)', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button
                  onClick={() => setShowSenha(v => !v)}
                  style={{
                    position: 'absolute', right: '.9rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--cinza)'
                  }}
                >
                  {showSenha ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

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

            <button
              onClick={handleSalvar}
              disabled={loading}
              style={{
                width: '100%', padding: '.9rem',
                background: loading ? 'var(--nude)' : 'var(--rose)',
                color: 'white', border: 'none', borderRadius: '100px',
                fontFamily: "'DM Sans', sans-serif", fontSize: '.88rem',
                fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'salvando...' : 'salvar nova senha'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
