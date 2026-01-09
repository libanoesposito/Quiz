/**
 * GESTORE CARD 3D GOLD (Luxury Edition v3.1)
 * Fixes: Geometry (Rounded), Lighting (Camera-attached), Download (GLTF), Performance
 */
console.log("GoldCardManager v3.1 loaded"); // Controllo versione in console

const GoldCardManager = {
    scene: null,
    camera: null,
    renderer: null,
    cardGroup: null,
    controls: null,
    animationId: null,
    container: null,

    init: function(containerElement, userData) {
        this.container = containerElement;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 1. SCENA
        this.scene = new THREE.Scene();
        this.scene.background = null; // Trasparente

        // 2. CAMERA
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 0, 14);

        // 3. RENDERER (Alta qualità)
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true, 
            preserveDrawingBuffer: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limita pixel ratio per performance
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        this.container.innerHTML = ''; 
        this.container.appendChild(this.renderer.domElement);

        // 4. LUCI (Studio Lighting)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xfff0dd, 1.0);
        mainLight.position.set(5, 5, 10);
        this.scene.add(mainLight);

        // Luce posteriore per contorno
        const rimLight = new THREE.SpotLight(0xffd700, 1.5);
        rimLight.position.set(-5, 10, -10);
        rimLight.lookAt(0,0,0);
        this.scene.add(rimLight);

        // LUCE CAMERA (Essenziale per l'effetto "Shine" interattivo)
        const cameraLight = new THREE.PointLight(0xffeeb1, 0.8);
        this.camera.add(cameraLight);
        this.scene.add(this.camera);

        // 5. COSTRUZIONE CARD
        this.createLuxuryCard(userData);

        // 6. CONTROLLI
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 20;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2.0;

        this.animate();
        window.addEventListener('resize', this.onResize.bind(this));
    },

    createLuxuryCard: function(user) {
        this.cardGroup = new THREE.Group();

        // --- GEOMETRIA ARROTONDATA (Apple Style) ---
        const width = 8.56;
        const height = 5.398;
        const radius = 0.5; // Angoli più morbidi
        const shape = new THREE.Shape();

        shape.moveTo(-width/2 + radius, -height/2);
        shape.lineTo(width/2 - radius, -height/2);
        shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius);
        shape.lineTo(width/2, height/2 - radius);
        shape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2);
        shape.lineTo(-width/2 + radius, height/2);
        shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius);
        shape.lineTo(-width/2, -height/2 + radius);
        shape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2);

        const extrudeSettings = {
            depth: 0.05, 
            bevelEnabled: true,
            bevelSegments: 5, // Più segmenti = più liscio (meno Minecraft)
            bevelSize: 0.1,
            bevelThickness: 0.1,
            curveSegments: 24 // Curve lisce
        };

        const geometryBody = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        // Materiale Oro Spazzolato
        const materialGold = new THREE.MeshStandardMaterial({
            color: 0xd4af37, // Oro classico
            metalness: 0.9,
            roughness: 0.3,
            side: THREE.DoubleSide
        });

        const bodyMesh = new THREE.Mesh(geometryBody, materialGold);
        this.cardGroup.add(bodyMesh);

        // --- FACCIATA FRONTALE ---
        const geometryFace = new THREE.ShapeGeometry(shape, 24); // High res shape
        const texture = this.createCardTexture(user);
        
        const materialFace = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            metalness: 0.6,
            roughness: 0.4
        });

        const faceMesh = new THREE.Mesh(geometryFace, materialFace);
        faceMesh.position.z = 0.08; // Appena sopra il bevel
        this.cardGroup.add(faceMesh);

        this.scene.add(this.cardGroup);
    },

    createCardTexture: function(user) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 646;
        const ctx = canvas.getContext('2d');

        // Sfondo Oro Premium
        const grd = ctx.createLinearGradient(0, 0, 1024, 646);
        grd.addColorStop(0, "#b88a4d");
        grd.addColorStop(0.4, "#fdfcbf");
        grd.addColorStop(0.6, "#d4af37");
        grd.addColorStop(1, "#8a6e2f");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 1024, 646);

        // Noise
        this.addNoise(ctx, 1024, 646);

        // Bordo
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, 964, 586);

        // Chip & Contactless
        this.drawChip(ctx, 80, 200);
        this.drawContactless(ctx, 900, 323);

        // TESTI (Italiano)
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.font = "700 42px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.textAlign = "right";
        ctx.fillText("UTENTE GOLD", 960, 80);

        ctx.textAlign = "left";
        ctx.font = "500 50px 'Courier New', monospace";
        ctx.fillStyle = "#1d1d1f";
        ctx.shadowColor = "rgba(255,255,255,0.2)";
        ctx.fillText(user.name.toUpperCase(), 80, 400);

        ctx.font = "600 24px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "#444";
        ctx.shadowBlur = 0;
        
        ctx.font = "400 18px 'Helvetica Neue', sans-serif";
        ctx.fillText("ID UTENTE", 80, 530);
        ctx.fillText("ISCRITTO DAL", 350, 530);

        ctx.font = "600 28px 'Courier New', monospace";
        ctx.fillStyle = "#000";
        ctx.fillText(user.id, 80, 560);
        ctx.fillText(user.date, 350, 560);

        // QR CODE
        const qr = new QRious({
            value: window.location.href,
            size: 160,
            backgroundAlpha: 0,
            foreground: '#1d1d1f'
        });
        ctx.drawImage(qr.canvas, 820, 450);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    },

    drawChip: function(ctx, x, y) {
        ctx.fillStyle = "#e6e6e6";
        ctx.beginPath();
        ctx.roundRect(x, y, 130, 100, 15);
        ctx.fill();
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y+50); ctx.lineTo(x+130, y+50);
        ctx.moveTo(x+65, y); ctx.lineTo(x+65, y+100);
        ctx.stroke();
        ctx.strokeRect(x+40, y+25, 50, 50);
    },

    drawContactless: function(ctx, x, y) {
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(x, y, 10, -Math.PI/2, Math.PI/2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 25, -Math.PI/2.5, Math.PI/2.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 40, -Math.PI/3, Math.PI/3); ctx.stroke();
    },

    addNoise: function(ctx, w, h) {
        const idata = ctx.getImageData(0, 0, w, h);
        const buffer32 = new Uint32Array(idata.data.buffer);
        for (let i = 0; i < buffer32.length; i++) {
            if (Math.random() < 0.5) {
                const val = Math.random() < 0.5 ? -5 : 5;
                buffer32[i] = ((buffer32[i] & 0xff000000) | ((buffer32[i] & 0x00ffffff) + (val * 0x010101)));
            }
        }
        ctx.putImageData(idata, 0, 0);
    },

    animate: function() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    },

    onResize: function() {
        if (!this.container || !this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    downloadSnapshot: function() {
        if (!this.renderer) return;
        this.renderer.render(this.scene, this.camera);
        const dataURL = this.renderer.domElement.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = 'QuizPro_GoldCard.png';
        link.href = dataURL;
        link.click();
    },

    // --- DOWNLOAD GLTF/GLB (Ottimizzato con feedback) ---
    downloadGLTF: function(btnElement) {
        if (!this.cardGroup) return;
        if (typeof THREE.GLTFExporter === 'undefined') {
            alert("Errore: Libreria esportazione non caricata.");
            return;
        }

        // Feedback visivo immediato
        const originalText = btnElement ? btnElement.innerText : "Scarica 3D";
        if(btnElement) {
            btnElement.innerText = "Esportazione...";
            btnElement.disabled = true;
        }
        
        // Timeout per permettere alla UI di aggiornarsi prima del calcolo pesante
        setTimeout(() => {
            try {
                const exporter = new THREE.GLTFExporter();
                exporter.parse(
                    this.cardGroup,
                    function (gltf) {
                        const output = JSON.stringify(gltf, null, 2);
                        const blob = new Blob([output], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = url;
                        link.download = 'QuizPro_GoldCard.gltf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);

                        // Ripristina bottone
                        if(btnElement) {
                            btnElement.innerText = originalText;
                            btnElement.disabled = false;
                        }
                    },
                    { binary: false }
                );
            } catch(e) {
                console.error(e);
                if(btnElement) btnElement.innerText = "Errore";
            }
        }, 50);
    },

    dispose: function() {
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onResize);
        if (this.renderer) {
            this.renderer.dispose();
            this.container.innerHTML = '';
        }
        this.scene = null;
        this.camera = null;
        this.controls = null;
    }
};
