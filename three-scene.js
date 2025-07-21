let scene, camera, renderer;
let currentState = 'text';
let particles = null; // Đây là thứ animate() sẽ render
let particlesInitial = null;
let particlesFinal = null;

const countdownInitial = ['5','4','3', '2', '1'];
const countdownFinal = ['Happy Birthday', 'Nguyễn Thị \nLinh', '05/07/2002', 'Happy \n20+', 'I love you!'];

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.getElementById('three-container').appendChild(renderer.domElement);
    camera.position.z = 25;

    // Bắt đầu với mảng Initial
    prepareAndStart(countdownInitial, true, () => {
        // Sau khi xong mảng đầu, chuyển sang mảng 2
        prepareAndStart(countdownFinal, false, () => {
            morphToHeart();

        });
    });

    animate();
}

function prepareAndStart(array, isInitial, onComplete = () => { }) {
    const allPoints = array.map(createTextPoints);
    const maxCount = Math.max(...allPoints.map(p => p.length));
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxCount * 3);
    const colors = new Float32Array(maxCount * 3);

    for (let i = 0; i < maxCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

        const color = new THREE.Color();
        color.setHSL(0.6, 0.7, 0.6);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const newParticles = new THREE.Points(geometry, material);
    newParticles.userData.maxCount = maxCount;

    if (particles) scene.remove(particles);
    scene.add(newParticles);

    if (isInitial) {
        particlesInitial = newParticles;
        particles = particlesInitial;
    } else {
        particlesFinal = newParticles;
        particles = particlesFinal;
    }

    startCountdown(array, newParticles, onComplete);
}

function startCountdown(array, particlesTarget, onComplete = () => { }) {
    let step = 0;
    function next() {
        if (step < array.length) {
            morphToTextPositions(array[step], particlesTarget);
            step++;
            setTimeout(next, 2500);
        } else {
            onComplete();
        }
    }
    next();
}

function morphToTextPositions(text, particlesTarget) {
    const targetPointsOriginal = createTextPoints(text);
    const maxCount = particlesTarget.userData.maxCount;
    const posAttr = particlesTarget.geometry.attributes.position.array;

    const targetPoints = [];
    for (let i = 0; i < maxCount; i++) {
        const randIndex = Math.floor(Math.random() * targetPointsOriginal.length);
        const base = targetPointsOriginal[randIndex];
        targetPoints.push({
            x: base.x + (Math.random() - 0.5) * 0.2,
            y: base.y + (Math.random() - 0.5) * 0.2
        });
    }

    for (let i = 0; i < maxCount; i++) {
        const p = targetPoints[i];
        gsap.to(posAttr, {
            [i * 3]: p.x,
            [i * 3 + 1]: p.y,
            [i * 3 + 2]: 0,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
                particlesTarget.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
}

function morphToHeart() {
    const maxCount = particlesFinal.userData.maxCount;
    const posAttr = particlesFinal.geometry.attributes.position.array;

    const heartPoints = createHeartPoints();
    const targetPositions = [];

    for (let i = 0; i < maxCount; i++) {
        const randIndex = Math.floor(Math.random() * heartPoints.length);
        const base = heartPoints[randIndex];
        targetPositions.push({
            x: base.x + (Math.random() - 0.5) * 0.2,
            y: base.y + (Math.random() - 0.5) * 0.2,
            z: base.z
        });
    }

    for (let i = 0; i < maxCount; i++) {
        const p = targetPositions[i];
        gsap.to(posAttr, {
            [i * 3]: p.x,
            [i * 3 + 1]: p.y,
            [i * 3 + 2]: p.z,
            duration: 2.5,
            ease: "power2.inOut",
            onUpdate: () => {
                particlesFinal.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    currentState = 'heart';
    particlesFinal.scale.set(1.8, 1.8, 1.8); // scale toàn bộ lên 1.8 lần

    gsap.to(particlesFinal.scale, {
        x: 2, y: 2, z: 2,
        duration: 0.3,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut",
        repeatDelay: 0.2
    });
    gsap.delayedCall(2.0, () => {
        showLoveTextParticles(); // <-- Hàm này bạn đã có rồi
    });
}

function showLoveTextParticles() {
    const textPoints = createTextPoints('LOVE', 0.15);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(textPoints.length * 3);
    const colors = new Float32Array(textPoints.length * 3);

    for (let i = 0; i < textPoints.length; i++) {
        const p = textPoints[i];
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z || 0;

        const color = new THREE.Color(1, 0.2, 0.5); // Hồng
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false
    });

    const loveParticles = new THREE.Points(geometry, material);
    loveParticles.position.set(0, 0, 5); // Đưa ra trước tim
    loveParticles.scale.set(0.35, 0.35, 0.35); // 💡 Nhỏ lại

    scene.add(loveParticles);
}


function createTextPoints(text, density = 0.3) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontSize = 100;
    const padding = 20;

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    ctx.font = `bold ${fontSize}px Arial`;
    const textWidths = lines.map(line => ctx.measureText(line).width);
    const maxWidth = Math.max(...textWidths);
    const totalHeight = lineHeight * lines.length;

    canvas.width = maxWidth + padding * 2;
    canvas.height = totalHeight + padding * 2;

    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    lines.forEach((line, i) => {
        const x = canvas.width / 2;
        const y = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2 + i * lineHeight;
        ctx.fillText(line, x, y);
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const points = [];
    const threshold = 128;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > threshold) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);

            if (Math.random() < density) {
                points.push({
                    x: (x - canvas.width / 2) / (fontSize / 10),
                    y: -(y - canvas.height / 2) / (fontSize / 10)
                });
            }
        }
    }

    return points;
}

function createHeartPoints() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 500;
    canvas.width = canvas.height = size;

    ctx.fillStyle = 'white';
    ctx.beginPath();

    const x = size / 2;
    const y = size / 2;
    ctx.moveTo(x, y + 30); // cao hơn
    ctx.bezierCurveTo(x + 100, y - 60, x + 180, y + 100, x, y + 190);
    ctx.bezierCurveTo(x - 180, y + 100, x - 100, y - 60, x, y + 30);
    ctx.closePath();
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, size, size);
    const pixels = imageData.data;
    const points = [];
    const threshold = 128;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > threshold) {
            const px = (i / 4) % size;
            const py = Math.floor((i / 4) / size);

            if (Math.random() < 0.8) {
                const nx = (px - size / 2) / 20;
                const ny = -(py - size / 2 - 100) / 20;

                // Tạo hình khối ellipsoid theo khoảng cách tới tâm
                const dist = Math.sqrt(nx * nx + ny * ny);
                const maxDist = 10; // bán kính ngoài cùng
                const ratio = 1 - Math.min(dist / maxDist, 1); // gần tâm -> giá trị cao hơn

                const nz = ratio * 2 * (Math.random() * 0.5 + 0.5); // sâu hơn gần trung tâm

                points.push({
                    x: nx,
                    y: ny,
                    z: (Math.random() < 0.5 ? -1 : 1) * nz
                });
            }
        }
    }

    return points;
}

function animate() {
    requestAnimationFrame(animate);
    if (particles) {
        if (currentState === 'sphere') {
            particles.rotation.y += 0.002;
        }
        renderer.render(scene, camera);
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
