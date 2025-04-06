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

        source.play = function (element, callback) {
            network.silent(element.url, (html) => {
                const iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"[^>]*>/);
                if (iframeMatch && iframeMatch[1]) {
                    const video_url = iframeMatch[1];

                    callback([{
                        title: 'UAKino',
                        file: video_url,
                        quality: 'HD',
                        stream: true
                    }]);
                } else {
                    callback([]);
                }
            });
        };

        Lampa.Platform.addSource(source);
    }

    if (window.Lampa) {
        startPlugin();
    } else {
        document.addEventListener("lampa-start", startPlugin);
    }
})();
