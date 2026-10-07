const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const K='ssuk2',START='2026-10-01',SIM0='2026-10-07',DOW='일월화수목금토';
const pad=n=>String(n).padStart(2,'0'),esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const dt=s=>new Date(s+'T00:00'),add=(s,n)=>{const d=dt(s);d.setDate(d.getDate()+n);return ymd(d)},diff=(a,b)=>Math.round((dt(b)-dt(a))/864e5);

/* ===== 공통 데이터 (한 곳에서만 관리) ===== */
function fresh(){const t={};for(let i=0;i<6;i++)t[add(START,i)]=true;return{name:'○○',age:'78세(시연값)',sim:SIM0,taken:t,peak:0,meds:[],hospitals:[],guardians:[],appts:[],scores:[],galerts:[],refer:{}}}
let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}S=S||fresh();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const TD=()=>S.sim;
let tt;function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),2600)}

/* ===== 식물 단계: 기록에서 계산 (7일 모두 복약한 주기 수), 퇴행 없음 ===== */
const SN=['씨앗','새싹','꽃봉오리','활짝 핀 꽃'],SE=['🌰','🌱','🌷','🌸'];
function cycles(){const t=TD();let c=0;for(let k=0;k<=Math.floor(diff(START,t)/7);k++){let ok=1;for(let j=0;j<7;j++){const d=add(START,k*7+j);if(d>t||S.taken[d]!==true)ok=0}c+=ok}return c}
const stg=()=>Math.min(Math.max(S.peak,cycles()),3);
function setDay(d,v){const b=stg();S.taken[d]=v;S.peak=Math.max(S.peak,cycles());save();render();const a=stg();if(a>b)grow(b,a)}
function cyc(){const t=TD(),s=add(START,Math.floor(diff(START,t)/7)*7);return[...Array(7)].map((_,j)=>{const d=add(s,j),v=S.taken[d];return{d,st:d>t?'f':v===true?'o':(d<t||v===false)?'x':'n'}})}

/* ===== 공통 화분 캐릭터 (모든 화면이 이 함수로 그림) ===== */
function plant(i){let p='';const L=(y,k)=>`<ellipse cx="${100+k*22}" cy="${y}" rx="20" ry="10" fill="#7BC043" transform="rotate(${k*28} ${100+k*22} ${y})"/>`;
 if(i==0)p='<ellipse cx="100" cy="121" rx="16" ry="11" fill="#3E2A18"/><ellipse cx="100" cy="121" rx="9" ry="6" fill="#B07A3E" transform="rotate(35 100 121)"/><ellipse cx="97" cy="118" rx="3" ry="1.8" fill="#F3D9A8" transform="rotate(35 97 118)"/><path d="M100 105V114" stroke="#FFD54A" stroke-width="3" stroke-dasharray="3 3" stroke-linecap="round"/>';
 else{const y=[0,84,70,64][i];p=`<path d="M100 114V${y}" stroke="#4E9A1F" stroke-width="7" stroke-linecap="round" fill="none"/>`+L(y+22,-1)+L(y+22,1);
  if(i==2)p+=`<ellipse cx="100" cy="${y-12}" rx="11" ry="17" fill="#F48FB1"/><path d="M100 ${y+4}q-9-6-9-14M100 ${y+4}q9-6 9-14" stroke="#4E9A1F" stroke-width="3" fill="none"/>`;
  if(i==3)p+=[0,45,90,135,180,225,270,315].map(a=>`<circle cx="${100+18*Math.cos(a*Math.PI/180)}" cy="${y-10+18*Math.sin(a*Math.PI/180)}" r="11" fill="#F48FB1"/>`).join('')+`<circle cx="100" cy="${y-10}" r="12" fill="#FFD54A"/>`}
 return `<svg viewBox="0 0 200 240" role="img" aria-label="쑥쑥이 화분 (${SN[i]})"><path d="M52 138Q100 72 148 138Z" fill="#6B4423"/>${p}<path d="M50 150h100l-10 58q-2 14-16 14H76q-14 0-16-14z" fill="#EBB48C"/><path d="M60 156q-4 26 2 48" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".35" fill="none"/><rect x="40" y="130" width="120" height="22" rx="11" fill="#F6CFAE"/><rect x="48" y="134" width="64" height="5" rx="2.5" fill="#fff" opacity=".5"/><ellipse cx="80" cy="180" rx="8" ry="10" fill="#2a2a22"/><ellipse cx="120" cy="180" rx="8" ry="10" fill="#2a2a22"/><circle cx="83" cy="176" r="3.2" fill="#fff"/><circle cx="123" cy="176" r="3.2" fill="#fff"/><circle cx="77" cy="184" r="1.6" fill="#fff"/><circle cx="117" cy="184" r="1.6" fill="#fff"/><ellipse cx="66" cy="194" rx="9" ry="5.5" fill="#F29F9F" opacity=".75"/><ellipse cx="134" cy="194" rx="9" ry="5.5" fill="#F29F9F" opacity=".75"/><path d="M87 194Q100 212 113 194Z" fill="#7a2e2e"/><ellipse cx="100" cy="202" rx="6" ry="3.8" fill="#F27C8A"/></svg>`}

