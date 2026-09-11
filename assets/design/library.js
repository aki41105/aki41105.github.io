// Load the actual demo source as text; never interpret HTML from a source file.
document.querySelectorAll("details[data-source]").forEach(details=>{
  let loaded=false,loading=false;
  details.addEventListener("toggle",async()=>{
    if(!details.open||loaded||loading)return;
    loading=true;
    const code=details.querySelector("code");
    code.textContent="読み込み中…";
    try{
      const response=await fetch(details.dataset.source);
      if(!response.ok)throw new Error("HTTP "+response.status);
      code.textContent=await response.text();
      loaded=true;
    }catch{
      code.textContent="コードを読み込めませんでした。上の保存リンクまたはZIPをご利用ください。閉じて開くと再試行します。";
    }finally{loading=false;}
  });
});
