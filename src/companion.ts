import { Data, Goal, dayKey, dosesOn, goalProgress, occurrences } from './domain';

export type FabiScene = 'suggestion' | 'attention' | 'walk' | 'celebrate' | 'rest' | 'read' | 'reminder';
export type Moment = { scene: FabiScene; title: string; body: string };

export function goalScene(goal: Goal): FabiScene {
  if (goal.encouragement === 'firm') return 'attention';
  const title = goal.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/\b(caminhada|caminhar|caminho|caminhadas)\b/.test(title)) return 'walk';
  if (/\b(ler|leitura|livro|livros)\b/.test(title)) return 'read';
  return 'suggestion';
}

// Local, contextual UI only: no new push messages or changes to the agenda.
export function todayMoment(data: Data, now = new Date()): Moment | null {
  const today = dayKey(now);
  const todo = occurrences(data, today).filter(o => !data.done[o.key] && !data.skipped[o.key]);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const soon = todo.find(o => {
    const [h, m] = o.event.start.split(':').map(Number);
    return o.event.mode === 'horario' && h * 60 + m >= minutes && h * 60 + m - minutes <= 30;
  });
  if (soon) return { scene: 'reminder', title: 'Daqui a pouco', body: `${soon.event.title} às ${soon.event.start}. Seu próximo compromisso está chegando.` };
  const achieved = data.goals.find(g => !g.paused && goalProgress(data, g, today) >= g.target && data.activities.some(a => a.goalId === g.id && a.date === today));
  if (achieved) return { scene: 'celebrate', title: 'Uma conquista de hoje!', body: `Você alcançou a meta: ${achieved.title}.` };
  const pendingDose = dosesOn(data, today).some(d => !data.doses[d.key]);
  if (!todo.length && !pendingDose) return { scene: 'rest', title: 'Um respiro para você', body: 'Não há compromissos ou doses pendentes na agenda de hoje. Aproveite uma pausa no seu ritmo.' };
  return null;
}
