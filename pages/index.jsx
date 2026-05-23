import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

// ── DADOS ──────────────────────────────────────────────────
const DAILY_MESSAGES = [
  { msg: 'Você não precisa resolver tudo hoje.', sub: 'Sua mente é um jardim, não uma lista de tarefas. Cuide dela com gentileza.' },
  { msg: 'Sua mente merece descanso também.', sub: 'Não é fraqueza desacelerar. É sabedoria.' },
  { msg: 'Respira. Vamos organizar uma coisa por vez.', sub: 'O caos parece maior quando tentamos encarar tudo de uma vez.' },
  { msg: 'Você não está atrasada. Está sobrecarregada.', sub: 'Existe diferença. E ela muda tudo.' },
  { msg: 'Você não precisa carregar tudo sozinha.', sub: 'Pedir ajuda é um ato de coragem, não de fraqueza.' },
  { msg: 'Organização não precisa machucar.', sub: 'Ser leve não é ser irresponsável. É ser humana.' },
  { msg: 'Uma coisa por vez. Isso é suficiente.', sub: 'Você já está fazendo mais do que imagina.' },
]

const PI_RESPONSES = {
  tarefas: { msg: 'Você não é uma máquina. Ter muitas tarefas não é falha sua.', action: '✨ Mini ação: Pegue sua lista e risque tudo que pode esperar 48h. O que sobrar é sua lista real de hoje.' },
  culpa:   { msg: 'A culpa que você sente é o peso de alguém que se importa demais.', action: '✨ Mini ação: Escreva 1 coisa que você fez bem hoje. Só uma. Qualquer uma.' },
  trabalho:{ msg: 'O trabalho ocupa espaço demais quando a mente não tem para onde escapar.', action: '✨ Mini ação: Escolha um horário de hoje para parar. Coloque no celular.' },
  casa:    { msg: 'A casa nunca vai estar perfeita. E tudo bem. Você não é responsável por tudo.', action: '✨ Mini ação: Escolha uma tarefa da casa para delegar ou adiar. Só uma.' },
  ansiedade:{ msg: 'A ansiedade mente. Ela faz tudo parecer mais urgente e mais pesado do que é.', action: '✨ Mini ação: Inspire por 4 segundos. Segure por 4. Solte em 6. Repita 5 vezes.' },
  outros:  { msg: 'Você não é responsável pelas expectativas que os outros criam sobre você.', action: '✨ Mini ação: Hoje, pratique: "Não consigo agora." Sem explicação longa.' },
  tempo:   { msg: 'Quando não há tempo para você, tudo fica mais pesado. Isso não é egoísmo.', action: '✨ Mini ação: Reserve 10 minutos só seus hoje. Sem tela, sem tarefa.' },
  cansaco: { msg: 'Cansaço mental é real e precisa ser respeitado tanto quanto o físico.', action: '✨ Mini ação: Cancele uma coisa que não é essencial hoje. Isso é descanso, não preguiça.' },
}

const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const DAY_FULL  = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
const EMOJIS    = ['✨','💡','🏠','🌸','💼','🎯','📚','🛒','💛','🌿','⭐','🎨','💪','🧘','🍀','🔑','💌','🎁','🌙','🦋']

function dateKey(d) {
  return d.toISOString().split('T')[0]
}

// ── COMPONENTES PEQUENOS ────────────────────────────────────

