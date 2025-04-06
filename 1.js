(() => {
    const manifest = {
        id: "uakino",
        name: "UAKino",
        version: "1.0.0",
        description: "Перегляд відео з uakino.me",
        type: "video",
        plugin: true
    };

    function startPlugin() {
        let buttonAdded = false;

        // Слухаємо події, щоб додати кнопку "Онлайн"
        Lampa.Events.on('movie', (event) => {
            if (buttonAdded) return;

            const data = event.object;

            const btn = $('<div class="full-start__button selector focus" style="margin: 10px 0;">Онлайн (UAKino)</div>');

            btn.on('hover:enter', () => {
                Lampa.Noty.show('Завантаження плеєра...');

                // Тут треба зробити запит до uakino та відкрити плеєр
                fetch(`https://uakino.me/index.php?do=search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `do=search&subaction=search&story=${encodeURIComponent(data.title)}`
                })
                .then(res => res.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const link = doc.querySelector('.shortstory a.shortlink')?.href;

                    if (!link) return Lampa.Noty.show('Не знайдено фільм на UAKino');

                    fetch(link)
                        .then(res => res.text())
                        .then(page => {
                            const iframeMatch = page.match(/<iframe[^>]+src="([^"]+)"/);
                            if (iframeMatch && iframeMatch[1]) {
                                Lampa.Player.play(iframeMatch[1]);
                            } else {
                                Lampa.Noty.show('Не знайдено відео');
                            }
                        });
                });
            });

            $('.full-start__buttons').append(btn);
            buttonAdded = true;
        });
    }

    if (window.Lampa) startPlugin();
    else document.addEventListener("lampa-start", startPlugin);
})();
