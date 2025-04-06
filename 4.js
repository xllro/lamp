(() => {
    function startPlugin() {
        let buttonAdded = false;

        if (!window.Lampa || !Lampa.Events) {
            console.warn('Lampa ще не готова, чекаємо...');
            document.addEventListener("lampa-start", startPlugin);
            return;
        }

        Lampa.Events.on('movie', (event) => {
            if (buttonAdded) return;

            const data = event.object;
            const btn = $('<div class="full-start__button selector">Онлайн (UAKino)</div>');

            btn.on('hover:enter', () => {
                Lampa.Noty.show('Завантаження з uakino.me...');

                fetch(`https://uakino.me/index.php?do=search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `do=search&subaction=search&story=${encodeURIComponent(data.title)}`
                })
                .then(res => res.text())
                .then(html => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const link = doc.querySelector('.shortstory a.shortlink')?.href;

                    if (!link) return Lampa.Noty.show('Фільм не знайдено на UAKino');

                    return fetch(link)
                        .then(res => res.text())
                        .then(page => {
                            const match = page.match(/<iframe[^>]+src="([^"]+)"/);
                            if (match && match[1]) {
                                Lampa.Player.play(match[1]);
                            } else {
                                Lampa.Noty.show('Не вдалося знайти відео');
                            }
                        });
                })
                .catch(() => {
                    Lampa.Noty.show('Помилка при підключенні до UAKino');
                });
            });

            $('.full-start__buttons').append(btn);
            buttonAdded = true;
        });
    }

    if (window.Lampa && Lampa.Events) {
        startPlugin();
    } else {
        document.addEventListener("lampa-start", startPlugin);
    }
})();