function Tabs({ active, onChange }) {
  const items = [
    { id: 'home',       icon: '🏠', label: 'Início' },
    { id: 'mente',      icon: '🧠', label: 'Mente' },
    { id: 'semana',     icon: '📅', label: 'Semana' },
    { id: 'listas',     icon: '📁', label: 'Listas' },
    { id: 'prioridades',icon: '💛', label: 'Energia' },
  ]
  return (
    <div className="tabs">
      {items.map(t => (
        <button key={t.id} className={`tab${active === t.id ? ' active' : ''}`} onClick={() => onChange(t.id)}>
          <span className="tabIcon">{t.icon}</span>
          <span className="tabLabel">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── TELA: HOME ──────────────────────────────────────────────
function HomeScreen({ onNav, onOpenRitual }) {
  const [msgIdx, setMsgIdx] = useState(() => Math.floor(Math.random() * DAILY_MESSAGES.length))
  const [dateStr, setDateStr] = useState('')
  const m = DAILY_MESSAGES[msgIdx]

  useEffect(() => {
    const now = new Date()
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
    setDateStr(`${DAY_NAMES[now.getDay()]} · ${now.getDate()} de ${months[now.getMonth()]}`)
  }, [])

  return (
    <div>
      <div className="header">
        <div className="headerLogo">Descansa, Mulher!</div>
        <div className="headerDate">{dateStr}</div>
      </div>

      <div className="emotionalCard fadeSection">
        <div className="ecLabel">mensagem do dia</div>
        <div className="ecMessage">{m.msg}</div>
        <div className="ecSub">{m.sub}</div>
        <button className="ecRefresh" onClick={() => setMsgIdx(i => (i + 1) % DAILY_MESSAGES.length)}>↻</button>
      </div>

      <div className="section">
        <div className="sectionTitle">por onde começar</div>
        <div className="quickGrid">
          <button className="quickBtn" onClick={() => onNav('mente')}>
            <div className="qbIcon">🧠</div>
            <div className="qbTitle">Descarregar pensamentos</div>
            <div className="qbSub">tirar o peso da cabeça</div>
          </button>
          <button className="quickBtn" onClick={() => onNav('semana')}>
            <div className="qbIcon">📅</div>
            <div className="qbTitle">Minha semana</div>
            <div className="qbSub">rotina e tarefas do dia</div>
          </button>
          <button className="quickBtn" onClick={() => onNav('noturno')}>
            <div className="qbIcon">🌙</div>
            <div className="qbTitle">Fechar o dia</div>
            <div className="qbSub">dormir mais tranquila</div>
          </button>
          <button className="quickBtn" onClick={() => onNav('prioridades')}>
            <div className="qbIcon">💛</div>
            <div className="qbTitle">O que drenou você?</div>
            <div className="qbSub">cuidado personalizado</div>
          </button>
          <button className="quickBtn quickBtnWide" onClick={onOpenRitual}>
            <div className="qbIcon">✨</div>
            <div>
              <div className="qbTitle">Ritual anti-sobrecarga</div>
              <div className="qbSub">5 minutos para respirar de novo</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── TELA: MINHA MENTE ───────────────────────────────────────
function MenteScreen({ user }) {
  const [text, setText] = useState('')
  const [entries, setEntries] = useState([])

  useEffect(() => {
    if (!user) return
    supabase.from('mind_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEntries(data.map(e => ({
          id: e.id, text: e.text,
          time: new Date(e.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
            ' · ' + new Date(e.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        })))
      })
  }, [user])

  const save = async () => {
    if (!text.trim()) return
    const { data, error } = await supabase.from('mind_entries').insert({ user_id: user.id, text: text.trim() }).select().single()
    if (!error && data) {
      const now = new Date(data.created_at)
      const time = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' · ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      setEntries(prev => [{ id: data.id, text: data.text, time }, ...prev])
      setText('')
    }
  }

  const del = async (id) => {
    await supabase.from('mind_entries').delete().eq('id', id).eq('user_id', user.id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div>
      <div className="header"><div className="headerLogo">Minha Mente</div></div>
      <div className="mindArea fadeSection">
        <p className="mindIntro">Jogue aqui tudo que está na sua cabeça.<br />Sem julgamento, sem filtro.</p>
        <textarea
          className="mindTextarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="tô sacuda de tudo... minha chefe, as contas, a casa..."
        />
        <p className="mindHint">Escreva livremente. Isso fica só aqui, pra você. 💛</p>
        <button className="mindBtn" onClick={save}>guardar este momento</button>
        {entries.length > 0 && (
          <div className="mindSavedList">
            <div className="mindSavedLabel">guardado por você</div>
            {entries.map(e => (
              <div key={e.id} className="mindSavedItem">
                <button className="mindSavedDel" onClick={() => del(e.id)}>×</button>
                <div className="mindSavedText">{e.text}</div>
                <div className="mindSavedTime">{e.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── TELA: SEMANA ────────────────────────────────────────────
function SemanaScreen({ user }) {
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [fixedTasks, setFixedTasks]   = useState([])
  const [doneFixed, setDoneFixed]     = useState({})
  const [pontual, setPontual]         = useState({})
  const [showFixed, setShowFixed]     = useState(false)
  const [showPontual, setShowPontual] = useState(false)
  const [fixedText, setFixedText]     = useState('')
  const [fixedDays, setFixedDays]     = useState([new Date().getDay()])
  const [pontualText, setPontualText] = useState('')

  // Carregar tarefas fixas do Supabase
  useEffect(() => {
    if (!user) return
    supabase.from('fixed_tasks').select('*').eq('user_id', user.id).order('created_at')
      .then(({ data }) => {
        if (data) setFixedTasks(data.map(t => ({ ...t, days: t.days.split(',').map(Number) })))
      })
  }, [user])

  // Carregar pontuais e dones do dia selecionado
  useEffect(() => {
    if (!user) return
    const dk = dateKey(selectedDay)
    supabase.from('pontual_tasks').select('*').eq('user_id', user.id).eq('date_key', dk)
      .then(({ data }) => {
        if (data) setPontual(prev => ({ ...prev, [dk]: data.map(t => ({ id: t.id, text: t.text, done: t.done })) }))
      })
    supabase.from('fixed_task_done').select('fixed_task_id').eq('user_id', user.id).eq('date_key', dk)
      .then(({ data }) => {
        if (data) setDoneFixed(prev => ({ ...prev, [dk]: data.map(d => d.fixed_task_id) }))
      })
  }, [user, selectedDay])

  // Gerar 14 dias (semana atual + próxima)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + i)
    return d
  })

  const dk = dateKey(selectedDay)
  const today = new Date()
  const isToday = selectedDay.toDateString() === today.toDateString()
  const dow = selectedDay.getDay()
  const relevantFixed = fixedTasks.filter(t => t.days.includes(dow))
  const doneTodayIds  = doneFixed[dk] || []
  const pontualToday  = pontual[dk] || []

  const toggleDay = (i) => setFixedDays(prev =>
    prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
  )

  const saveFixed = async () => {
    if (!fixedText.trim() || fixedDays.length === 0) return
    const daysStr = fixedDays.join(',')
    const { data, error } = await supabase.from('fixed_tasks').insert({ user_id: user.id, text: fixedText.trim(), days: daysStr }).select().single()
    if (!error && data) {
      setFixedTasks(prev => [...prev, { ...data, days: data.days.split(',').map(Number) }])
      setFixedText(''); setFixedDays([dow]); setShowFixed(false)
    }
  }

  const toggleFixed = async (id) => {
    const arr = doneFixed[dk] || []
    const isDone = arr.includes(id)
    if (isDone) {
      await supabase.from('fixed_task_done').delete().eq('user_id', user.id).eq('fixed_task_id', id).eq('date_key', dk)
      setDoneFixed(prev => ({ ...prev, [dk]: arr.filter(x => x !== id) }))
    } else {
      await supabase.from('fixed_task_done').insert({ user_id: user.id, fixed_task_id: id, date_key: dk })
      setDoneFixed(prev => ({ ...prev, [dk]: [...arr, id] }))
    }
  }

  const savePontual = async () => {
    if (!pontualText.trim()) return
    const { data, error } = await supabase.from('pontual_tasks').insert({ user_id: user.id, text: pontualText.trim(), date_key: dk, done: false }).select().single()
    if (!error && data) {
      setPontual(prev => ({ ...prev, [dk]: [...(prev[dk] || []), { id: data.id, text: data.text, done: false }] }))
      setPontualText(''); setShowPontual(false)
    }
  }

  const togglePontual = async (id) => {
    const task = (pontual[dk] || []).find(t => t.id === id)
    if (!task) return
    await supabase.from('pontual_tasks').update({ done: !task.done }).eq('id', id).eq('user_id', user.id)
    setPontual(prev => ({ ...prev, [dk]: (prev[dk] || []).map(t => t.id === id ? { ...t, done: !t.done } : t) }))
  }

  const delPontual = async (id) => {
    await supabase.from('pontual_tasks').delete().eq('id', id).eq('user_id', user.id)
    setPontual(prev => ({ ...prev, [dk]: (prev[dk] || []).filter(t => t.id !== id) }))
  }

  return (
    <div>
      <div className="weekHeader">
        <div className="weekTitle">📅 Semana</div>
        <div className="weekDays">
          {days.map((d, i) => {
            const isTd = d.toDateString() === today.toDateString()
            const isSel = d.toDateString() === selectedDay.toDateString()
            return (
              <button key={i} className={`dayPill${isSel ? ' active' : ''}`} onClick={() => setSelectedDay(new Date(d))}>
                {isTd ? '• ' : ''}{DAY_NAMES[d.getDay()]} {d.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      <div className="weekDayLabel">
        <div className="wdlName">{DAY_FULL[dow]}</div>
        <div className="wdlSub">{isToday ? 'hoje' : selectedDay.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</div>
      </div>

      {/* ROTINA SEMANAL */}
      <div className="weekSection">
        <div className="wsHead">
          <div className="wsTitle">🔄 rotina semanal</div>
          <button className="wsAddBtn" onClick={() => setShowFixed(v => !v)}>+ tarefa fixa</button>
        </div>

        {showFixed && (
          <div className="fixedForm">
            <input
              value={fixedText}
              onChange={e => setFixedText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveFixed()}
              placeholder="tarefa que se repete..."
              autoFocus
            />
            <div className="ffLabel">repetir nos dias:</div>
            <div className="daysSelector">
              {DAY_NAMES.map((n, i) => (
                <button key={i} className={`dsDay${fixedDays.includes(i) ? ' selected' : ''}`} onClick={() => toggleDay(i)}>{n}</button>
              ))}
            </div>
            <div className="ffActions">
              <button className="ffCancel" onClick={() => setShowFixed(false)}>×</button>
              <button className="ffSave" onClick={saveFixed}>salvar</button>
            </div>
          </div>
        )}

        {relevantFixed.length === 0
          ? <p className="emptyMsg">Nenhuma tarefa fixa para este dia.</p>
          : relevantFixed.map(t => (
            <div key={t.id} className={`weekTask${doneTodayIds.includes(t.id) ? ' done' : ''}`}>
              <div className="wtCheck" onClick={() => toggleFixed(t.id)}>✓</div>
              <div className="wtBody">
                <div className="wtText">{t.text}</div>
                <div className="wtDays">{t.days.map(i => DAY_NAMES[i]).join(' · ')}</div>
              </div>
              <button className="wtDel" onClick={async () => {
                await supabase.from('fixed_tasks').delete().eq('id', t.id).eq('user_id', user.id)
                setFixedTasks(prev => prev.filter(x => x.id !== t.id))
              }}>×</button>
            </div>
          ))
        }
      </div>

      {/* TAREFAS DO DIA */}
      <div className="weekSection">
        <div className="wsHead">
          <div className="wsTitle">📌 tarefas do dia</div>
          <button className="wsAddBtn" onClick={() => setShowPontual(v => !v)}>+ pontual</button>
        </div>

        {showPontual && (
          <div className="pontualForm">
            <input
              value={pontualText}
              onChange={e => setPontualText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && savePontual()}
              placeholder="tarefa de hoje..."
              autoFocus
            />
            <button onClick={savePontual}>salvar</button>
          </div>
        )}

        {pontualToday.length === 0
          ? <p className="emptyMsg">Nenhuma tarefa pontual para este dia.</p>
          : pontualToday.map(t => (
            <div key={t.id} className={`weekTask${t.done ? ' done' : ''}`}>
              <div className="wtCheck" onClick={() => togglePontual(t.id)}>✓</div>
              <div className="wtBody"><div className="wtText">{t.text}</div></div>
              <button className="wtDel" onClick={() => delPontual(t.id)}>×</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── TELA: LISTAS ────────────────────────────────────────────
function ListasScreen({ user }) {
  const [cats, setCats]         = useState([])
  const [openCat, setOpenCat]   = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('categories').select('*, category_items(*)').eq('user_id', user.id).order('created_at')
      .then(({ data }) => {
        if (data) setCats(data.map(c => ({ ...c, items: (c.category_items || []).map(i => ({ ...i, done: !!i.done })) })))
      })
  }, [user])
  const [newName, setNewName]   = useState('')
  const [newEmoji, setNewEmoji] = useState('✨')
  const [showEmoji, setShowEmoji] = useState(false)
  const [itemText, setItemText] = useState('')
  const inputRef = useRef(null)

  const totalItems   = cats.reduce((s, c) => s + c.items.length, 0)
  const doneItems    = cats.reduce((s, c) => s + c.items.filter(i => i.done).length, 0)
  const progressPct  = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  const saveCat = async () => {
    if (!newName.trim()) return
    const { data, error } = await supabase.from('categories').insert({ user_id: user.id, icon: newEmoji, name: newName.trim() }).select().single()
    if (!error && data) {
      setCats(prev => [...prev, { ...data, items: [] }])
      setNewName(''); setNewEmoji('✨'); setShowForm(false); setShowEmoji(false)
    }
  }

  const deleteCat = async (id) => {
    if (!confirm('Apagar esta lista?')) return
    await supabase.from('categories').delete().eq('id', id).eq('user_id', user.id)
    setCats(prev => prev.filter(c => c.id !== id))
    setOpenCat(null)
  }

  const addItem = async () => {
    if (!itemText.trim() || !openCat) return
    const { data, error } = await supabase.from('category_items').insert({ user_id: user.id, category_id: openCat.id, text: itemText.trim(), done: false }).select().single()
    if (!error && data) {
      setCats(prev => prev.map(c => c.id === openCat.id ? { ...c, items: [{ ...data, done: false }, ...c.items] } : c))
      setItemText('')
    }
  }

  const toggleItem = async (catId, itemId) => {
    const cat = cats.find(c => c.id === catId)
    const item = cat?.items.find(i => i.id === itemId)
    if (!item) return
    await supabase.from('category_items').update({ done: !item.done }).eq('id', itemId).eq('user_id', user.id)
    setCats(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) } : c))
  }

  const deleteItem = async (catId, itemId) => {
    await supabase.from('category_items').delete().eq('id', itemId).eq('user_id', user.id)
    setCats(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c))
  }

  // Sincronizar openCat quando cats mudar
  useEffect(() => {
    if (openCat) setOpenCat(cats.find(c => c.id === openCat.id) || null)
  }, [cats])

  useEffect(() => {
    if (openCat) setTimeout(() => inputRef.current?.focus(), 200)
  }, [openCat])

  if (openCat) {
    const cat = cats.find(c => c.id === openCat.id) || openCat
    return (
      <div>
        <div className="cdHeader">
          <button className="cdBack" onClick={() => setOpenCat(null)}>←</button>
          <div className="cdIcon">{cat.icon}</div>
          <div className="cdName">{cat.name}</div>
          <button className="cdDelCat" onClick={() => deleteCat(cat.id)}>🗑</button>
        </div>
        <div className="cdAdd">
          <input
            ref={inputRef}
            value={itemText}
            onChange={e => setItemText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="adicionar item..."
          />
          <button onClick={addItem}>+</button>
        </div>
        <div className="cdItems">
          {cat.items.length === 0
            ? <div className="cdEmpty">Nenhum item ainda.<br />Adicione o que não quer esquecer. 💛</div>
            : cat.items.map(item => (
              <div key={item.id} className={`cdItem${item.done ? ' done' : ''}`}>
                <div className="cdCheck" onClick={() => toggleItem(cat.id, item.id)}>✓</div>
                <div className="cdItemText">{item.text}</div>
                <button className="cdItemDel" onClick={() => deleteItem(cat.id, item.id)}>×</button>
              </div>
            ))
          }
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="listsHeader">
        <div className="listsTop">
          <div className="listsTitle">Minhas Listas</div>
        </div>
        <div className="listsSub">ideias e pendências para não esquecer</div>
      </div>

      <div className="listsProgress">
        <div className="lpTop">
          <div className="lpLabel">progresso geral</div>
          <div className="lpCount">{doneItems} de {totalItems} feitos</div>
        </div>
        <div className="lpBar"><div className="lpFill" style={{ width: progressPct + '%' }} /></div>
      </div>

      <div className="catGrid">
        {cats.map(c => {
          const pending = c.items.filter(i => !i.done).length
          return (
            <button key={c.id} className="catCard" onClick={() => setOpenCat(c)}>
              <div className="catCardIcon">{c.icon}</div>
              <div className="catCardName">{c.name}</div>
              <div className={`catCardCount${pending === 0 ? ' zero' : ''}`}>
                {pending === 0 ? 'tudo feito ✓' : `${pending} pendente${pending > 1 ? 's' : ''}`}
              </div>
            </button>
          )
        })}

        {showForm ? (
          <div className="newCatForm">
            <div className="ncfRow">
              <div className="ncfEmoji" onClick={() => setShowEmoji(v => !v)}>{newEmoji}</div>
              <input
                className="ncfInput"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveCat()}
                placeholder="nome da lista..."
                autoFocus
              />
            </div>
            {showEmoji && (
              <div className="emojiPicker">
                {EMOJIS.map(e => (
                  <span key={e} className="epOpt" onClick={() => { setNewEmoji(e); setShowEmoji(false) }}>{e}</span>
                ))}
              </div>
            )}
            <div className="ncfActions">
              <button className="ncfSave" onClick={saveCat}>criar</button>
              <button className="ncfCancel" onClick={() => { setShowForm(false); setShowEmoji(false) }}>cancelar</button>
            </div>
          </div>
        ) : (
          <button className="catAddBtn" onClick={() => setShowForm(true)}>＋ nova lista</button>
        )}
      </div>
    </div>
  )
}

// ── TELA: NOTURNO ───────────────────────────────────────────
function NoturnoScreen() {
  const items = [
    { title: 'Descarreguei minhas preocupações', desc: 'Escrevi ou pensei no que estava me pesando' },
    { title: 'Fechei as tarefas mentais', desc: 'O que não resolvi hoje, fica para amanhã' },
    { title: 'Organizei o amanhã levemente', desc: 'Só 1 ou 2 coisas essenciais para o dia seguinte' },
    { title: 'Me dei crédito por hoje', desc: 'Reconheci o que fiz, mesmo que pareça pouco' },
    { title: 'Respirei fundo três vezes', desc: 'Sinal para o corpo: é hora de descansar' },
  ]
  const [checked, setChecked] = useState([])
  const toggle = (i) => setChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  const allDone = checked.length === items.length

  return (
    <div>
      <div className="header"><div className="headerLogo">Fechar o Dia</div></div>
      <div className="nightHeader fadeSection">
        <div className="nightMoon">🌙</div>
        <div className="nightTitle">Cabeça Limpa Antes de Dormir</div>
        <div className="nightSub">Marque cada passo. Seu cérebro merece descanso.</div>
      </div>
      <div className="nightChecklist">
        {items.map((item, i) => (
          <div key={i} className={`nightItem${checked.includes(i) ? ' checked' : ''}`} onClick={() => toggle(i)}>
            <div className="niCheck">✓</div>
            <div>
              <div className="niTitle">{item.title}</div>
              <div className="niDesc">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {allDone && (
        <div className="nightClosing fadeSection">
          "Você fez o suficiente.<br />Agora é hora de descansar."<br /><br />
          <span style={{ fontSize: '1.4rem' }}>🌸</span>
        </div>
      )}
    </div>
  )
}

// ── TELA: PRIORIDADES ───────────────────────────────────────
function PrioridadesScreen() {
  const [selected, setSelected] = useState(null)
  const opts = [
    { id: 'tarefas',   icon: '📋', label: 'Excesso de tarefas' },
    { id: 'culpa',     icon: '💭', label: 'Culpa' },
    { id: 'trabalho',  icon: '💼', label: 'Trabalho' },
    { id: 'casa',      icon: '🏠', label: 'Casa' },
    { id: 'ansiedade', icon: '🌊', label: 'Ansiedade' },
    { id: 'outros',    icon: '👥', label: 'Cobrança dos outros' },
    { id: 'tempo',     icon: '⏳', label: 'Falta de tempo pra mim' },
    { id: 'cansaco',   icon: '🪫', label: 'Cansaço mental' },
  ]
  const r = selected ? PI_RESPONSES[selected] : null

  return (
    <div>
      <div className="header"><div className="headerLogo">Prioridades Invisíveis</div></div>
      <p className="piIntro fadeSection">O que mais drenou sua energia hoje?</p>
      <div className="piGrid">
        {opts.map(o => (
          <button key={o.id} className={`piOption${selected === o.id ? ' selected' : ''}`} onClick={() => setSelected(o.id)}>
            <div className="piOptionIcon">{o.icon}</div>
            <div className="piOptionText">{o.label}</div>
          </button>
        ))}
      </div>
      {r && (
        <div className="piResponse fadeSection">
          <div className="piResponseLabel">para você agora</div>
          <div className="piResponseMsg">{r.msg}</div>
          <div className="piResponseAction">{r.action}</div>
        </div>
      )}
    </div>
  )
}

// ── MODAL RITUAL ────────────────────────────────────────────
function RitualModal({ onClose }) {
  const steps = [
    { title: 'Respira por 4 segundos', desc: 'Inspire pelo nariz contando até 4. Segure por 4. Solte pela boca em 4. Repita 3 vezes.' },
    { title: 'Escreva o que está sufocando', desc: 'Sem filtro. Só 3 linhas. O que está mais pesando agora?' },
    { title: 'Escolha UMA coisa que realmente importa hoje', desc: 'Apenas uma. O resto pode esperar.' },
    { title: 'Remova o excesso mental', desc: 'Risque mentalmente tudo que não é urgente. Dê permissão para deixar pra depois.' },
    { title: 'Diga em voz baixa', desc: '"Eu não preciso carregar tudo. Posso fazer uma coisa por vez."' },
  ]
  const [done, setDone] = useState([])
  const toggle = (i) => setDone(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  return (
    <div className="modalOverlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modalSheet">
        <div className="modalHandle" />
        <button className="modalClose" onClick={onClose}>×</button>
        <div className="modalTitle">Ritual Anti-Sobrecarga</div>
        <div className="modalSub">5 passos. 5 minutos. Uma mente mais leve.</div>
        {steps.map((s, i) => (
          <div key={i} className={`ritualStep${done.includes(i) ? ' done' : ''}`} onClick={() => toggle(i)}>
            <div className="ritualNum">{i + 1}</div>
            <div>
              <div className="ritualStepTitle">{s.title}</div>
              <div className="ritualStepDesc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── APP PRINCIPAL ───────────────────────────────────────────
export default function Home() {
  const router = useRouter()
  const [user, setUser]             = useState(null)
  const [checking, setChecking]     = useState(true)
  const [entered, setEntered]       = useState(false)
  const [hiding, setHiding]         = useState(false)
  const [tab, setTab]               = useState('home')
  const [showRitual, setShowRitual] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setChecking(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const enter = () => {
    setHiding(true)
    setTimeout(() => setEntered(true), 800)
  }

  const goTab = (name) => {
    setTab(name)
    window.scrollTo(0, 0)
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', background: 'var(--bege)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="breathDot" />
    </div>
  )

  return (
    <>
      <Head>
        <title>Descansa, Mulher!</title>
        <meta name="description" content="Você merece descansar. Comece agora." />
      </Head>

      {!entered && (
        <div className={`splash${hiding ? ' hide' : ''}`}>
          <div className="breathDot" />
          <div className="splashLogo">Descansa, Mulher!</div>
          <div className="splashSub">você merece descansar</div>
          <div className="splashLine" />
          <div className="splashBreath">respira. você chegou ao lugar certo.</div>
          <button className="splashEnter" onClick={enter}>entrar com leveza →</button>
        </div>
      )}

      {entered && (
        <div className="app">
          {tab === 'home'        && <HomeScreen onNav={goTab} onOpenRitual={() => setShowRitual(true)} onLogout={handleLogout} />}
          {tab === 'mente'       && <MenteScreen user={user} />}
          {tab === 'semana'      && <SemanaScreen user={user} />}
          {tab === 'listas'      && <ListasScreen user={user} />}
          {tab === 'noturno'     && <NoturnoScreen />}
          {tab === 'prioridades' && <PrioridadesScreen />}
          <Tabs active={tab} onChange={goTab} />
          {showRitual && <RitualModal onClose={() => setShowRitual(false)} />}
        </div>
      )}
    </>
  )
}
