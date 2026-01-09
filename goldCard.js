/**
 * GESTORE CARD 3D GOLD (Luxury Edition v4.0)
 * Fixes: Z-Fighting (Empty Card), Brushed Metal Texture, Async Download
 */
console.log("GoldCardManager v4.0 loaded");

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

        this.scene = new THREE.Scene();
        this.scene.background = null;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 0, 14);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true, 
            preserveDrawingBuffer: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        this.container.innerHTML = ''; 
        this.container.appendChild(this.renderer.domElement);

        // LUCI STUDIO
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xfff0dd, 1.2);
        mainLight.position.set(5, 5, 10);
        this.scene.add(mainLight);

        const rimLight = new THREE.SpotLight(0xffd700, 2.0);
        rimLight.position.set(-5, 10, -10);
        rimLight.lookAt(0,0,0);
        this.scene.add(rimLight);

        const cameraLight = new THREE.PointLight(0xffeeb1, 0.6);
        this.camera.add(cameraLight);
        this.scene.add(this.camera);

        this.createLuxuryCard(userData);

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

        // 1. GEOMETRIA CORPO
        const width = 8.56;
        const height = 5.398;
        const radius = 0.5;
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
            bevelSegments: 5,
            bevelSize: 0.1,
            bevelThickness: 0.1,
            curveSegments: 24
        };

        const geometryBody = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometryBody.center(); // CENTRA LA GEOMETRIA (Cruciale per la rotazione)
        geometryBody.computeBoundingBox(); // Calcola i limiti per posizionare la texture
        const maxZ = geometryBody.boundingBox.max.z;
        
        const materialGold = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.9,
            roughness: 0.3,
            side: THREE.DoubleSide
        });

        const bodyMesh = new THREE.Mesh(geometryBody, materialGold);
        this.cardGroup.add(bodyMesh);

        // 2. GEOMETRIA FACCIA (Texture)
        const geometryFace = new THREE.ShapeGeometry(shape, 24);
        const texture = this.createCardTexture(user);
        
        const materialFace = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            metalness: 0.6,
            roughness: 0.4
        });

        const faceMesh = new THREE.Mesh(geometryFace, materialFace);
        // POSIZIONAMENTO SICURO: Appena sopra il punto più alto del corpo
        faceMesh.position.z = maxZ + 0.01; 
        this.cardGroup.add(faceMesh);

        this.scene.add(this.cardGroup);
    },

    createCardTexture: function(user) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 646;
        const ctx = canvas.getContext('2d');

        // Sfondo Oro
        const grd = ctx.createLinearGradient(0, 0, 1024, 646);
        grd.addColorStop(0, "#b88a4d");
        grd.addColorStop(0.4, "#fdfcbf");
        grd.addColorStop(0.6, "#d4af37");
        grd.addColorStop(1, "#8a6e2f");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 1024, 646);

        // EFFETTO SPAZZOLATURA METALLICA
        this.addBrushedMetalEffect(ctx, 1024, 646);
        this.addNoise(ctx, 1024, 646);

        // Bordo
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 6;
        ctx.strokeRect(30, 30, 964, 586);

        // Chip & Contactless
        this.drawChip(ctx, 90, 220);
        this.drawContactless(ctx, 900, 323);

        // TESTI
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.font = "800 48px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.textAlign = "right";
        ctx.fillText("UTENTE GOLD", 960, 90);

        ctx.textAlign = "left";
        ctx.font = "600 55px 'Courier New', monospace";
        ctx.fillStyle = "#1d1d1f";
        ctx.shadowColor = "rgba(255,255,255,0.3)";
        ctx.fillText(user.name.toUpperCase(), 90, 420);

        ctx.font = "600 24px 'Helvetica Neue', sans-serif";
        ctx.fillStyle = "#333";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.font = "500 20px 'Helvetica Neue', sans-serif";
        ctx.fillText("ID UTENTE", 90, 540);
        ctx.fillText("ISCRITTO DAL", 380, 540);

        ctx.font = "700 32px 'Courier New', monospace";
        ctx.fillStyle = "#000";
        ctx.fillText(user.id, 90, 580);
        ctx.fillText(user.date, 380, 580);

        // QR CODE
        const qr = new QRious({
            value: window.location.href,
            size: 170,
            backgroundAlpha: 0,
            foreground: '#1d1d1f'
        });
        ctx.drawImage(qr.canvas, 800, 430);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    },

    addBrushedMetalEffect: function(ctx, w, h) {
        // Disegna migliaia di linee sottili orizzontali per l'effetto spazzolato
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.globalCompositeOperation = 'overlay';
        for (let i = 0; i < 3000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            const y = Math.random() * h;
            const height = Math.random() * 2;
            const width = Math.random() * w;
            const x = Math.random() * w;
            ctx.fillRect(x, y, width, height);
        }
        ctx.restore();
    },

    drawChip: function(ctx, x, y) {
        ctx.fillStyle = "#e0e0e0";
        ctx.beginPath();
        ctx.roundRect(x, y, 140, 110, 15);
        ctx.fill();
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Dettagli chip
        ctx.beginPath();
        ctx.moveTo(x, y+55); ctx.lineTo(x+140, y+55);
        ctx.moveTo(x+70, y); ctx.lineTo(x+70, y+110);
        ctx.stroke();
        ctx.strokeRect(x+45, y+30, 50, 50);
    },

    drawContactless: function(ctx, x, y) {
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(x, y, 15, -Math.PI/2, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 35, -Math.PI/2.2, 0.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 55, -Math.PI/2.5, 0.4); ctx.stroke();
    },

    addNoise: function(ctx, w, h) {
        const idata = ctx.getImageData(0, 0, w, h);
        const buffer32 = new Uint32Array(idata.data.buffer);
        for (let i = 0; i < buffer32.length; i++) {
            if (Math.random() < 0.15) {
                const val = Math.random() < 0.5 ? -10 : 10;
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

    // --- DOWNLOAD PNG ASINCRONO (Non blocca il PC) ---
    downloadSnapshot: function(btnElement) {
        if (!this.renderer) return;
        
        const originalText = btnElement ? btnElement.innerText : "Salva Foto";
        if(btnElement) { btnElement.innerText = "Elaborazione..."; btnElement.disabled = true; }

        // Renderizza un frame fresco
        this.renderer.render(this.scene, this.camera);
        
        // Usa toBlob invece di toDataURL per non bloccare il main thread
        this.renderer.domElement.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'QuizPro_GoldCard.png';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            if(btnElement) { btnElement.innerText = originalText; btnElement.disabled = false; }
        }, 'image/png');
    },

    // --- DOWNLOAD GLTF (Con controlli) ---
    downloadGLTF: function(btnElement) {
        if (!this.cardGroup) return;
        if (typeof THREE.GLTFExporter === 'undefined') {
            alert("Errore: Libreria esportazione non caricata.");
            return;
        }

        const originalText = btnElement ? btnElement.innerText : "Scarica 3D";
        if(btnElement) { btnElement.innerText = "Esportazione..."; btnElement.disabled = true; }
        
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

                        if(btnElement) { btnElement.innerText = originalText; btnElement.disabled = false; }
                    },
                    { binary: false }
                );
            } catch(e) {
                console.error(e);
                if(btnElement) { btnElement.innerText = "Errore"; btnElement.disabled = false; }
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
