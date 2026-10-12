const $ = (id) => document.getElementById(id);
const format = (value) => JSON.stringify(value, null, 2);

async function refresh() {
  await refreshBots();

  try {
    const response = await fetch("/api/logs");
    $("logs").textContent = format(await response.json());
  } catch (error) {
    $("logs").textContent = String(error);
  }
}

$("file").addEventListener("change", async () => {
  const file = $("file").files[0];
  if (!file) return;

  if (file.size > 65536) {
    $("result").textContent = "File vượt quá 64 KiB";
    return;
  }

  $("source").value = await file.text();
});

$("submit").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("result").textContent = "Đang kiểm tra...";

  try {
    const response = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: $("name").value,
        source: $("source").value,
      }),
    });

    $("result").textContent = format(await response.json());
    await refresh();
  } catch (error) {
    $("result").textContent = String(error);
  }
});

$("refresh").addEventListener("click", refresh);
refresh();

async function refreshBots() {
  try {
    const response = await fetch("/api/scripts");
    const data = await response.json();

    for (const id of ["botA", "botB"]) {
      const select = $(id);
      const current = select.value;
      select.replaceChildren();

      for (const bot of data.scripts) {
        const option = document.createElement("option");
        option.value = bot.id;
        option.textContent = `${bot.name} (${bot.id.slice(0, 8)})`;
        select.append(option);
      }

      if (data.scripts.some((bot) => bot.id === current)) {
        select.value = current;
      }
    }

    if (data.scripts.length > 1 && $("botA").value === $("botB").value) {
      $("botB").selectedIndex = 1;
    }
  } catch (error) {
    $("matchResult").textContent = String(error);
  }
}

$("fight").addEventListener("click", async () => {
  $("matchResult").textContent = "Đang đấu...";

  try {
    const response = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        botA: $("botA").value,
        botB: $("botB").value,
        maxTurns: 60,
      }),
    });

    $("matchResult").textContent = format(await response.json());
    await refresh();
  } catch (error) {
    $("matchResult").textContent = String(error);
  }
});
