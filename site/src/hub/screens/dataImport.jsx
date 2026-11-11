import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase-firestore';
import { useAuth } from '../../auth/AuthProvider';
import { list, forget } from '../data';
import { IMPORTS, parseCSV, planImport } from '../logic/import';
import { PageHeader, Section } from '../ui';

export function DataImport() {
  const auth=useAuth(), [params]=useSearchParams();
  const [dataset,setDataset]=useState(IMPORTS[params.get('dataset')]?params.get('dataset'):'staff');
  const [preview,setPreview]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[confirmed,setConfirmed]=useState(false);
  const spec=IMPORTS[dataset];
  async function context(){const names=[...new Set([dataset,...(dataset==='classes'?['academicYears']:dataset==='enrollments'?['classes','students']:dataset==='studentGuardianLinks'?['students','guardians']:[])])];return Object.fromEntries(await Promise.all(names.map(async n=>[n,await list(n)])));}
  function template(){const url=URL.createObjectURL(new Blob([spec.fields.join(',')+'\r\n'],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`SRSS-${dataset}-template.csv`;a.click();URL.revokeObjectURL(url);}
  async function check(file){setPreview(null);setError('');setNotice('');setConfirmed(false);if(!file)return;setBusy(true);try{if(file.size>1000000)throw Error('Choose a CSV smaller than 1 MB.');const rows=parseCSV(await file.text());const result=planImport(dataset,rows,await context());setPreview({...result,rows,name:file.name});}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function save(){setBusy(true);setError('');setNotice('');let count=0;try{
    const checked=planImport(dataset,preview.rows,await context());if(checked.errors.length){setPreview({...preview,...checked});throw Error('Records changed since the preview. Resolve the new errors and upload again.');}
    // Eight writes per transaction respects security-rule read limits. Existing IDs can never be overwritten.
    for(let i=0;i<checked.plan.length;i+=8){const part=checked.plan.slice(i,i+8);await runTransaction(db,async tx=>{
      const refs=part.map(r=>doc(db,dataset,r.id));const snaps=await Promise.all(refs.map(r=>tx.get(r)));
      if(snaps.some(s=>s.exists()))throw Error('A record now uses one of these IDs. Refresh the preview before continuing.');
      part.forEach((r,j)=>tx.set(refs[j],{...r.payload,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),createdBy:auth.user.uid,updatedBy:auth.user.uid}));
    });count+=part.length;}
    forget('staffNames');setNotice(`${count} records saved. Review them in ${spec.label}.`);setPreview(null);
  }catch(e){setError(`${count?`${count} records were saved before this stopped. Remove those rows before retrying. `:''}${e.message}`);setConfirmed(false);}finally{setBusy(false);}}
  if(!auth.roles.some(r=>['schoolAdmin','superAdmin'].includes(r)))return <p role="alert">The school office manages record imports.</p>;
  return <><PageHeader kicker="School setup" title="Import school records">Upload a CSV saved from Excel or Google Sheets. Review every row before adding it to the school records.</PageHeader>
    <p><Link to="/hub/admin/operations">Return to setup & upkeep</Link></p>
    <Section title="1. Prepare your file"><label className="hub-field">Record type<select disabled={busy} value={dataset} onChange={e=>{setDataset(e.target.value);setPreview(null);setError('');setNotice('');setConfirmed(false);}}>{Object.entries(IMPORTS).map(([id,s])=><option key={id} value={id}>{s.label}</option>)}</select></label>
    <ol><li>Download the template and keep the headings. Required fields: {spec.required.join(', ')}.</li><li>Use a stable school record ID for each row. Link pupils and guardians using those IDs. Add people before importing relationships or enrolments.</li><li>Save dates as YYYY-MM-DD and phone numbers as text with a country code. Leave unknown optional fields blank.</li><li>Save the sheet as UTF-8 CSV, then upload it below (up to 500 records, 1 MB).</li></ol>
    <button className="hub-button hub-button-quiet" onClick={template} disabled={busy}>Download template</button>
    <p>Imports add new records. Use <Link to={spec.to}>{spec.label}</Link> to correct existing records. Sign-in accounts and staff privileges are assigned separately.</p>
    {dataset==='studentGuardianLinks'&&<p className="hub-hint">Imported family links start with hub access off. Verify each relationship in Guardian links before granting access. This avoids inviting an adult to an unverified child record.</p>}
    <label className="hub-field">CSV file<input key={dataset} type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>check(e.target.files?.[0])}/></label></Section>
    {busy&&<p role="status">Checking or saving records…</p>}{error&&<p className="hub-error" role="alert">{error}</p>}{notice&&<p role="status">{notice} <Link to={spec.to}>Review records</Link></p>}
    {preview&&<Section title={`2. Review ${preview.rows.length} records`}><p>{preview.name} · {preview.errors.length} issue(s)</p>{preview.errors.length>0?<ul className="hub-error">{preview.errors.slice(0,60).map((e,i)=><li key={i}>Row {e.row}: {e.message}</li>)}</ul>:<p>Required fields, duplicate identifiers and references passed the checks.</p>}
    <div style={{overflowX:'auto'}}><table className="hub-table"><thead><tr>{spec.fields.map(f=><th key={f}>{f}</th>)}</tr></thead><tbody>{preview.rows.map((r,i)=><tr key={i}>{spec.fields.map(f=><td key={f}>{r[f]||'—'}</td>)}</tr>)}</tbody></table></div>
    <label className="hub-check"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/>I checked these records against the school source and am ready to add them.</label><button className="hub-button" disabled={busy||!confirmed||preview.errors.length>0} onClick={save}>Add {preview.rows.length} records</button></Section>}
  </>;
}