/* ===== 화면 이동 (주소의 #번호 사용: 브라우저 뒤로가기도 동작) ===== */
const TABS=[9,10,11];let selM=null,d9=0;
function show(n){if(n==13&&selM==null)n=12;$$('section').forEach(s=>s.classList.toggle('on',s.id=='s'+n));$('#tabs').hidden=!TABS.includes(n);$$('#tabs button').forEach(b=>b.classList.toggle('on',+b.dataset.go==n));scrollTo(0,0);
 if(n==3){$('#q').value='';selH=null;showH()}if(n==7)chat7();if(n==8)$('#own').value='';if(n==9)r9();if(n==13)rDetail();
 if(n==6&&!$('#c6').children.length)bot($('#c6'),`안녕하세요? 저는 ${esc(S.name)}님의 건강 길잡이 쑥쑥이라고 해요!`);render()}
function go(n){location.hash==='#'+n?show(n):location.hash=n}
onhashchange=()=>show(+location.hash.slice(1)||1);
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(+b.dataset.go)});
document.addEventListener('click',e=>{const b=e.target.closest('.chips button');if(!b)return;const c=b.parentNode;if(c.classList.contains('multi'))b.classList.toggle('sel');else{c.querySelectorAll('button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel')}});
const setTm=(i,v)=>{i.type=v?i.dataset.t:'text';i.value=v||''};
$$('.tm').forEach(i=>{i.onfocus=()=>{i.type=i.dataset.t};i.onblur=()=>{if(!i.value)i.type='text'}});
function render(){rHome();rCal();rAch();rBubble();rGrow();rLink();rMeds();rAdmin()}

/* ===== 1 홈 ===== */
function rHome(){$('#homePlant').innerHTML=plant(stg());const n=S.meds.length;
 $('#hello').innerHTML=`안녕하세요, ${esc(S.name)}님<br>`+(n?`오늘 복용할 약이 <span style="color:var(--o)">${n}개</span> 있어요`:'먼저 복용할 약을 등록해 주세요');
 const a=S.appts.find(x=>x.d==add(TD(),1)),r=$('#remind');r.hidden=!a;if(a)r.textContent=`내일 ${a.h} 진료가 있어요`}

/* ===== 2 약물 등록 ===== */
const PH='<i>📷</i>약물 사진을 등록해주세요<small>처방전 촬영으로 자동입력</small>';let img='';$('#photoTxt').innerHTML=PH;
$('#pic').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=240/Math.max(i.width,i.height),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);img=c.toDataURL('image/jpeg',.7);$('#photoTxt').innerHTML=`<img src="${img}" alt="약물 사진">`};i.src=r.result};r.readAsDataURL(f)};
$('#rx').onclick=()=>$('#rxf').click();$('#rxf').onchange=e=>{if(e.target.files[0])toast('처방전을 받았어요. 약 이름을 확인해서 적어주세요')};
$('#saveMed').onclick=()=>{const name=$('#mname').value.trim();if(!name)return toast('약 이름을 입력해주세요');const g=k=>$$(`[data-k=${k}] .sel`).map(b=>b.textContent);
 S.meds.push({name,img,dose:g('dose')[0]||'1정',freq:g('freq')[0]||'1회',when:g('when'),time:$('#mtime').value});save();
 $('#mname').value='';setTm($('#mtime'),'');img='';$('#photoTxt').innerHTML=PH;render();toast('등록이 완료되었습니다')};

