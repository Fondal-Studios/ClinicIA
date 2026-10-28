const form=document.querySelector('#recovery-form'),status=document.querySelector('#status');
form.addEventListener('submit',async e=>{
 e.preventDefault();const data=Object.fromEntries(new FormData(form));
 if(data.password!==data.confirmation){status.textContent='Las contraseñas no coinciden.';return;}
 const button=form.querySelector('button');button.disabled=true;status.textContent='Guardando tu nueva contraseña…';
 try{
  const response=await fetch('/api/account/recover',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:data.username,recoveryCode:data.recoveryCode.trim(),password:data.password}),signal:AbortSignal.timeout(90000)});
  let result;try{result=await response.json();}catch{throw new Error('El servidor está iniciando. Esperá un momento y volvé a intentar.');}
  if(!response.ok)throw new Error(result.error||'No se pudo recuperar el acceso.');
  form.reset();form.hidden=true;document.querySelector('#success').hidden=false;
  document.querySelector('#new-code').textContent=result.recoveryCode;
  document.querySelector('#role').textContent=`Usuario: ${result.user.username} · Rol: ${result.user.role==='admin'?'Administrador':'Alumno'}`;
  status.textContent='Contraseña actualizada. Tu sesión está iniciada.';
 }catch(error){status.textContent=error.name==='TimeoutError'?'El servidor tardó en responder. Probá ingresar con tu nueva contraseña antes de repetir la recuperación.':error.message;}
 finally{button.disabled=false;}
});
