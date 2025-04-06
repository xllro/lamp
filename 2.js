source.search = function(query, year, type, callback) {
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
