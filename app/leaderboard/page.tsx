import { client } from '@/sanity/lib/client';
import { Trophy, Medal, Award, MapPin, Shield, Zap, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { dataset, projectId } from '@/sanity/env';
import createImageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';

const builder = createImageUrlBuilder({ projectId, dataset });
function urlFor(source: any) { return builder.image(source); }

export const metadata = {
  title: 'Civic Heroes Leaderboard | CivicEye',
  description: 'Honoring the top citizens protecting our cities through reporting and verification.',
};

export const revalidate = 0;

const RANK_COLORS = {
  1: { border: '#ffd700', glow: 'rgba(255,215,0,0.4)', text: '#ffd700', bg: 'rgba(255,215,0,0.08)', label: '🥇' },
  2: { border: '#c0c0c0', glow: 'rgba(192,192,192,0.3)', text: '#c0c0c0', bg: 'rgba(192,192,192,0.06)', label: '🥈' },
  3: { border: '#cd7f32', glow: 'rgba(205,127,50,0.3)', text: '#cd7f32', bg: 'rgba(205,127,50,0.06)', label: '🥉' },
};

function Avatar({ entry, size = 'md' }: { entry: any; size?: 'sm' | 'md' | 'lg' }) {
  const src = entry.avatar ? urlFor(entry.avatar).width(200).url() : `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name}&backgroundColor=0f172a`;
  const sizeClass = size === 'lg' ? 'w-28 h-28' : size === 'md' ? 'w-16 h-16' : 'w-10 h-10';
  return <img src={src} alt={entry.name} className={`${sizeClass} rounded-full object-cover`} />;
}

function StatPill({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f172a] border border-white/10 text-xs font-bold">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

export default async function LeaderboardPage() {
  const [entries, stats] = await Promise.all([
    client.fetch(`*[_type == "userAccount"] | order(score desc) {
      _id, name, score, badge, city, isUser, reportsCount, verifyCount, resolvedCount, avatar, joinedAt
    }`),
    client.fetch(`{
      "totalIssues": count(*[_type == "issue"]),
      "resolvedIssues": count(*[_type == "issue" && status == "Resolved"]),
      "totalCitizens": count(*[_type == "userAccount"]),
      "criticalIssues": count(*[_type == "issue" && triageTier == "Critical"])
    }`)
  ]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-[#020408] text-white pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* ─── Hero ─── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-widest uppercase">
            <Trophy className="w-4 h-4" /> Civic Heroes — Hall of Fame
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
            Leaderboard
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            The city's most dedicated guardians. Earn XP by reporting hazards, verifying issues, and helping resolve civic problems.
          </p>

          {/* XP Guide */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {[
              { color: 'bg-teal-500', label: 'Report Hazard', xp: '+100 XP' },
              { color: 'bg-blue-500', label: 'Verify Issue', xp: '+50 XP' },
              { color: 'bg-emerald-500', label: 'Resolution Confirmed', xp: '+150 XP' },
            ].map(({ color, label, xp }) => (
              <div key={label} className="bg-[#0f172a] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${color} shadow-lg`} />
                <span className="text-xs font-bold text-slate-300">{label}</span>
                <span className={`text-xs font-black ${color.replace('bg-', 'text-')}`}>{xp}</span>
              </div>
            ))}
          </div>

          {/* Live City Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-8 border-t border-white/5">
            {[
              { icon: Zap, label: 'Total Reports', value: stats.totalIssues, color: 'text-yellow-400' },
              { icon: CheckCircle2, label: 'Resolved', value: stats.resolvedIssues, color: 'text-emerald-400' },
              { icon: Users, label: 'Active Heroes', value: stats.totalCitizens, color: 'text-blue-400' },
              { icon: Shield, label: 'Critical Active', value: stats.criticalIssues, color: 'text-red-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Podium (Top 3) ─── */}
        {top3.length > 0 && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6">
            {/* Render order: 2nd, 1st, 3rd on desktop */}
            {[top3[1], top3[0], top3[2]].map((entry, arrIdx) => {
              if (!entry) return null;
              const rank = arrIdx === 1 ? 1 : arrIdx === 0 ? 2 : 3;
              const c = RANK_COLORS[rank as 1 | 2 | 3];
              const isFirst = rank === 1;
              const barHeights = { 1: 'md:h-56', 2: 'md:h-36', 3: 'md:h-28' };
              const avatarSize = isFirst ? 'lg' : 'md';

              return (
                <div key={entry._id}
                  className={`flex flex-col items-center w-full ${isFirst ? 'md:w-60 order-1 md:order-2' : rank === 2 ? 'md:w-48 md:order-1' : 'md:w-48 md:order-3'} group`}
                >
                  {isFirst && (
                    <div className="mb-2">
                      <Award className="w-10 h-10 drop-shadow-lg" style={{ color: c.border, filter: `drop-shadow(0 0 12px ${c.border})` }} />
                    </div>
                  )}
                  <div className="relative mb-4 transition-transform duration-300 group-hover:-translate-y-3">
                    <div className={`rounded-full overflow-hidden`} style={{ border: `4px solid ${c.border}`, boxShadow: `0 0 30px ${c.glow}` }}>
                      <Avatar entry={entry} size={avatarSize} />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-black border-4 border-[#020408] text-sm" style={{ background: c.border, color: '#020408' }}>
                      {rank}
                    </div>
                  </div>

                  <div className="text-center mb-3">
                    <h3 className={`font-black ${isFirst ? 'text-xl' : 'text-lg'}`} style={{ color: c.text }}>{entry.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-0.5">{entry.badge}</p>
                    {entry.city && (
                      <p className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />{entry.city}
                      </p>
                    )}
                  </div>

                  {/* Podium bar */}
                  <div className={`w-full h-20 ${barHeights[rank as 1|2|3]} rounded-t-2xl border border-b-0 flex flex-col items-center pt-4 transition-all`}
                    style={{ background: `linear-gradient(to top, #020408, ${c.bg})`, borderColor: `${c.border}40` }}>
                    <span className="font-black text-2xl" style={{ color: c.text }}>{entry.score?.toLocaleString()}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">XP</span>
                    <div className="flex gap-2 mt-2">
                      {entry.reportsCount !== undefined && <span className="text-[9px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">{entry.reportsCount || 0}R</span>}
                      {entry.verifyCount !== undefined && <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{entry.verifyCount || 0}V</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Rank Table (#4 onwards) ─── */}
        {rest.length > 0 && (
          <div className="bg-[#0a0f1c]/80 backdrop-blur-xl rounded-3xl border border-white/[0.07] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-3 p-4 border-b border-white/5 bg-[#1e293b]/30 text-[10px] font-bold uppercase tracking-widest text-slate-500 items-center">
              <div className="text-center">Rank</div>
              <div>Citizen</div>
              <div className="hidden sm:block">City</div>
              <div className="text-right pr-3">Civic XP</div>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {rest.map((entry: any, i: number) => {
                const rank = i + 4;
                return (
                  <div key={entry._id} className={`grid grid-cols-[3rem_1fr_auto_auto] gap-3 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors ${entry.isUser ? 'bg-teal-500/5 border-l-2 border-teal-500' : ''}`}>
                    <div className="text-center font-mono text-slate-500 font-bold text-sm">#{rank}</div>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden border border-white/10 flex-shrink-0">
                        <Avatar entry={entry} size="sm" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">
                          {entry.name}
                          {entry.isUser && <span className="ml-2 text-[9px] bg-teal-500 text-black px-1.5 py-0.5 rounded-full uppercase tracking-widest align-middle">You</span>}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          {entry.badge && <span className="text-[9px] text-slate-500 border border-white/10 px-1.5 py-0.5 rounded-full bg-slate-800/50">{entry.badge}</span>}
                          {entry.reportsCount !== undefined && <span className="text-[9px] text-teal-500">{entry.reportsCount || 0} reports</span>}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
                      {entry.city && <><MapPin className="w-3 h-3" />{entry.city}</>}
                    </div>

                    <div className="text-right pr-3">
                      <span className="font-mono font-black text-teal-400 text-base">{entry.score?.toLocaleString()}</span>
                      <span className="text-[9px] text-slate-600 ml-1">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold">No heroes yet. Be the first to report a hazard!</p>
            <Link href="/report" className="mt-4 inline-block bg-teal-500 text-black font-black px-6 py-2 rounded-xl text-sm hover:bg-teal-400 transition-all">
              Submit First Report →
            </Link>
          </div>
        )}

        {/* Google Branding */}
        <div className="text-center pt-8 border-t border-white/5">
          <p className="text-slate-600 text-xs">
            XP rankings powered by <span className="text-teal-400 font-bold">CivicEye AI</span> · Built with{' '}
            <span className="text-blue-400 font-bold">Google Gemini 2.5 Flash</span> · Data stored in{' '}
            <span className="text-purple-400 font-bold">Sanity CMS</span>
          </p>
        </div>

      </div>
    </div>
  );
}