/* ===== 3 병원 등록 (예시 데이터) ===== */
const HOSP=[['서울튼튼내과의원','내과','서울시 종로구 대학로 12','02-123-4567'],['햇살정형외과','정형외과','서울시 마포구 월드컵로 34','02-234-5678'],['푸른안과의원','안과','서울시 송파구 올림픽로 56','02-345-6789'],['온누리가정의학과','가정의학과','경기도 성남시 분당구 정자로 78','031-456-7890'],['한마음대학병원','종합병원','서울시 강남구 테헤란로 90','02-567-8901'],['다정이비인후과','이비인후과','부산시 해운대구 해운대로 21','051-678-9012']];
let selH=null;
function showH(){const q=$('#q').value.trim();$('#hres').innerHTML=HOSP.map((h,i)=>({h,i})).filter(o=>o.h[0].includes(q)).map(({h,i})=>`<button class="card ${selH==i?'sel':''}" data-h="${i}">${selH==i?'<span class="ck">✔</span>':''}<b>${h[0]}</b>${h[1]}<br><b>${h[2]}</b>📞 ${h[3]}</button>`).join('')||'<p class="small">검색 결과가 없어요</p>'}
$('#q').oninput=showH;$('#hres').onclick=e=>{const c=e.target.closest('[data-h]');if(c){selH=+c.dataset.h;showH()}};
$('#regH').onclick=()=>{if(selH==null)return toast('병원을 먼저 눌러서 선택해주세요');const h=HOSP[selH];if(!S.hospitals.some(x=>x.n==h[0]))S.hospitals.push({n:h[0],p:h[3]});save();toast(`${h[0]}이(가) 등록되었습니다.`);setTimeout(()=>go(1),1600)};

/* ===== 4 다음 외래 일정 ===== */
let acm=dt(TD()),eid=null;acm.setDate(1);
const fd=a=>{const d=dt(a.d),h=+a.t.slice(0,2);return `${d.getMonth()+1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일 ${h<12?'오전':'오후'} ${h%12||12}:${a.t.slice(3)}`};
const acard=(a,big)=>`<div class="card ${big?'nc':''}"><button class="ed" data-e="${a.id}">수정</button>${fd(a)}<b>${esc(a.h)}</b>${esc(a.p||'진료')}</div>`;
function rCal(){const y=acm.getFullYear(),m=acm.getMonth(),t=TD();let h=[...DOW].map(x=>`<i>${x}</i>`).join('')+'<b></b>'.repeat(acm.getDay());
 for(let d=1;d<=new Date(y,m+1,0).getDate();d++){const s=`${y}-${pad(m+1)}-${pad(d)}`;h+=`<b class="${s==t?'today':''}">${d}${S.appts.some(a=>a.d==s)?'<u>🏥</u>':''}</b>`}
 $('#acal').className='cal acal';$('#acal').innerHTML=h;$('#amon').textContent=`${y}년 ${m+1}월`;
 const up=S.appts.filter(a=>a.d>=t).sort((a,b)=>(a.d+a.t).localeCompare(b.d+b.t));
 $('#near').innerHTML=up[0]?acard(up[0],1):'<p class="small">예정된 진료가 없어요</p>';$('#rest').innerHTML=up.slice(1).map(a=>acard(a)).join('')}
$('#apm').onclick=()=>{acm.setMonth(acm.getMonth()-1);rCal()};$('#anm').onclick=()=>{acm.setMonth(acm.getMonth()+1);rCal()};
function openD(a){eid=a?a.id:null;$('#dh').value=a?a.h:(S.hospitals[0]?S.hospitals[0].n:'');setTm($('#dd'),a?a.d:'');setTm($('#dt'),a?a.t:'');$('#dp').value=a?a.p:'';$('#dAppt').showModal()}
$('#addA').onclick=()=>openD();$('#dno').onclick=()=>$('#dAppt').close();
$('#s4').onclick=e=>{const b=e.target.closest('[data-e]');if(b)openD(S.appts.find(a=>a.id==b.dataset.e))};
$('#dsave').onclick=()=>{const a={id:eid||Date.now(),h:$('#dh').value.trim(),d:$('#dd').value,t:$('#dt').value,p:$('#dp').value.trim()};if(!a.h||!a.d||!a.t)return toast('병원, 날짜, 진료 시간을 입력해주세요');
 const i=S.appts.findIndex(x=>x.id==a.id);i<0?S.appts.push(a):S.appts[i]=a;save();$('#dAppt').close();render();toast('진료 일정이 저장되었어요')};

