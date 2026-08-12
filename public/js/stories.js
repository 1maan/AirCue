function toggleRunOrderMenu(button) {
  const menu = button.parentElement.querySelector(".runorder-menu");
  document.querySelectorAll(".runorder-menu").forEach(item => {
    if (item !== menu) {
      item.classList.add("hidden");
    }
  });
  menu.classList.toggle("hidden");
}

// TOGGLE LANGUAGE
const languageToggle = document.getElementById("languageToggle");
const storyText = document.getElementById("storyText");
const cgToggle = document.getElementById("cgToggle");
const cg = document.getElementById("cg");
languageToggle.addEventListener("change", ()=>{
  if(languageToggle.checked){
    storyText.setAttribute('dir', 'rtl')
  }else{
    storyText.setAttribute('dir', 'ltr')
  }
})
cgToggle.addEventListener("change", ()=>{
  if(cgToggle.checked){
    cg.setAttribute('dir', 'rtl')
  }else{
    cg.setAttribute('dir', 'ltr')
  }
})

// COPY TEXT
function copyType(name) {
  const text = '__'+name.toUpperCase()+'__';
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showAlert('success', `Copied "${text}" to clipboard`);
  } catch (err) {
    console.error('Failed to copy text: ', err);
    showAlert('error', 'Failed to copy to clipboard');
  } finally {
    document.body.removeChild(textArea);
  }
}