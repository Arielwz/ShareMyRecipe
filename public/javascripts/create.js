async function load() {
  const resRaw = await fetch("./checkSession");

  if (!resRaw.ok) {
    window.location.href = "/index.html";
    console.log(resRaw);
    return;
  }
}

load();