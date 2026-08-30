export const THEME_KEY = "kindsem-theme"

export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var d=t==="dark";var r=document.documentElement;r.classList.toggle("dark",d);r.classList.toggle("light",!d);r.style.colorScheme=d?"dark":"light"}catch(e){}})();`

export function toggleTheme() {
  const root = document.documentElement
  const dark = root.classList.contains("dark")
  root.classList.toggle("dark", !dark)
  root.classList.toggle("light", dark)
  root.style.colorScheme = dark ? "light" : "dark"
  localStorage.setItem(THEME_KEY, dark ? "light" : "dark")
}
