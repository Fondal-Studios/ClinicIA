import { courses, catalog } from './courses.mjs';
export { courses, catalog } from './courses.mjs';
export const categories = {
 idiomas:{label:'Idiomas',emoji:'🗣️'},ciencias:{label:'Ciencias',emoji:'🔬'},salud:{label:'Salud',emoji:'🫀'},historia:{label:'Historia',emoji:'🏛️'},sociedad:{label:'Sociedad',emoji:'🌍'},
 matematicas:{label:'Matemáticas',emoji:'➗'},tecnologia:{label:'Tecnología',emoji:'💻'},finanzas:{label:'Finanzas',emoji:'💰'},arte:{label:'Arte',emoji:'🎨'},vida:{label:'Vida práctica',emoji:'🌿'}
};
export const XP_PER_ANSWER = 10, XP_PERFECT_BONUS = 10, XP_REPLAY_PER_ANSWER = 3, XP_REVIEW_PER_ANSWER = 5, MAX_XP = 1_000_000;
/** XP de una lección: 10 por acierto (+10 si fue perfecta) la primera vez; poco al repetirla, para no inflar el puntaje. */
export function lessonXp(correct, total, first) {
 if (!(total > 0) || correct < 0 || correct > total) return 0;
 return first ? correct * XP_PER_ANSWER + (correct === total ? XP_PERFECT_BONUS : 0) : correct * XP_REPLAY_PER_ANSWER;
}
export const lessonMaxXp = (lessons) => lessons.reduce((n, l) => n + (l.questions.length + 1) * XP_PER_ANSWER + XP_PERFECT_BONUS, 0);
export const getCourse = (id, list = courses) => list.find(c => c.id === id);
export const initialState = () => ({version:2,minutes:10,progress:{},days:[],mistakes:[],xp:0,current:null,onboarded:false,daily:{day:'',minutes:0}});
export const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const completedCount = (state, id) => state.progress[id] || 0;
export const totalCompleted = (state) => Object.values(state.progress).reduce((a,b)=>a+b,0);
export function normalizeState(value, list = courses) {
 const s = initialState();
 if (!value || typeof value !== 'object') return s;
 let progress = value.progress;
 if (value.version === 1) progress = {'aprender-a-aprender':(Array.isArray(value.completed)?value.completed:[]).filter((x,i)=>x===i).length}; // migración v1 → v2
 else if (value.version !== 2) return s;
 s.minutes = [5,10,15,20].includes(value.minutes) ? value.minutes : 10;
 for (const c of list) {
  const n = progress && typeof progress === 'object' ? progress[c.id] : 0;
  if (Number.isInteger(n) && n > 0) s.progress[c.id] = Math.min(n, c.lessons.length);
 }
 s.days = [...new Set((Array.isArray(value.days)?value.days:[]).filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)))];
 s.mistakes = [...new Set((Array.isArray(value.mistakes)?value.mistakes:[]).filter(x=>typeof x==='string'&&parseMistake(x,list)))];
 s.current = typeof value.current === 'string' && getCourse(value.current, list) ? value.current : null;
 const xp = value.version === 1 ? totalCompleted(s) * 30 : value.xp;
 s.xp = Number.isInteger(xp) && xp >= 0 ? Math.min(xp, MAX_XP) : totalCompleted(s) * 30;
 const d = value.daily;
 if (d && typeof d.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.day) && Number.isInteger(d.minutes) && d.minutes >= 0) s.daily = {day:d.day, minutes:Math.min(d.minutes, 600)};
 s.onboarded = value.onboarded === true || totalCompleted(s) > 0; // quien ya estudió no necesita bienvenida
 return s;
}
export const mistakeId = (courseId, li, qi) => `${courseId}:${li}:${qi}`;
export function parseMistake(id, list = courses) {
 const m = /^([a-z0-9-]+):(\d+):(\d+)$/.exec(id);
 if (!m) return null;
 const course = getCourse(m[1], list), li = Number(m[2]), qi = Number(m[3]);
 return course?.lessons[li]?.questions[qi] ? {course, li, qi, question:course.lessons[li].questions[qi]} : null;
}
export function completeLesson(state, courseId, index, date = new Date(), list = courses, result = null) {
 const course = getCourse(courseId, list);
 if (!course || !Number.isInteger(index) || index < 0 || index >= course.lessons.length || index > completedCount(state, courseId)) return state;
 const first = index >= completedCount(state, courseId), lesson = course.lessons[index];
 const total = result?.total ?? lesson.questions.length, correct = result?.correct ?? total;
 const progress = {...state.progress, [courseId]: Math.max(completedCount(state, courseId), index + 1)};
 const next = {...state, progress, current:courseId, xp:Math.min(MAX_XP, state.xp + lessonXp(correct, total, first)), days:[...new Set([...state.days, dayKey(date)])]};
 return addMinutes(next, lesson.minutes, date);
}
export function dailyMinutes(state, date = new Date()) {return state.daily?.day === dayKey(date) ? state.daily.minutes : 0;}
export function addMinutes(state, minutes, date = new Date()) {return {...state, daily:{day:dayKey(date), minutes:Math.min(600, dailyMinutes(state, date) + minutes)}};}
export const reviewAnswer = (state) => ({...state, xp:Math.min(MAX_XP, state.xp + XP_REVIEW_PER_ANSWER)});
export function completeReview(state, date = new Date()) {
 return addMinutes({...state, days:[...new Set([...state.days, dayKey(date)])]}, 2, date);
}
export function searchCourses(list, query, category) {
 const q = query.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
 const flat = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
 return list.filter(c => (!category || c.category === category) && (!q || flat(c.title + ' ' + c.summary).includes(q)));
}
export function streak(days, date = new Date()) {
 const cursor = new Date(date); cursor.setHours(12,0,0,0);
 const set = new Set(days);
 if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate()-1);
 let count = 0;
 while (set.has(dayKey(cursor))) {count++; cursor.setDate(cursor.getDate()-1);}
 return count;
}