/* ===== 5 보호자·의료진 연계 ===== */
function rLink(){$('#gl').innerHTML=S.guardians.map(g=>`<div class="card"><b>${esc(g.rel)} ${esc(g.name)}님</b><a class="cta s" href="tel:${esc(g.tel)}">연락하기</a></div>`).join('');
 $('#hl').innerHTML=S.hospitals.map(h=>`<div class="card"><b>${esc(h.n)}</b><a class="cta s" href="tel:${esc(h.p||'')}">문의하기</a></div>`).join('')}
$('#addG').onclick=()=>{['gr','gn','gt'].forEach(i=>$('#'+i).value='');$('#dGuard').showModal()};$('#gcancel').onclick=()=>$('#dGuard').close();
$('#gsave').onclick=()=>{const g={rel:$('#gr').value.trim(),name:$('#gn').value.trim(),tel:$('#gt').value.trim()};if(!g.rel||!g.name||!g.tel)return toast('관계, 이름, 전화번호를 모두 입력해주세요');S.guardians.push(g);save();$('#dGuard').close();render();toast('보호자가 등록되었어요')};

/* ===== 6~8 챗봇 ===== */
function bot(c,h,w){c.insertAdjacentHTML('beforeend',`<div class="bot"><span class="av">🪴</span><div class="b ${w?'w':''}">${h}</div></div>`);c.lastChild.scrollIntoView({block:'end'})}
function me(c,t){c.insertAdjacentHTML('beforeend',`<div class="b u">${t}</div>`);c.lastChild.scrollIntoView({block:'end'})}
const later=(n)=>setTimeout(()=>go(n),30*60000),DEMO='<button class="pill" data-go="8">30분 뒤로 이동 (시연)</button>';
function chat7(){const c=$('#c7'),m=S.meds[0]||{name:'복용 약'};c.innerHTML='';bot(c,'아침약 드셨나요?');
 bot(c,`<div class="mrow"><div class="mph">${m.img?`<img src="${m.img}" alt="">`:'💊'}</div><b>${esc(m.name)}</b></div><button class="pill" data-y="1">예</button><button class="pill no" data-y="0">아니요</button>`,1)}
$('#c7').onclick=e=>{const b=e.target.closest('[data-y],[data-z],[data-r],[data-d]'),c=$('#c7');if(!b)return;const t=b.textContent;
 if(b.parentNode.querySelectorAll('.pill').length)b.parentNode.querySelectorAll('.pill').forEach(x=>x.remove());
 if(b.dataset.y=='1'){me(c,t);setDay(TD(),true);bot(c,'좋아요! 30분 뒤에 몸 상태를 여쭤볼게요.'+DEMO);later(8)}
 else if(b.dataset.y=='0'){me(c,t);bot(c,'혹시 식사를 안 하셨나요?<button class="pill" data-z="0">아직 안 먹었어요</button><button class="pill no" data-z="1">식사했어요</button>',1)}
 else if(b.dataset.z=='0'){me(c,t);bot(c,'아, 식사 전이시군요! 빈속에 약을 드시면 속이 쓰릴 수 있어요. 식사를 가볍게 하신 후에 약을 드시는 것이 좋답니다.<br><br>식사 후에 약을 드시면 알림을 다시 보내드릴까요?<button class="pill" data-r="1">식사 후 30분 뒤에 다시 알려주기</button>',1)}
 else if(b.dataset.z=='1'){me(c,t);bot(c,'식사를 챙겨 드셨군요! 다행이에요. 그럼 지금 바로 물과 함께 약을 드셔주세요.<button class="pill" data-d="1">약 복용 완료했어요</button>',1)}
 else if(b.dataset.r){me(c,t);bot(c,'알겠어요! 30분 뒤에 약을 드셨는지 다시 여쭤볼게요.<button class="pill" data-go="7">30분 뒤로 이동 (시연)</button>');later(7)}
 else{me(c,t);setDay(TD(),true);bot(c,'복용 기록이 저장되었어요. 30분 뒤에 몸 상태를 여쭤볼게요.'+DEMO);later(8)}};
