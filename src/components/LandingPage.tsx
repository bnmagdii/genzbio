import React, { useState } from 'react';
import { THEMES } from '../lib/themes';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Layers, 
  Compass, 
  ChevronDown, 
  Smartphone, 
  Monitor, 
  Flame, 
  Gamepad2, 
  Music, 
  CheckCircle,
  Eye,
  BarChart4,
  MapPin,
  QrCode
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onViewDemo: (username: string) => void;
}

export default function LandingPage({ onStart, onViewDemo }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<string>('All');

  const faqs = [
    {
      q: "What is GEN-Z BIO?",
      a: "It is the ultimate SaaS index page for Gen-Z creators, influencers, developers, and gamers. Instead of just a list of boring buttons, you can build customizable blocks with countdowns, products, maps, anonymous questions, guestbooks, and embed live feeds!"
    },
    {
      q: "Can I create multiple profiles with one account?",
      a: "Yes! There are absolutely NO LIMITS. You can create different bios for gaming, streetwear e-com stores, programming portfolios, and agency briefs under a single email."
    },
    {
      q: "Are the themes customizable?",
      a: "Totally. Choose from over 50+ prebuilt themes (Cyberpunk, Vaporwave, Minimal Dark, Anime Tokyo) and customize gradients, fonts, music embeds, and block animations in a single click."
    },
    {
      q: "How does the Anonymous Message block work?",
      a: "Vistors can leave direct feedback or ask anonymous questions right on your bio. Read, organize, and respond to submissions straight from your central dashboard! Perfect for TikTok/Instagram story trends."
    },
    {
      q: "Is there built-in analytics tracking?",
      a: "Yes, fully animated custom charts track total clicks, pageviews, referrers, device models, web browsers, and country demographics in real-time."
    }
  ];

  const featuredThemes = THEMES.slice(0, 20);
  const categories = ['All', 'Cosmic', 'Neon', 'Glassmorphism', 'Minimal', 'Retro', 'Gamer'];

  const filteredThemes = selectedThemeCategory === 'All'
    ? featuredThemes
    : featuredThemes.filter(t => t.tags?.includes(selectedThemeCategory));

  return (
    <div className="bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-pink-500 selection:text-white pb-12">
      {/* 1. HERO SECTION */}
      <header className="relative py-24 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/15 blur-[120px] rounded-full -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full -z-10 animate-pulse" />

        {/* Brand Tag */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 text-pink-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm shadow-pink-500/5 hover:border-pink-500/40 hover:bg-pink-500/10 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          The Web Link-In-Bio Marketplace
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6">
          <span className="bg-gradient-to-r from-white via-indigo-100 to-neutral-200 bg-clip-text text-transparent">YOUR PROFILE,</span>
          <br />
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">GEN-Z STYLE.</span>
        </h1>

        {/* Subhead */}
        <p className="max-w-2xl text-base md:text-xl text-zinc-400 leading-relaxed mb-10 px-2 font-medium">
          Create unlimited dynamic profiles with custom themes, QR codes, anonymous message boxes, physical map pins, social feeds, and analytics. Powered by Google Cloud.
        </p>

        {/* Call To Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md px-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:scale-103 active:scale-98 transition-all duration-300 text-white font-black text-sm px-8 py-4.5 rounded-2xl shadow-xl shadow-purple-600/10 hover:shadow-cyan-400/20"
          >
            Create your GEN-Z BIO for free <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onViewDemo('demo')}
            className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm px-8 py-4.5 rounded-2xl transition-all"
          >
            Preview Demo Profile <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Quick stat indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mt-20 w-full text-center">
          {[
            { metric: "UNLIMITED", label: "Creators Bios Pages" },
            { metric: "55+ PRESETS", label: "Marketplace Themes" },
            { metric: "19+ BLOCKS", label: "Products, Music & Q&A" },
            { metric: "REAL-TIME", label: "In-Depth Analytics" }
          ].map((stat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xl md:text-2xl font-black text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{stat.metric}</p>
              <p className="text-xs text-neutral-400 mt-1 font-medium tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* 2. CORE FEATURES */}
      <section className="py-20 px-4 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Packed with Next-Gen Interactive Blocks
          </h2>
          <p className="text-zinc-400 mt-2 max-w-md mx-auto text-sm">
            Everything you need to showcase, sell products, host live Q&A, and grow your digital brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.05] hover:border-purple-500/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">19+ Rich Content Blocks</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Embed custom FAQs, count-down clocks, sound tracks, video showcases, downloadable PDFs, maps, product cards, sliding galleries, and feedback forms smoothly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.05] hover:border-pink-500/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Full-Stack Analytics</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Dynaically view total clicks, page-views, browsers, devices, demographic charts, referral links, and visitor interaction counts right in your feed.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.05] hover:border-cyan-500/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Theme Marketplace</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Choose from 55 distinct styles including neon cyberpunk, liquid frosted glass, pixel arcade, streetwear cargo, luxury brass, manga grids and terminal code.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.05] hover:border-amber-500/ group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Anonymous Q&A Messages</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Invite your followers to leave anonymous confessions or suggestions right on your landing bio and view them safely on your secure dashboard.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.05] hover:border-emerald-500 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-450 mb-6 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Interactive Guestbooks</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Enable guest logs on your page. Visitors can leave nice signatures, and counts are kept in real-time, customizable and secure.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.05] hover:border-blue-500 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Vector QR Code Generator</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Quickly instantiate highly-designed vector QR codes to print on business cards, clothing apparel or place directly on desktop landing overlays.
            </p>
          </div>
        </div>
      </section>

      {/* 3. THEME SHOWCASE */}
      <section className="py-20 bg-black/40 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="text-pink-400 text-xs font-bold tracking-widest uppercase">Select Your Vibe</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-1">
                More Than 50+ Custom presets
              </h2>
            </div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5 mt-6 md:mt-0 bg-white/[0.02] border border-white/[0.04] p-1 rounded-2xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedThemeCategory(cat)}
                  className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    selectedThemeCategory === cat
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredThemes.slice(0, 8).map((theme) => (
              <div 
                key={theme.id}
                className={`p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-56 transition-all duration-300 hover:scale-102 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/[0.05] ${theme.bgClass}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className={`font-black tracking-tight text-lg ${theme.textColor}`}>{theme.name}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-md">
                      {theme.fontFamily.replace('font-', '')}
                    </span>
                  </div>
                </div>

                {/* Sub components list showing button designs inside theme preview */}
                <div className="space-y-2.5 mt-4">
                  <div className={`py-2 px-3 text-xs text-center border font-medium ${theme.btnClass}`}>
                    Link Block Preview
                  </div>
                  <div className={`py-1 px-3 text-[10px] text-center opacity-70 border rounded-full ${theme.btnClass}`}>
                    Follow Me
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ANALYTICS SHOWCASE */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Real-Time Engine</span>
            <h2 className="text-3xl md:text-5xl font-black mt-1 leading-tight text-white">
              SaaS Level Analytics Dashboard
            </h2>
            <p className="text-zinc-400 text-sm mt-4 leading-relaxed font-normal">
              Understand where your audience hails from instantly. See detailed metrics on total hits, link performance, operating systems, devices, and countries in dynamic dashboard graphs.
            </p>

            <ul className="space-y-3.5 mt-8 text-sm">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Geographic country logs tracking global creators reach</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Individual link block and animation performance audit</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Demographic analytics (MacOS, Safari, Firefox, iOS, Linux)</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            {/* Visual Dashboard Card Mock */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] p-6 rounded-3xl shadow-2xl relative">
              <div className="absolute top-[10%] right-[10%] w-[120px] h-[120px] bg-cyan-400/10 rounded-full blur-2xl -z-10" />
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs text-zinc-400 font-bold tracking-wider uppercase">Weekly Traffic Overlook</p>
                  <p className="text-xl font-black text-white mt-1">24,812 views (+14.8%)</p>
                </div>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-1 px-2.5 rounded-full font-bold">
                  +24.2% Growth
                </span>
              </div>

              {/* Weekly Analytics Chart Layout */}
              <div className="h-56 w-full flex items-end gap-3 px-2 border-b border-white/[0.06] pb-2 text-xs font-mono text-zinc-500">
                {[
                  { d: 'Mon', h: 42, color: 'from-purple-600 to-pink-500' },
                  { d: 'Tue', h: 68, color: 'from-pink-500 to-rose-400' },
                  { d: 'Wed', h: 51, color: 'from-rose-400 to-cyan-400' },
                  { d: 'Thu', h: 92, color: 'from-cyan-400 to-purple-600' },
                  { d: 'Fri', h: 75, color: 'from-purple-600 to-pink-600' },
                  { d: 'Sat', h: 86, color: 'from-pink-600 to-rose-500' },
                  { d: 'Sun', h: 100, color: 'from-fuchsia-500 to-cyan-500' },
                ].map((bar, id) => (
                  <div key={id} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative group">
                      <div 
                        style={{ height: `${bar.h}%` }} 
                        className={`w-full rounded-t-lg bg-gradient-to-t ${bar.color} opacity-85 group-hover:opacity-100 transition-all duration-300 relative shadow-lg shadow-pink-500/5`}
                      />
                    </div>
                    <span>{bar.d}</span>
                  </div>
                ))}
              </div>

              {/* Referral list */}
              <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-neutral-300">
                <div className="flex justify-between p-2 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                  <span>instagram.com</span>
                  <span className="font-bold text-white">41.8%</span>
                </div>
                <div className="flex justify-between p-2 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                  <span>tiktok.com</span>
                  <span className="font-bold text-white">35.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-20 bg-black/50 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">Loved by Builders</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-12">
            What Creators Are Saying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                text: "GEN-Z BIO completely changed the game for me. I host my streetwear drop counter, my design references, and have a Spotify playlist playing right in the backdrop. The Cyberpunk theme looks absolutely gorgeous on mobile screens!",
                author: "Sarah Croft (Clothing Designer)",
                handle: "@sarah.zip"
              },
              {
                text: "The unlimited accounts feature is legendary. I manage 5 separate bios under 1 sign-in: my stream schedule, my affiliate keyboard catalog, my anonymous feedback inbox, and contract rates. Highly recommended platforms.",
                author: "Alex Gamer (Twitch Affiliate)",
                handle: "@alexgames.tv"
              },
              {
                text: "Highly polished, elegant UI overlays. The analytics dashboard rivals enterprise panels of paid linktree alternatives, providing direct browser and mobile device stats in beautiful color configurations.",
                author: "Ahmed Bin Ali (Creative Freelancer)",
                handle: "@ahmed_studio"
              }
            ].map((test, index) => (
              <div key={index} className="p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.04] flex flex-col justify-between">
                <p className="text-zinc-300 text-sm leading-relaxed italic">"{test.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-xs">
                    {test.author[0]}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{test.author}</h5>
                    <p className="text-[10px] text-zinc-500 font-medium">{test.handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-24 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Answers for Creators</span>
          <h2 className="text-3xl md:text-5xl font-black mt-1 leading-tight text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, id) => (
            <div 
              key={id}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.01] overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === id ? null : id)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-white/[0.01] transition-colors focus:outline-none cursor-pointer"
              >
                <span className="text-sm font-bold text-zinc-200">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform duration-300 ${activeFaq === id ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  activeFaq === id ? 'max-h-56 opacity-100 border-t border-white/[0.04]' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <p className="p-6 text-xs text-zinc-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="pt-16 pb-8 border-t border-zinc-900 text-center text-zinc-500 max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-black text-white bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">GEN-Z BIO</h3>
        <p className="text-xs text-zinc-400 mt-2">Create the ultimate links gateway for free.</p>
        
        <button
          onClick={onStart}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-103"
        >
          Create your GEN-Z BIO for free <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="my-10 h-[1px] bg-zinc-900" />
        <p className="text-[10px] tracking-wide text-zinc-600">
          © 2026 GEN-Z BIO Platform • Encrypted Cloud Records • Designed for Next-Gen Influencers
        </p>
      </footer>
    </div>
  );
}
