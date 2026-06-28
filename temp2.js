const fs = require('fs');
let code = fs.readFileSync('components/AiHelpDesk.tsx', 'utf-8');

// 1. Add attachment state & types
const stateCode = `  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<{ base64: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);`;
code = code.replace("  const [input, setInput] = useState('');", stateCode);

// 2. Add functions for handling file & paste
const funcs = `  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({ base64: reader.result as string, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('pdf') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            setAttachment({ base64: reader.result as string, mimeType: blob.type });
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() && !attachment) return;

    const userMessage: any = { role: 'user', content: text.trim() };
    if (attachment) {
      userMessage.attachment = attachment;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const payloadMessages = messages.concat([userMessage]).map(msg => {
        return {
          role: msg.role,
          content: msg.content,
          attachment: (msg as any).attachment
        }
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages })
      });`;

code = code.replace(/  const handleSend = async \([\s\S]*?body: JSON.stringify\(\{ messages: \[\.\.\.messages, userMessage\] \}\)\n      \}\);/, funcs);

// 3. Update Input Area UI to show preview and handle paste
const inputAreaOld = `      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="relative flex items-center bg-[#020408] border border-white/10 rounded-xl focus-within:border-teal-500/50 focus-within:shadow-[0_0_15px_rgba(20,184,166,0.1)] transition-all overflow-hidden">
          <button className="p-3 text-slate-500 hover:text-teal-400 transition-colors"><Paperclip className="w-5 h-5" /></button>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}`;

const inputAreaNew = `      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-[#0f172a]/80 backdrop-blur-md">
        {attachment && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-teal-500/30 bg-[#020408]">
               {attachment.mimeType.includes('image') ? (
                 <img src={attachment.base64} alt="upload" className="object-cover w-full h-full" />
               ) : (
                 <div className="flex items-center justify-center w-full h-full text-xs text-teal-400 font-bold">PDF</div>
               )}
            </div>
            <button onClick={() => setAttachment(null)} className="text-red-400 text-xs hover:text-red-300">Remove</button>
          </div>
        )}
        <div className="relative flex items-center bg-[#020408] border border-white/10 rounded-xl focus-within:border-teal-500/50 focus-within:shadow-[0_0_15px_rgba(20,184,166,0.1)] transition-all overflow-hidden">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-500 hover:text-teal-400 transition-colors"><Paperclip className="w-5 h-5" /></button>
          <textarea 
            value={input}
            onPaste={handlePaste}
            onChange={(e) => setInput(e.target.value)}`;

code = code.replace(inputAreaOld, inputAreaNew);

// 4. Also render image inside chat messages
const msgRenderOld = `                 <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-teal-400 prose-strong:text-white">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>`;

const msgRenderNew = `                 {(msg as any).attachment && (
                    <div className="mb-3 max-w-[200px] rounded-lg overflow-hidden border border-white/10">
                       {(msg as any).attachment.mimeType.includes('image') ? (
                         <img src={(msg as any).attachment.base64} alt="attachment" className="w-full h-auto" />
                       ) : (
                         <div className="bg-[#020408] p-4 text-xs font-mono text-teal-400 border border-teal-500/20">Attached Document (PDF)</div>
                       )}
                    </div>
                 )}
                 <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-teal-400 prose-strong:text-white">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>`;

code = code.replace(msgRenderOld, msgRenderNew);

fs.writeFileSync('components/AiHelpDesk.tsx', code);
console.log('SUCCESS');