let sym='없음';
$('#s8').onclick=e=>{const b=e.target.closest('[data-sy]');if(!b)return;sym=b.dataset.sy;if(sym=='없음'){logScore(0);d9=1;go(9)}else go(9)};
$('#ownOk').onclick=()=>{const v=$('#own').value.trim();if(!v)return toast('증상을 적어주세요');sym=v;go(9)};

/* ===== 9 몸 상태 (0~10 한 줄 척도) ===== */
const FACE=['😄','🙂','🙂','😐','😐','😟','😣','😣','😖','😭','😭'],LB=['불편 없음','거의 불편하지 않아요','조금 불편해요','조금 불편해요','약간 불편해요','보통으로 불편해요','꽤 불편해요','많이 불편해요','매우 불편해요','너무 힘들어요','참기 어려워요'];let sc=-1;
function r9(){$('#sc9').hidden=!!d9;$('#dn9').hidden=!d9;d9=0;sc=-1;$('#sel9').innerHTML='<span class="l">아직 선택하지 않았어요</span>';
 $('#scale').innerHTML=FACE.map((f,i)=>`<button data-v="${i}" style="background:hsl(${125-i*12} 75% 80%)" aria-label="${i}점 ${LB[i]}"><span>${f}</span>${i}</button>`).join('')}
$('#scale').onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;sc=+b.dataset.v;$$('#scale button').forEach(x=>x.classList.toggle('sel',x==b));$('#sel9').innerHTML=`<span class="f">${FACE[sc]}</span><span class="n">${sc}점</span><span class="l">${LB[sc]}</span>`};
$('#scOk').onclick=()=>{if(sc<0)return toast('얼굴을 눌러서 골라주세요');logScore(sc);$('#sc9').hidden=true;$('#dn9').hidden=false;scrollTo(0,0)};
/* 5점 이상 → 보호자 자동 알림 / 하루 3회 이상 → 의료진 자동 연계 (관리자 패널 로그에만 표시) */
function logScore(v){const d=TD();S.scores.push({d,v,sym});if(v>=5){S.galerts.push({d,v,sym});
 if(S.scores.filter(x=>x.d==d&&x.v>=5).length>=3)S.refer[d]={d,name:S.name,age:S.age,meds:S.meds.map(m=>m.name),hist:S.scores.filter(x=>x.d==d).map(x=>x.v)}}save();render()}

/* ===== 11 복약 기록 ===== */
let cm=dt(TD()),pend=null;cm.setDate(1);
function rBubble(){const d=cyc(),dn=d.filter(x=>x.st=='o').length,ms=d.some(x=>x.st=='x'),n=7-dn;
 const m=dn==7?'대단하세요! 이번 주 약을 모두 드셨어요':ms?'괜찮아요, 오늘부터 다시 챙겨 드세요<small>약을 거르셔도 식물은 그대로예요</small>':dn==0?'오늘 약을 드셨나요?':'꾸준히 복약하고 계시네요!';
 $('#bp').innerHTML=plant(stg());$('#bb').innerHTML=m;$('#bs').textContent=(n>0?`이번 주 ${n}일 더 드시면 식물이 자라요`:'이번 주 목표를 모두 채웠어요')+` · 현재 단계: ${SN[stg()]}`}
function rCal2(){const y=cm.getFullYear(),m=cm.getMonth(),t=TD();let h=[...DOW].map(x=>`<i>${x}</i>`).join('')+'<u></u>'.repeat(cm.getDay());
 for(let d=1;d<=new Date(y,m+1,0).getDate();d++){const s=`${y}-${pad(m+1)}-${pad(d)}`,dis=s<START||s>t,v=S.taken[s];let c='',l='';
  if(!dis||s==t){if(v===true){c='o';l='복약 O'}else if(!(s==t&&v===undefined)){c='x';l='복약 X'}}
  h+=`<button class="day ${c} ${s==t?'td':''}" data-d="${s}" ${dis?'disabled':''}>${d}<small>${l}</small></button>`}
 $('#cal').innerHTML=h;$('#mon').textContent=`${y}년 ${m+1}월`}