/** Semana actual (lunes a domingo) con los días estudiados, para el calendario de racha. */
export function weekDays(days, date = new Date()) {
 const set = new Set(days), base = new Date(date); base.setHours(12,0,0,0);
 base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
 return ['L','M','M','J','V','S','D'].map((label, i) => {
  const d = new Date(base); d.setDate(base.getDate() + i);
  return {label, key:dayKey(d), done:set.has(dayKey(d)), today:dayKey(d) === dayKey(date)};
 });
}
export const MILESTONES = [3, 7, 14, 30, 100];
export const milestone = (n) => MILESTONES.includes(n) ? n : 0;
/** Ideas cortas para leer: oraciones del texto de la lección. */
export function splitIdeas(body) {
 const parts = body.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean), out = [];
 for (const p of parts) (out.length && out.at(-1).length < 55 ? out.push(out.pop() + ' ' + p) : out.push(p));
 return out;
}
/** Reto de ordenar: una explicación corta (5 a 12 palabras) de la propia lección, con las palabras mezcladas de forma estable. */
export function orderChallenge(lesson) {
 for (const q of lesson.questions) {
  const first = q.why.split(/(?<=[.!?])\s+/)[0].trim(), words = first.split(/\s+/);
  if (words.length < 5 || words.length > 12 || /^(verdadero|falso)/i.test(first)) continue;
  const order = words.map((_, i) => i).sort((a, b) => ((a * 7 + words.length * 3) % 11) - ((b * 7 + words.length * 3) % 11) || a - b);
  if (order.every((v, i) => v === i)) order.push(order.shift());
  return {sentence:words.join(' '), words:order.map((i) => words[i])};
 }
 return null;
}
export const popularIds = ['ingles-basico','finanzas-personales','python','inteligencia-artificial','cocina-basica','historia-del-arte','tecnicas-de-estudio','sistema-solar'];
export const suggested = (list = catalog, n = 4) => popularIds.map((id) => getCourse(id, list)).filter(Boolean).slice(0, n);
export const startedCourses = (state, list = courses) => list.filter((c) => completedCount(state, c.id) > 0 || c.id === state.current).sort((a, b) => (b.id === state.current) - (a.id === state.current));
export function mistakeGroups(state, list = courses) {
 const g = new Map();
 for (const m of state.mistakes) {const p = parseMistake(m, list); if (p) g.set(p.course.title, (g.get(p.course.title) || 0) + 1);}
 return [...g].map(([title, n]) => ({title, n}));
}

