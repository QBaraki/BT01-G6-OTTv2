const $=id=>document.getElementById(id);
const format=x=>JSON.stringify(x,null,2);
async function refresh(){await refreshBots();try{const r=await fetch('/api/logs');$('logs').textContent=format(await r.json());}catch(e){$('logs').textContent=String(e);}}
$('file').addEventListener('change',async()=>{const f=$('file').files[0];if(!f)return;if(f.size>65536){$('result').textContent='File vượt quá 64 KiB';return;}$('source').value=await f.text();});
$('submit').addEventListener('submit',async e=>{e.preventDefault();$('result').textContent='Đang kiểm tra...';try{const r=await fetch('/api/scripts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('name').value,source:$('source').value})});$('result').textContent=format(await r.json());await refresh();}catch(error){$('result').textContent=String(error);}});
$('refresh').addEventListener('click',refresh);refresh();

async function refreshBots(){
 try{const r=await fetch('/api/scripts');const data=await r.json();
  for(const id of ['botA','botB']){
   const select=$(id),current=select.value;select.replaceChildren();
   for(const bot of data.scripts){const o=document.createElement('option');o.value=bot.id;o.textContent=`${bot.name} (${bot.id.slice(0,8)})`;select.append(o);}
   if(data.scripts.some(b=>b.id===current))select.value=current;
  }
  if(data.scripts.length>1 && $('botA').value===$('botB').value)$('botB').selectedIndex=1;
 }catch(e){$('matchResult').textContent=String(e)}
}
$('fight').addEventListener('click',async()=>{
 $('matchResult').textContent='Đang đấu...';
 try{const r=await fetch('/api/matches',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({botA:$('botA').value,botB:$('botB').value,maxTurns:60})});
 $('matchResult').textContent=format(await r.json());await refresh();
 }catch(e){$('matchResult').textContent=String(e)}
});