$('#pm').onclick=()=>{cm.setMonth(cm.getMonth()-1);rCal2()};$('#nm').onclick=()=>{cm.setMonth(cm.getMonth()+1);rCal2()};
$('#cal').onclick=e=>{const b=e.target.closest('.day');if(!b||b.disabled)return;pend=b.dataset.d;const d=dt(pend);$('#dDayT').textContent=`${d.getMonth()+1}월 ${d.getDate()}일(${DOW[d.getDay()]}) 약을 드셨나요?`;$('#dDay').showModal()};
$('#dYes').onclick=()=>{$('#dDay').close();setDay(pend,true)};$('#dNo').onclick=()=>{$('#dDay').close();setDay(pend,false)};$('#dClose').onclick=()=>$('#dDay').close();
function rAch(){rCal2();const t=TD(),ms=t.slice(0,8)+'01',lo=ms<START?START:ms;let done=0,past=0,miss=0;
 for(let d=lo;d<t;d=add(d,1)){past++;S.taken[d]===true?done++:miss++}
 const tv=S.taken[t];if(tv===true){done++;past++}else if(tv===false)miss++;const p=past?Math.round(done/past*100):0;
 $('#ach').innerHTML=`<div class="al"><div class="ico">${plant(stg())}</div><div class="pb"><div><i style="width:${p}%"></i></div><b>${p}%</b></div></div><div class="box"><div>복용완료<b>${done}일</b></div><div>미복용<b>${miss}일</b></div></div>`}

/* ===== 10 내 식물 ===== */
function rGrow(){const d=cyc(),dn=d.filter(x=>x.st=='o').length,ms=d.some(x=>x.st=='x'),st=stg(),p=Math.round(dn/7*100);
 const nx=st==3?'꽃이 활짝 핀 모습을 잘 유지하고 있어요!':dn==7?'이번 주 복약을 모두 마쳤어요!':ms?'이번 주기는 아쉬워요. 다음 주기에 다시 도전해요!':`다음 성장까지 ${7-dn}일 남았어요!`;
 $('#g10').innerHTML=`<p class="lbl2">이번 주 복약 달성률</p><p class="big">${dn}/7일</p><p class="pct">${p}%</p><div class="pbar"><i style="width:${p}%"></i></div>
 <div class="dots">${d.map(o=>`<span class="dt ${o.st=='o'?'o':o.st=='x'?'x':''} ${o.d==TD()?'td':''}">${o.st=='o'?'✓':o.st=='x'?'×':''}</span>`).join('')}</div>
 <div class="center">${plant(st)}</div><p class="cur">현재 단계: <b>${SN[st]} ${SE[st]}</b></p><p class="nx">${nx}</p>
 <div class="flow">${[0,1,2,3].map(i=>`<div class="${i==st?'on':''}">${plant(i)}${SN[i]}</div>`).join('<em>↗</em>')}</div>`}
function grow(b,a){$('#gp').innerHTML=plant(a);$('#gm').textContent=`식물이 ${SN[b]}에서 ${SN[a]} 단계로 자랐어요!`;$('#dGrow').showModal()}
$('#gok').onclick=()=>$('#dGrow').close();

