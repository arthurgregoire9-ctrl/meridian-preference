import { useState, useRef, useEffect } from "react"

const DIETS = ["Vegan","Vegetarian","Halal","Kosher","Keto","Gluten-free","Lactose-free","Paleo","No Pork"]
const CUISINES = ["Japanese","Italian","French","Mediterranean","Asian","American","Mexican","Indian","Greek","Levantine"]

function App() {
  const [activeTab, setActiveTab] = useState('guest')
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '')
  const [guestName, setGuestName] = useState('')
  const [allergyInput, setAllergyInput] = useState('')
  const [dislikeInput, setDislikeInput] = useState('')
  const [allergies, setAllergies] = useState([])
  const [dislikes, setDislikes] = useState([])
  const [selectedDiets, setSelectedDiets] = useState([])
  const [selectedCuisines, setSelectedCuisines] = useState([])
  const [favorites, setFavorites] = useState('')
  const [notes, setNotes] = useState('')
  const [guestSubmitted, setGuestSubmitted] = useState(false)
  const [guestPrefs, setGuestPrefs] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const chatBoxRef = useRef(null)

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
  }, [messages])

  const addTag = (type) => {
    if (type === 'allergy') {
      const val = allergyInput.trim()
      if (val && !allergies.includes(val)) setAllergies([...allergies, val])
      setAllergyInput('')
    } else {
      const val = dislikeInput.trim()
      if (val && !dislikes.includes(val)) setDislikes([...dislikes, val])
      setDislikeInput('')
    }
  }

  const removeTag = (type, val) => {
    if (type === 'allergy') setAllergies(allergies.filter(a => a !== val))
    else setDislikes(dislikes.filter(d => d !== val))
  }

  const toggleChip = (type, item) => {
    if (type === 'diet') setSelectedDiets(prev => prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item])
    else setSelectedCuisines(prev => prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item])
  }

  const submitGuest = () => {
    const prefs = { name: guestName, allergies: [...allergies], dislikes: [...dislikes], diets: [...selectedDiets], cuisines: [...selectedCuisines], favorites, notes }
    setGuestPrefs(prefs)
    setGuestSubmitted(true)
  }

  const buildSystem = () => {
    if (!guestPrefs) return "You are the private chef assistant aboard an ultra-luxury superyacht. No guest preferences have been recorded yet. Respond in English, be concise and impeccably professional."
    const p = guestPrefs
    return [
      "You are the private chef assistant aboard an ultra-luxury superyacht. Analyse every dish idea proposed by the crew strictly against the guest's preferences. Respond in English, concisely and with the highest level of professionalism.",
      "=== GUEST PROFILE" + (p.name ? ": " + p.name : "") + " ===",
      p.allergies.length ? "⚠️ CRITICAL ALLERGIES: " + p.allergies.join(", ") : "",
      p.dislikes.length  ? "❌ Dislikes: " + p.dislikes.join(", ") : "",
      p.diets.length     ? "🌿 Dietary requirements: " + p.diets.join(", ") : "",
      p.cuisines.length  ? "🍽️ Preferred cuisines: " + p.cuisines.join(", ") : "",
      p.favorites        ? "⭐ Favourite dishes: " + p.favorites : "",
      p.notes            ? "📝 Notes: " + p.notes : "",
      "FORMAT: Always open with a verdict in brackets: [✅ APPROVED], [❌ NOT RECOMMENDED] or [⚠️ ADJUST]. Then 2–3 sentences maximum. Suggest an alternative when relevant."
    ].filter(Boolean).join("\n")
  }

  const sendMsg = async (preset) => {
    if (isLoading) return
    const text = preset || chatInput.trim()
    if (!text) return
    setChatInput('')
    const updatedHistory = [...chatHistory, { role: "user", content: text }]
    setChatHistory(updatedHistory)
    setMessages(prev => [...prev, { role: 'user', text }])
    setIsLoading(true)
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, system: buildSystem(), messages: updatedHistory })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const reply = (data.content || []).map(b => b.text || "").join("")
      setChatHistory(prev => [...prev, { role: "assistant", content: reply }])
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch(e) {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ ' + e.message }])
    }
    setIsLoading(false)
  }

  const getVerdict = (text) => {
    if (text.includes('[✅')) return { cls: 'green', label: '✅ Approved' }
    if (text.includes('[❌')) return { cls: 'red', label: '❌ Not Recommended' }
    if (text.includes('[⚠️')) return { cls: 'yellow', label: '⚠️ Adjust' }
    return null
  }

  const cleanText = (text) => text.replace(/\[✅ APPROVED\]|\[❌ NOT RECOMMENDED\]|\[⚠️ ADJUST\]/g, '').trim()

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <nav>
        <div className="brand">Meridian<span>·</span>Preference</div>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <input
            type="password"
            placeholder="API Key"
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); localStorage.setItem('apiKey', e.target.value) }}
            style={{padding:'6px 10px',fontSize:'12px',borderRadius:'2px',border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.1)',color:'#fff',outline:'none',width:'180px'}}
          />
          <div className="tabs">
            <button className={`tab ${activeTab==='guest'?'active':''}`} onClick={() => setActiveTab('guest')}>Guest</button>
            <button className={`tab ${activeTab==='crew'?'active':''}`} onClick={() => setActiveTab('crew')}>Crew</button>
          </div>
        </div>
      </nav>

      <main>
        {activeTab === 'guest' && (
          <div>
            <div className="page-header">
              <h1>Your <em>culinary</em><br/>preferences</h1>
              <p>This information allows our private chef to personalise every dining experience exclusively for you.</p>
            </div>
            {!guestSubmitted ? (
              <div>
                <div className="section">
                  <div className="section-label">Personal Details</div>
                  <div className="field">
                    <label>First name</label>
                    <input placeholder="e.g. Alexandra" value={guestName} onChange={e => setGuestName(e.target.value)}/>
                  </div>
                </div>
                <div className="section">
                  <div className="section-label">Allergies &amp; Intolerances</div>
                  <div className="tag-row">
                    <input placeholder="e.g. Nuts, Shellfish, Lactose…" value={allergyInput} onChange={e => setAllergyInput(e.target.value)} onKeyDown={e => e.key==='Enter' && addTag('allergy')}/>
                    <button className="btn-add" onClick={() => addTag('allergy')}>+</button>
                  </div>
                  <div className="tags">{allergies.map(v => <span key={v} className="tag danger">{v}<button onClick={() => removeTag('allergy',v)}>×</button></span>)}</div>
                </div>
                <div className="section">
                  <div className="section-label">Disliked Ingredients</div>
                  <div className="tag-row">
                    <input placeholder="e.g. Coriander, Liver, Pineapple…" value={dislikeInput} onChange={e => setDislikeInput(e.target.value)} onKeyDown={e => e.key==='Enter' && addTag('dislike')}/>
                    <button className="btn-add" onClick={() => addTag('dislike')}>+</button>
                  </div>
                  <div className="tags">{dislikes.map(v => <span key={v} className="tag dislike">{v}<button onClick={() => removeTag('dislike',v)}>×</button></span>)}</div>
                </div>
                <div className="section">
                  <div className="section-label">Dietary Requirements</div>
                  <div className="chips">{DIETS.map(item => <span key={item} className={`chip ${selectedDiets.includes(item)?'on':''}`} onClick={() => toggleChip('diet',item)}>{item}</span>)}</div>
                </div>
                <div className="section">
                  <div className="section-label">Preferred Cuisines</div>
                  <div className="chips">{CUISINES.map(item => <span key={item} className={`chip ${selectedCuisines.includes(item)?'on':''}`} onClick={() => toggleChip('cuisine',item)}>{item}</span>)}</div>
                </div>
                <div className="section">
                  <div className="section-label">Favourite Dishes &amp; Flavours</div>
                  <div className="field"><textarea placeholder="e.g. I love fresh sashimi, hand-made pasta, anything with black truffle…" value={favorites} onChange={e => setFavorites(e.target.value)}/></div>
                </div>
                <div className="section">
                  <div className="section-label">Additional Notes</div>
                  <div className="field"><textarea placeholder="e.g. I prefer lighter meals at lunch, no red meat in the evening…" value={notes} onChange={e => setNotes(e.target.value)}/></div>
                </div>
                <button className="btn-primary" onClick={submitGuest}>Submit preferences to the crew</button>
              </div>
            ) : (
              <div className="success">
                <div className="success-ico">✓</div>
                <div>
                  <h3>{guestPrefs?.name ? `Thank you, ${guestPrefs.name}.` : 'Thank you.'}</h3>
                  <p>Your preferences have been transmitted to the crew. Our private chef will ensure every meal is tailored precisely to your taste throughout your time on board.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'crew' && (
          <div>
            <div className="page-header">
              <h1>Chef's <em>Assistant</em></h1>
              <p>Propose a dish — the AI instantly verifies compatibility with the guest's profile.</p>
            </div>
            <div className="crew-wrap">
              <div className="guest-card">
                <h3>Guest Profile</h3>
                {!guestPrefs ? (
                  <div className="no-guest">
                    <div className="ico">👤</div>
                    <p>No guest profile on file.<br/>Please ask the guest to complete the preference form.</p>
                  </div>
                ) : (
                  <div>
                    {guestPrefs.name && <div className="guest-name">{guestPrefs.name}</div>}
                    {guestPrefs.allergies.length > 0 && <div className="pg"><div className="pg-label">⚠️ Allergies</div><div className="badges">{guestPrefs.allergies.map(a => <span key={a} className="badge allergy">{a}</span>)}</div></div>}
                    {guestPrefs.dislikes.length > 0 && <div className="pg"><div className="pg-label">Avoids</div><div className="badges">{guestPrefs.dislikes.map(d => <span key={d} className="badge dislike">{d}</span>)}</div></div>}
                    {guestPrefs.diets.length > 0 && <div className="pg"><div className="pg-label">Diet</div><div className="badges">{guestPrefs.diets.map(d => <span key={d} className="badge">{d}</span>)}</div></div>}
                    {guestPrefs.cuisines.length > 0 && <div className="pg"><div className="pg-label">Cuisines</div><div className="badges">{guestPrefs.cuisines.map(c => <span key={c} className="badge">{c}</span>)}</div></div>}
                    {guestPrefs.favorites && <div className="pg"><div className="pg-label">Favourites</div><div style={{fontSize:'12px',color:'var(--muted)',lineHeight:1.5}}>{guestPrefs.favorites}</div></div>}
                  </div>
                )}
              </div>
              <div className="chat-panel">
                <div className="chat-msgs" ref={chatBoxRef}>
                  {messages.length === 0 && (
                    <div className="chat-welcome">
                      <div className="ico">🍽️</div>
                      <h3>Good evening, Chef</h3>
                      <p>Propose a dish or menu idea — I will verify its suitability against the guest's preferences.</p>
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const verdict = msg.role==='ai' ? getVerdict(msg.text) : null
                    return (
                      <div key={i} className={`msg ${msg.role}`}>
                        <div className="avatar">{msg.role==='user' ? '👨‍🍳' : '🤖'}</div>
                        <div className="bubble">
                          {verdict && <div className={`verdict ${verdict.cls}`}>{verdict.label}</div>}
                          <div>{msg.role==='ai' ? cleanText(msg.text) : msg.text}</div>
                        </div>
                      </div>
                    )
                  })}
                  {isLoading && (
                    <div className="msg ai">
                      <div className="avatar">🤖</div>
                      <div className="bubble"><div className="typing"><span></span><span></span><span></span></div></div>
                    </div>
                  )}
                </div>
                <div className="chat-input-row">
                  <input placeholder="e.g. Tuna tartare with avocado as a starter?" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMsg()}/>
                  <button className="send-btn" disabled={isLoading} onClick={() => sendMsg()}>↑</button>
                </div>
                <div className="suggestions">
                  {["Tuna tartare with avocado?","Truffle risotto tonight?","Cheese selection for dessert?","Prime rib for tomorrow's lunch?"].map(s => (
                    <button key={s} className="sug" onClick={() => sendMsg(s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export default App