import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Copy, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';

const tools = [
  {id:'seo-article',label:'SEO Article Writer',description:'Outline H2/H3 and SEO-ready English blog draft'},
  {id:'affiliate-copy',label:'Amazon Affiliate Product Copy',description:'Product copy using verified details only'},
  {id:'meta-alt',label:'SEO Meta & Image Alt',description:'Title, description and accessible alt text'},
  {id:'seo-audit',label:'SEO Content Audit',description:'Concrete SEO issues and suggested fixes'},
  {id:'keyword-calendar',label:'Keyword & Content Calendar',description:'Four-week editorial plan by search intent'},
  {id:'social-email',label:'Blog to Social & Email',description:'Facebook, Zalo, Instagram and newsletter'},
  {id:'ga4-weekly',label:'GA4 Weekly Report',description:'Analyze pasted GA4 export; never invent visits'}
] as const;
type Kind = typeof tools[number]['id'];
export const AdminAIStudioPage: React.FC = () => {
  const [kind,setKind] = useState<Kind>('seo-article');
  const [topic,setTopic] = useState('');
  const [keywords,setKeywords] = useState('');
  const [source,setSource] = useState('');
  const [notes,setNotes] = useState('');
  const [output,setOutput] = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const needsSource = ['affiliate-copy','seo-audit','social-email','ga4-weekly'].includes(kind);
  const run = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setOutput(''); setLoading(true);
    try {
      const result = await adminApi.generateAI({kind,topic,keywords,source,notes});
      setOutput(result.output);
    } catch (e) {
      setError(axios.isAxiosError(e) ? (e.response?.data?.message || e.message) : 'Generation failed. Try again.');
    } finally {setLoading(false);}
  };
  return <div className="space-y-6">
    <div><h1 className="font-serif text-3xl font-bold text-gray-900 flex items-center gap-2"><Sparkles className="text-lotus-clay" /> VietCraft AI Studio</h1>
      <p className="text-sm text-gray-500 mt-2">Seven AI writing and analytics assistants for your CMS. Review results before publishing.</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-1">
        {tools.map(t=><button key={t.id} type="button" onClick={()=>{setKind(t.id);setOutput('');setError('');}} className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${kind===t.id?'bg-lotus-sand/30 text-lotus-forest':'hover:bg-gray-50'}`}>
          <span className="block font-semibold text-sm">{t.label}</span><span className="block text-xs text-gray-500 mt-1">{t.description}</span>
        </button>)}
      </div>
      <div className="lg:col-span-2 space-y-5">
        <form onSubmit={run} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold">{tools.find(t=>t.id===kind)?.label}</h2>
          <label className="block text-sm font-semibold">Topic / task
            <input required minLength={3} maxLength={500} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Vietnamese bamboo home decor" className="block mt-1 w-full rounded-lg border border-gray-300 p-3 font-normal" /></label>
          <label className="block text-sm font-semibold">Main / supporting keywords (optional)
            <input value={keywords} maxLength={1000} onChange={e=>setKeywords(e.target.value)} placeholder="e.g. handmade bamboo decor" className="block mt-1 w-full rounded-lg border border-gray-300 p-3 font-normal" /></label>
          <label className="block text-sm font-semibold">{kind==='ga4-weekly'?'GA4 export / metrics':kind==='affiliate-copy'?'Verified Amazon product facts':'Article / product facts / source text'} {needsSource?'(required)':'(optional)'}
            <textarea required={needsSource} maxLength={18000} rows={7} value={source} onChange={e=>setSource(e.target.value)} placeholder={kind==='ga4-weekly'?'Paste CSV metrics from GA4, including date ranges':kind==='affiliate-copy'?'Paste verified name, material, features and optional affiliate URL; never rely on a URL alone':'Paste original content or verified product information'} className="block mt-1 w-full rounded-lg border border-gray-300 p-3 font-normal"/></label>
          <label className="block text-sm font-semibold">Additional instructions (optional)
            <textarea rows={2} maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)} className="block mt-1 w-full rounded-lg border border-gray-300 p-3 font-normal"/></label>
          <button disabled={loading} type="submit" className="bg-lotus-forest text-white rounded-lg px-5 py-3 font-semibold disabled:opacity-60">{loading?'Generating…':'Generate with AI'}</button>
          <p className="text-xs text-gray-500">English output. AI requires an API key configured on the server. GA4 requires real exported data.</p>
          {error && <p role="alert" className="text-red-700 text-sm flex items-center gap-2"><AlertCircle size={16}/>{error}</p>}
        </form>
        {output && <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center"><h2 className="font-semibold">Generated draft</h2><button type="button" onClick={()=>navigator.clipboard.writeText(output)} className="flex items-center gap-1 text-sm underline"><Copy size={15}/> Copy</button></div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">{output}</pre>
        </section>}
      </div>
    </div>
  </div>;
};