/* ===== 12·13 나의 등록된 약물 ===== */
const INFO=[
{k:['타이레놀','아세트아미노펜'],u:'열을 내리고 두통, 근육통 같은 통증을 줄여줘요.',h:'정해진 양을 물과 함께 드세요. 하루 최대량을 넘기지 마세요.',c:'술을 자주 드시거나 간이 좋지 않으면 먼저 의사·약사와 상의하세요. 감기약에도 같은 성분이 들어 있을 수 있어요.',s:'드물게 발진, 가려움이 생길 수 있어요. 이럴 땐 복용을 멈추고 병원에 문의하세요.'},
{k:['암로디핀','혈압'],u:'혈압을 낮춰 고혈압을 관리해줘요.',h:'보통 하루 한 번, 같은 시간에 드세요. 증상이 없어도 마음대로 끊지 마세요.',c:'앉았다 일어설 때 어지러울 수 있으니 천천히 일어나세요. 다른 혈압약이나 심장약을 드시면 의사에게 알리세요.',s:'발목·다리 붓기, 얼굴 화끈거림, 두통, 어지러움이 생길 수 있어요.'},
{k:['메트포르민','당뇨'],u:'혈당을 낮춰 당뇨병을 관리해줘요.',h:'보통 식사와 함께 또는 식사 직후에 드세요. 속이 덜 불편해요.',c:'조영제 검사나 수술 전에는 의사에게 꼭 알리세요. 심한 구토·설사로 몸에 물이 부족할 땐 의사와 상의하세요.',s:'메스꺼움, 설사, 속 불편함이 생길 수 있어요. 심한 근육통이나 숨이 가쁜 증상이 있으면 바로 병원에 가세요.'}];
const NOINFO='이 약의 자세한 설명은 아직 준비되지 않았어요. 약 봉투의 설명서를 보거나 의사·약사에게 물어보세요.';
function rMeds(){$('#ml').innerHTML=S.meds.length?S.meds.map((m,i)=>`<button class="card mc" data-m="${i}"><div class="mph">${m.img?`<img src="${m.img}" alt="">`:'💊'}</div><div><b>${esc(m.name)}</b>1회 ${esc(m.dose)}</div></button>`).join(''):'<p class="small">등록된 약물이 없어요</p>'}
$('#ml').onclick=e=>{const b=e.target.closest('[data-m]');if(b){selM=+b.dataset.m;go(13)}};
function rDetail(){const m=S.meds[selM];if(!m)return;const f=INFO.find(x=>x.k.some(k=>m.name.includes(k)))||{};
 $('#md').innerHTML=`<div class="card mc" style="margin-bottom:14px"><div class="mph">${m.img?`<img src="${m.img}" alt="">`:'💊'}</div><div><b>${esc(m.name)}</b>1회 ${esc(m.dose)} · 하루 ${esc(m.freq)}</div></div>
 <div class="dc a"><h3>💡 약물 용도 및 효능</h3>${f.u||NOINFO}</div><div class="dc b2"><h3>📖 올바른 복용 방법</h3>${f.h||NOINFO}</div>
 <div class="dc c"><h3>⚠️ 특별 주의사항</h3>${f.c||NOINFO}</div><div class="dc d"><h3>😷 예상되는 주요 부작용</h3>${f.s||NOINFO}</div>
 <p class="small">일반적인 안내예요. 정확한 복용법은 꼭 의사·약사에게 확인하세요.</p>`}

/* ===== 시연용 관리자 패널 ===== */
function rAdmin(){const t=TD(),c=S.scores.filter(x=>x.d==t&&x.v>=5).length,r=S.refer[t],gs=S.guardians.map(g=>g.rel+' '+g.name).join(', ')||'등록된 보호자 없음';
 $('#ad1').innerHTML=`시연 날짜: <b>${t}</b>`;$('#ad2').innerHTML=`오늘 5점 이상 횟수: <b>${c}회</b> · 의료진 연계: <b>${r?'예':'아니오'}</b>`;
 $('#ad3').innerHTML=`<p><b>보호자 알림 로그</b></p>${S.galerts.map(a=>`<p>${a.d} · ${esc(a.sym)} ${a.v}점 → 보호자 자동 알림 (${esc(gs)})</p>`).join('')||'<p>없음</p>'}<p><b>의료진 연계 로그</b></p>${Object.values(S.refer).map(r=>`<p>${r.d} · ${esc(r.name)}, ${esc(r.age)}, 복용약: ${esc(r.meds.join(', ')||'없음')}, 점수 이력: ${r.hist.join(' → ')}</p>`).join('')||'<p>없음</p>'}`}
$('#plus').onclick=()=>{S.sim=add(S.sim,1);cm=dt(S.sim);cm.setDate(1);save();render()};
$('#rst').onclick=()=>{S=fresh();save();selM=null;$('#c6').innerHTML='';cm=dt(S.sim);cm.setDate(1);acm=dt(S.sim);acm.setDate(1);show(+location.hash.slice(1)||1)};

show(+location.hash.slice(1)||1);
