export let objetDieu = document.createElement('div');

objetDieu.init = () => {
    objetDieu.id = "objetDieu"
    document.body.append(objetDieu);
    let colNb = 4 + (Math.floor(Math.random() * 10))
    let rowNb = 4 + (Math.floor(Math.random() * 5))
    let divNb = colNb * rowNb;

    document.documentElement.style.setProperty('--objetDieuColumns', colNb);
    document.documentElement.style.setProperty('--objetDieuRows', rowNb);

    let textures = [
    ]
    for (let i = 0; i < divNb; i++) {
        let ch = document.createElement('div')
        objetDieu.append(ch);
        ch.classList.add('plaque');
        let backNb = Math.floor(Math.random() * 9) + 1;
        let backSrc = `systems/noc/asset/textureObjetDieu/${backNb}.jpg`
        ch.style.background = `url(${backSrc})`;
        ch.style.backgroundSize = "cover";
        ch.style.width = `${Math.max(Math.floor(Math.random() * 600), 100)}%`;
        ch.style.height = `${Math.max(Math.floor(Math.random() * 600), 100)}%`;
        ch.style.zIndex = 10000 + (Math.floor(Math.random() * divNb));
    }
}

objetDieu.productMecanisme = () => {
    for (let ch of objetDieu.children) {
        let vert;
        if (Math.random() > 0.5) {
            vert = true;
        };
        let dir = (Math.random() > 0.5);
        if (vert) {
            TweenLite.to(ch, Math.random() * 25, { x: 0, y: (dir ? 1 : -1) * Math.max((Math.random() * 8000), 4000), z: 0, transformOrigin: "50% 50%" });
        } else {
            TweenLite.to(ch, Math.random() * 25, { x: (dir ? 1 : -1) * Math.max((Math.random() * 8000), 4000), y: 0, z: 0, transformOrigin: "50% 50%" });

        }

    }
}