const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Small, escaped presentation layer. No model HTML or arbitrary Markdown links are executed.
export function formatTutorText(value){
 const text=String(value).replace(/\\text\{([^{}]*)\}/g,'$1').replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1) / ($2)').replace(/\\[\[\]()]/g,'').replace(/\\[;,]/g,' ').replace(/\\%/g,'%');
 return escape(text).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
}
