export let objetDieu = document.createElement('div');

objetDieu.init = () => {
    objetDieu.id = "objetDieu"
    document.body.append(objetDieu);
    objetDieu.initPlaques();
    objetDieu.initFiel();
    objetDieu.initFaisceau();

}
objetDieu.initPlaques = () => {
    let colNb = 4 + (Math.floor(Math.random() * 30))
    let rowNb = 4 + (Math.floor(Math.random() * 8))
    let divNb = colNb * rowNb;

    document.documentElement.style.setProperty('--objetDieuColumns', colNb);
    document.documentElement.style.setProperty('--objetDieuRows', rowNb);

    let textures = [
    ]
    for (let i = 0; i < divNb; i++) {
        let ch = document.createElement('div')
        objetDieu.append(ch);
        ch.classList.add('plaque');
        let backNb = Math.floor(Math.random() * 11) + 1;
        let backSrc = `systems/noc/asset/textureObjetDieu/${backNb}.jpg`
        ch.style.background = `url(${backSrc})`;
        ch.style.backgroundSize = "100% 100%";
        ch.style.width = `${Math.max(Math.floor(Math.random() * 1000), 500)}%`;
        ch.style.height = `${Math.max(Math.floor(Math.random() * 1000), 500)}%`;
        ch.style.zIndex = 10000 + (Math.floor(Math.random() * divNb));
    }
}
objetDieu.setBlendMode = (mode) => {
    objetDieu.style.setProperty('mix-blend-mode', mode);
}
objetDieu.initFiel = () => {
    let videomasque = document.createElement('div');
    videomasque.id = "videoFiel";
    videomasque.innerHTML = `
    <video controls=false  >
    <source src="systems/noc/asset/video/Ink_25___4k_res.webm" type="video/webm">
    </video>
    `
    objetDieu.append(videomasque);

}
objetDieu.initFaisceau = () => {
    let videomasque = document.createElement('div');
    videomasque.id = "videoFaisceau";
    videomasque.innerHTML = `
    <video controls=false  >
    <source src="systems/noc/asset/video/light.mp4" type="video/webm">
    </video>
    `
    objetDieu.append(videomasque);

}
objetDieu.displayFiel = () => {
    objetDieu.setBlendMode("darken");
    let vid = document.querySelector('#videoFiel video');
    vid.pause();
    vid.currentTime = 0;
    vid.classList.add("visible");
    vid.play();
    setTimeout(() => {
        vid.classList.remove('visible');
        setTimeout(() => {
            objetDieu.setBlendMode('normal')
        }, 1500);
    }, 11000)


}
objetDieu.displayFaisceau = () => {
    objetDieu.setBlendMode("exclusion");
    let vid = document.querySelector('#videoFaisceau video');
    vid.pause();
    vid.currentTime = 0;
    vid.classList.add("visible");
    vid.play();
    setTimeout(() => {
        vid.classList.remove('visible');
        setTimeout(() => {
            objetDieu.setBlendMode('normal')
        }, 1500);
    }, 11000)

}

objetDieu.produceMecanisme = () => {
    objetDieu.setBlendMode("normal");

    for (let ch of objetDieu.children) {
        if (ch.classList.contains('plaque')) {
            let vert;
            if (Math.random() > 0.5) {
                vert = true;
            };
            let dir = (Math.random() > 0.5);
            if (vert) {
                TweenLite.to(ch, Math.random() * 12, { x: 0, y: (dir ? 1 : -1) * Math.max((Math.random() * 3000), 4000), z: 0, transformOrigin: "50% 50%" });
            } else {
                TweenLite.to(ch, Math.random() * 12, { x: (dir ? 1 : -1) * Math.max((Math.random() * 3000), 4000), y: 0, z: 0, transformOrigin: "50% 50%" });

            }
        }


    }
}