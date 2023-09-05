window.wait = (ms: number) =>
    new Promise((res) => {
        setTimeout(res, ms);
    });
