(() => {
    const manifest = {
        id: "uakino",
        name: "UAKino Provider",
        version: "1.0.0",
        description: "Перегляд відео з uakino.me в Lampa",
        author: "Твоє ім'я",
        type: "video",
        plugin: true
    };

    function startPlugin() {
        const network = Lampa.Network;
        const source = {};

        // Пошук фільмів на UaKino
        source.search = function (query, year, type, callback) {
            const url = `https://uakino.me/index.php?do=search`;

            network.silent(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `do=search&subaction=search&story=${encodeURIComponent(query)}`
            }, (html) => {
                const items = [];
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const results = doc.querySelectorAll('.shortstory');

                results.forEach(card => {
                    const link = card.querySelector('a.shortlink');
                    const title = link?.textContent.trim();
                    const href = link?.href;
                    const img = card.querySelector('img')?.src;

                    if (title && href) {
                        items.push({
                            title,
                            url: href,
                            poster: img,
                            quality: 'HD',
                            info: '',
                            voice: '',
                            original_language: 'UA',
                            year: year,
                        });
                    }
                });

                callback(items);
            });
        };

        // Додавання кнопки "Онлайн" для кожного фільму
        source.get = function (id, callback) {
            const url = `https://uakino.me${id}`;
            network.silent(url, {
                method: 'GET'
            }, (html) => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const videoUrl = doc.querySelector('.b-post__video iframe')?.src;

                if (videoUrl) {
                    // Додаємо кнопку "Онлайн"
                    const onlineButton = {
                        title: 'Переглянути онлайн',
                        file: videoUrl,  // Лінк на відео
                        quality: 'HD',
                        stream: true,
                        button: {
                            text: "Переглянути онлайн",
                            action: () => {
                                Lampa.Player.play(videoUrl);  // Відтворення відео
                            }
                        },
                    };
                    callback([onlineButton]);
                } else {
                    callback([]);
                }
            });
        };

        // Додаємо джерело до Lampa
        Lampa.Platform.addSource(source);
    }

    if (window.Lampa) {
        startPlugin();
    } else {
        document.addEventListener("lampa-start", startPlugin);
    }
})();
